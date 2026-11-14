// ---------------------------------------------------------------------------
// Site settings. This is the only file you need to edit to connect the database.
// ---------------------------------------------------------------------------
window.BRUV_CONFIG = {
  title: 'Quandamooka BRUV Workshop',

  // Supabase > Project Settings > API. Leave both empty to run in local demo
  // mode, where data is kept only in this browser.
  // The anon key is meant to be public; row level security in
  // supabase/schema.sql controls what it can do.
  supabaseUrl: '',
  supabaseAnonKey: '',

  // How often (seconds) everyone's entries are re-fetched for Graphs/Data/Assignments
  refreshSeconds: 20,

  // Optional second logo shown at the right of the navbar (e.g. 'icons/partner.png')
  partnerLogo: ''
};
