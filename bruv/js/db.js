// Data layer: Supabase REST (PostgREST) when configured, otherwise localStorage.
(function () {
  const cfg = window.BRUV_CONFIG || {};
  const remote = !!(cfg.supabaseUrl && cfg.supabaseAnonKey);

  // ---------------- Supabase over plain fetch ----------------
  const base = remote ? cfg.supabaseUrl.replace(/\/+$/, '') + '/rest/v1/' : '';
  const headers = remote ? {
    apikey: cfg.supabaseAnonKey,
    'Content-Type': 'application/json',
    // Legacy anon keys are JWTs and also go in Authorization; new sb_publishable_ keys must not.
    ...(cfg.supabaseAnonKey.startsWith('eyJ') ? { Authorization: 'Bearer ' + cfg.supabaseAnonKey } : {})
  } : {};

  async function req(path, opts = {}, attempt = 0) {
    let res;
    try {
      res = await fetch(base + path, { ...opts, headers: { ...headers, ...(opts.headers || {}) } });
    } catch (e) {
      if (attempt < 3) { await sleep(500 * 2 ** attempt + Math.random() * 300); return req(path, opts, attempt + 1); }
      throw new Error('Network error, check your connection and try again.');
    }
    if ((res.status === 429 || res.status >= 500) && attempt < 3) {
      await sleep(500 * 2 ** attempt + Math.random() * 300);
      return req(path, opts, attempt + 1);
    }
    if (!res.ok) {
      let msg = res.status + ' ' + res.statusText;
      try { const j = await res.json(); msg = j.message || j.hint || msg; } catch (e) {}
      throw new Error(msg);
    }
    if (res.status === 204) return null;
    const txt = await res.text();
    return txt ? JSON.parse(txt) : null;
  }
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // Fetch every row (PostgREST pages at 1000 by default)
  async function all(table, query = '') {
    const out = [];
    for (let from = 0; ; from += 1000) {
      const rows = await req(`${table}?select=*${query}`, { headers: { Range: `${from}-${from + 999}` } });
      out.push(...rows);
      if (rows.length < 1000) return out;
    }
  }

  const Remote = {
    mode: 'supabase',
    async loadSetup() {
      const [sites, videos, assignments] = await Promise.all([
        all('bruv_sites', '&order=habitat,station'), all('bruv_videos', '&order=station,video_id'), all('bruv_assignments', '&order=group_name,pair_name,video_id')
      ]);
      return { sites, videos, assignments };
    },
    loadSubmissions: () => all('bruv_submissions', '&order=updated_at'),
    loadOther: () => all('bruv_other_species', '&order=name'),
    // The only write the public key is allowed: a validated upsert via the bruv_submit() function.
    async saveSubmission(s) {
      await req('rpc/bruv_submit', {
        method: 'POST', headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ p_student: s.student, p_video_id: s.video_id, p_counts: s.counts, p_other: s.other, p_notes: s.notes || '' })
      });
    },
    async addOther() {},   // saved with the submission
  };

  // ---------------- Local demo mode ----------------
  const K = 'bruv_demo_';
  const get = (k, d) => { try { return JSON.parse(localStorage.getItem(K + k)) ?? d; } catch (e) { return d; } };
  const put = (k, v) => { try { localStorage.setItem(K + k, JSON.stringify(v)); } catch (e) {} };

  const Local = {
    mode: 'local',
    async loadSetup() { return JSON.parse(JSON.stringify(window.DEMO_SETUP)); },
    async loadSubmissions() { return get('submissions', (window.DEMO_SUBMISSIONS || []).map((x, i) => ({ ...x, id: i + 1, updated_at: '2026-11-14T00:00:00Z' }))); },
    async loadOther() { return get('other', []); },
    async saveSubmission(s) {
      const subs = await Local.loadSubmissions();
      const i = subs.findIndex(x => x.student === s.student && x.video_id === s.video_id);
      const row = { ...s, updated_at: new Date().toISOString(), id: i >= 0 ? subs[i].id : Date.now() };
      if (i >= 0) subs[i] = row; else subs.push(row);
      put('submissions', subs);
    },
    async addOther(name) {
      const o = get('other', []);
      const r = o.find(x => x.name.toLowerCase() === name.toLowerCase());
      if (r) r.hidden = false; else o.push({ name, hidden: false });
      put('other', o);
    },
    async hideOther(name) {
      const o = get('other', []);
      const r = o.find(x => x.name === name); if (r) r.hidden = true;
      put('other', o);
    }
  };

  window.DB = remote ? Remote : Local;
})();
