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
