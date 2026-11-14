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
