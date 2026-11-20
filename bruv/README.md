# Quandamooka BRUV Workshop app

Static site (served at benjiwarburton.com/bruv) + Supabase Postgres for shared data.
No server code, so 40+ simultaneous users is no problem.

## Connect the database (one-off, ~3 min)
1. supabase.com → New project (free tier is fine). Wait for it to finish setting up.
2. SQL Editor → New query → paste **`setup_all.sql`** (kept out of the public repo
   because it contains student names; it's in `~/Documents/BRUV/bruv-app/supabase/`) → Run.
   It creates the `bruv_*` tables and loads the 5 stations, 160 videos, group/pair
   assignments and the 27 entries already typed into the backup sheet.
3. Project Settings → API: copy the **Project URL** and **publishable/anon key** into
   `js/config.js` (`supabaseUrl`, `supabaseAnonKey`), then commit + push.

Without step 3 the app runs in offline mode (entries stay in each browser).

## During / after the workshop
- Supabase → Table Editor → `bruv_submissions` shows every entry live; Data tab has CSV downloads.
- Re-import newer backup-sheet rows: export the Google Sheet as .xlsx, then
  `python3 tools/import_sheet.py sheet.xlsx > seed.sql` and run seed.sql in the SQL Editor
  (never overwrites entries made in the app).
- Clear practice data: `truncate bruv_submissions; truncate bruv_other_species;`
- ID notes for the guide: add `features` text per species in `js/species.js`.
