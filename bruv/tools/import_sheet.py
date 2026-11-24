#!/usr/bin/env python3
"""Turn the 'BRUV workshop backup datasheet' (.xlsx export from Google Sheets)
into supabase/seed.sql: stations, videos (with Drive links), group/pair
assignments, and any MaxN rows already typed into the sheet.

Usage: python3 tools/import_sheet.py path/to/sheet.xlsx > supabase/seed.sql
Re-running is safe: setup rows are upserted; sheet entries never overwrite
entries made in the app.
"""
import json, re, sys, zipfile, xml.etree.ElementTree as ET
from html import unescape

NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
RID = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id'

def read_sheet(path, name):
    z = zipfile.ZipFile(path)
    shared = []
    if 'xl/sharedStrings.xml' in z.namelist():
        for si in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('m:si', NS):
            shared.append(''.join(t.text or '' for t in si.iter('{%s}t' % NS['m'])))
    wb = ET.fromstring(z.read('xl/workbook.xml'))
    rels = ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
    rid = next(s.get(RID) for s in wb.find('m:sheets', NS) if s.get('name') == name)
    target = next(r.get('Target') for r in rels if r.get('Id') == rid)
    ws = ET.fromstring(z.read('xl/' + target.lstrip('/').replace('xl/', '')))
    rows = []
    for r in ws.find('m:sheetData', NS):
        row = {}
        for c in r:
            col = re.match(r'[A-Z]+', c.get('r')).group()
            idx = 0
            for ch in col: idx = idx * 26 + ord(ch) - 64
            f, v = c.find('m:f', NS), c.find('m:v', NS)
            is_ = c.find('m:is', NS)
            val = v.text if v is not None else (''.join(t.text or '' for t in is_.iter('{%s}t' % NS['m'])) if is_ is not None else '')
            if c.get('t') == 's' and val != '': val = shared[int(val)]
            if f is not None and f.text and 'HYPERLINK' in f.text:
                m = re.search(r'HYPERLINK\("([^"]+)"', unescape(f.text))
                if m: val = m.group(1)
            row[idx - 1] = val
        if row:
            rows.append([row.get(i, '') for i in range(max(row) + 1)])
    return rows

def q(v):
    if v is None or v == '': return 'null'
    if isinstance(v, (int, float)): return repr(v)
    return "'" + str(v).replace("'", "''") + "'"

def num(v):
    try:
        n = float(str(v).strip())
        return int(n) if n == int(n) else n
    except ValueError:
        return None

def main(path):
    species = read_sheet(path, 'Species')
    sp_by_sci = {r[1].strip().lower(): r[3].strip() for r in species[1:] if len(r) > 3 and r[3]}
    sp_by_common = {r[0].strip().lower(): r[3].strip() for r in species[1:] if len(r) > 3 and r[3]}
    # Species added to the sheet but missing from the Species tab
    sp_by_sci['glaucostegus typus'] = 'glaucostegus_typus'

    rows = read_sheet(path, 'Data entry')
    head, sci = rows[0], rows[1]
    body = [r + [''] * (len(head) - len(r)) for r in rows[2:]]
    H = {h: i for i, h in enumerate(head)}
    first_sp = H['Link'] + 1
    other_cols = [(H[f'Other species {k}'], H[f'Other {k} MaxN']) for k in (1, 2, 3) if f'Other species {k}' in H]
    notes_col = H.get('Notes')
    sp_cols = []
    for i in range(first_sp, min(c for c, _ in other_cols)):
        sid = sp_by_sci.get((sci[i] if i < len(sci) else '').strip().lower()) or sp_by_common.get(head[i].strip().lower())
        sp_cols.append((i, sid, head[i].strip()))

    fix_hab = {'mangrove': 'Mangrove', 'seagrass': 'Seagrass', 'coral reef': 'Coral Reef'}
    sites, videos, asg, subs = {}, {}, [], []
    for r in body:
        vfile = r[H['Video']].strip()
        if not vfile: continue
        station = r[H['Station']].strip()
        hab = fix_hab.get(r[H['Habitat']].strip().lower())
        if station and hab: sites.setdefault(station, hab)
        vid = re.sub(r'\.mp4$', '', vfile, flags=re.I)
        drop = r[H['Drop']].strip()
        m = re.search(r'(GX\d+)_part(\d+)of(\d+)', vid)
        length = num(r[H['Length (min)']])
        label = ' · '.join(x for x in [drop, m and f'{m.group(1)} part {m.group(2)} of {m.group(3)}', length and f'{length} min'] if x)
        videos[vid] = dict(video_id=vid, station=station, drop_id=f'{station} {drop}'.strip(), label=label or vid,
                           url=r[H['Link']].strip(), notes=' · '.join(x for x in [r[H['Date']].strip() and 'Recorded ' + r[H['Date']].strip(), vfile] if x))
        group, pair, names = r[H['Group']].strip(), r[H['Pair']].strip(), r[H['Student names']].strip()
        if group and pair:
            asg.append((group, f'{pair} ({names})' if names else pair, vid))
        counts, other = {}, {}
        for i, sid, label_ in sp_cols:
            n = num(r[i])
            if n and n > 0:
                if sid: counts[sid] = n
                else: other[label_] = n
        for nc, mc in other_cols:
            name, n = r[nc].strip(), num(r[mc])
            if not name: continue
            if num(name) is not None and n is None:   # MaxN typed into the name column
                n, name = num(name), 'Unnamed other species'
            if n and n > 0: other[name] = n
        notes = r[notes_col].strip() if notes_col is not None else ''
        if counts or other or notes:
            subs.append(dict(student=names or f'{group} {pair}'.strip() or 'Backup sheet', video_id=vid, counts=counts, other=other,
                             notes=('[from backup sheet] ' + notes).strip()))

    out = ['-- Generated by tools/import_sheet.py. Run in Supabase SQL Editor after schema.sql.', 'begin;']
    for st, hab in sorted(sites.items()):
        out.append(f"insert into bruv_sites (station, habitat, site) values ({q(st)}, {q(hab)}, {q(st)}) "
                   f"on conflict (station) do update set habitat = excluded.habitat;")
    for v in videos.values():
        out.append(f"insert into bruv_videos (video_id, station, drop_id, label, url, notes) values ({q(v['video_id'])}, {q(v['station'])}, {q(v['drop_id'])}, {q(v['label'])}, {q(v['url'])}, {q(v['notes'])}) "
                   f"on conflict (video_id) do update set station = excluded.station, drop_id = excluded.drop_id, label = excluded.label, url = excluded.url, notes = excluded.notes;")
    out.append('delete from bruv_assignments;')
    for g, p, v in asg:
        out.append(f"insert into bruv_assignments (group_name, pair_name, video_id) values ({q(g)}, {q(p)}, {q(v)}) on conflict do nothing;")
    for s in subs:
        out.append(f"insert into bruv_submissions (student, video_id, counts, other, notes) values ({q(s['student'])}, {q(s['video_id'])}, {q(json.dumps(s['counts']))}::jsonb, {q(json.dumps(s['other']))}::jsonb, {q(s['notes'])}) "
                   f"on conflict (student, video_id) do nothing;")
    for name in sorted({k for s in subs for k in s['other']}):
        out.append(f"insert into bruv_other_species (name) values ({q(name)}) on conflict do nothing;")
    out.append('commit;')
    print('\n'.join(out))
    print(f'-- {len(sites)} stations, {len(videos)} videos, {len(asg)} assignments, {len(subs)} sheet entries', file=sys.stderr)
    # Also emit JSON for the offline demo mode
    if len(sys.argv) > 2:
        json.dump(dict(sites=[dict(station=k, habitat=v, site=k) for k, v in sorted(sites.items())], videos=list(videos.values()),
                       assignments=[dict(group_name=g, pair_name=p, video_id=v) for g, p, v in asg], submissions=subs),
                  open(sys.argv[2], 'w'), indent=1)

if __name__ == '__main__':
    main(sys.argv[1])
