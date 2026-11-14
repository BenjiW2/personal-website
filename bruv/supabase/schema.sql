-- Quandamooka BRUV Workshop: database schema for Supabase (Postgres)
-- Paste this whole file into Supabase > SQL Editor > New query, then Run.
-- Safe to re-run: it only creates things that don't exist yet.

-- ---------------------------------------------------------------------------
-- Workshop setup tables (organisers fill these in; students can only read)
-- ---------------------------------------------------------------------------

create table if not exists bruv_sites (
  station     text primary key,          -- e.g. 'MG1'
  habitat     text not null check (habitat in ('Mangrove','Seagrass','Coral Reef')),
  site        text,                      -- place name, e.g. 'Myora'
  lat         double precision,
  lon         double precision,
  depth_m     double precision,
  description text
);

create table if not exists bruv_videos (
  video_id    text primary key,          -- e.g. 'MG1_A_1'
  station     text not null references bruv_sites(station) on update cascade,
  drop_id     text,                      -- videos cut from one recording share a drop_id
  label       text,                      -- shown in the video dropdown
  url         text not null,             -- YouTube, Google Drive, Vimeo or a direct .mp4 link
  notes       text
);

create table if not exists bruv_assignments (
  group_name  text not null,             -- e.g. 'Group 1'
  pair_name   text not null,             -- e.g. 'Alex & Sam'
  video_id    text not null references bruv_videos(video_id) on update cascade on delete cascade,
  primary key (group_name, pair_name, video_id)
);

-- ---------------------------------------------------------------------------
-- Student data
-- ---------------------------------------------------------------------------

-- One row per (student/group, video). Re-submitting replaces the earlier entry.
create table if not exists bruv_submissions (
  id          bigint generated always as identity primary key,
  student     text not null check (length(student) between 1 and 80),
  video_id    text not null references bruv_videos(video_id) on update cascade on delete cascade,
  counts      jsonb not null default '{}'::jsonb,  -- {"species_id": MaxN, ...} (non-zero only)
  other       jsonb not null default '{}'::jsonb,  -- {"Other species name": MaxN, ...}
  notes       text,
  updated_at  timestamptz not null default now(),
  unique (student, video_id)
);

-- Names typed into "Other species", shared as suggestions with every group
create table if not exists bruv_other_species (
  name        text primary key check (length(name) between 1 and 80),
  hidden      boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists bruv_submissions_video_idx on bruv_submissions(video_id);

-- ---------------------------------------------------------------------------
-- Row level security: anyone with the public (anon) key can read everything,
-- add/replace their own submissions and suggest other-species names.
-- Setup tables can only be edited from the Supabase dashboard.
-- ---------------------------------------------------------------------------
alter table bruv_sites         enable row level security;
alter table bruv_videos        enable row level security;
alter table bruv_assignments   enable row level security;
alter table bruv_submissions   enable row level security;
alter table bruv_other_species enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'bruv_sites' and policyname = 'read sites') then
    create policy "read sites"         on bruv_sites         for select using (true);
    create policy "read videos"        on bruv_videos        for select using (true);
    create policy "read assignments"   on bruv_assignments   for select using (true);
    create policy "read submissions"   on bruv_submissions   for select using (true);
    create policy "insert submissions" on bruv_submissions   for insert with check (true);
    create policy "update submissions" on bruv_submissions   for update using (true) with check (true);
    create policy "read other"         on bruv_other_species for select using (true);
    create policy "insert other"       on bruv_other_species for insert with check (true);
    create policy "update other"       on bruv_other_species for update using (true) with check (true);
  end if;
end $$;

-- Keep updated_at current on re-submission
create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;
drop trigger if exists bruv_submissions_touch on bruv_submissions;
create trigger bruv_submissions_touch before update on bruv_submissions
  for each row execute function touch_updated_at();

-- To clear student data after a practice run (run manually):
--   truncate bruv_submissions; truncate bruv_other_species;
-- Only way for the public key to change data: bruv_submit() (the Enter data tab's Submit button).
-- Tables stay readable by everyone (live Database tab) but cannot be written directly.
create or replace function bruv_submit(p_student text, p_video_id text, p_counts jsonb, p_other jsonb, p_notes text)
returns void language plpgsql security definer set search_path = public as $$
declare
  k text; v jsonb; clean_counts jsonb := '{}'::jsonb; clean_other jsonb := '{}'::jsonb; n numeric;
begin
  p_student := btrim(coalesce(p_student, ''));
  if length(p_student) < 1 or length(p_student) > 80 then raise exception 'Name must be 1-80 characters'; end if;
  if not exists (select 1 from bruv_videos where video_id = p_video_id) then raise exception 'Unknown video'; end if;
  if jsonb_typeof(coalesce(p_counts, '{}')) <> 'object' or jsonb_typeof(coalesce(p_other, '{}')) <> 'object' then raise exception 'Bad counts'; end if;
  for k, v in select * from jsonb_each(coalesce(p_counts, '{}')) loop
    if jsonb_typeof(v) <> 'number' or k !~ '^[a-z_]{3,60}$' then raise exception 'Bad count for %', k; end if;
    n := (v #>> '{}')::numeric;
    if n < 0 or n > 100000 or n <> floor(n) then raise exception 'MaxN must be a whole number 0-100000'; end if;
    if n > 0 then clean_counts := clean_counts || jsonb_build_object(k, n); end if;
  end loop;
  if (select count(*) from jsonb_object_keys(coalesce(p_other, '{}'))) > 20 then raise exception 'Too many other species'; end if;
  for k, v in select * from jsonb_each(coalesce(p_other, '{}')) loop
    k := btrim(k);
    if length(k) < 1 or length(k) > 80 or jsonb_typeof(v) <> 'number' then raise exception 'Bad other species'; end if;
    n := (v #>> '{}')::numeric;
    if n < 0 or n > 100000 or n <> floor(n) then raise exception 'MaxN must be a whole number 0-100000'; end if;
    if n > 0 then clean_other := clean_other || jsonb_build_object(k, n); end if;
  end loop;
  insert into bruv_submissions (student, video_id, counts, other, notes)
  values (p_student, p_video_id, clean_counts, clean_other, nullif(left(btrim(coalesce(p_notes, '')), 2000), ''))
  on conflict (student, video_id) do update set counts = excluded.counts, other = excluded.other, notes = excluded.notes;
  insert into bruv_other_species (name) select jsonb_object_keys(clean_other) on conflict do nothing;
end $$;
revoke all on function bruv_submit(text, text, jsonb, jsonb, text) from public;
grant execute on function bruv_submit(text, text, jsonb, jsonb, text) to anon, authenticated;

drop policy if exists "insert submissions" on bruv_submissions;
drop policy if exists "update submissions" on bruv_submissions;
drop policy if exists "insert other"       on bruv_other_species;
drop policy if exists "update other"       on bruv_other_species;
revoke insert, update, delete, truncate on bruv_sites, bruv_videos, bruv_assignments, bruv_submissions, bruv_other_species from anon, authenticated;
