# Backend setup notes (not yet connected to the website)

The current site is a static front-end demo. To deliver replies across devices, configure a real backend.

1. Create a Supabase project.
2. Open the SQL Editor and run `schema.sql`.
3. Configure real user authentication in Supabase; the current login/signup forms are only a demo and do not authenticate users.
4. Add a secure server-side endpoint (recommended: Supabase Edge Function) for public reply submissions. It must validate shareable confession IDs, limit submission frequency, validate text, apply spam/moderation controls, and insert replies safely.
5. Connect the frontend using the Supabase project URL and publishable/anon key only. Never place a service-role key in frontend JavaScript.
6. Add production policies, retention/deletion rules, privacy disclosures, and tests before launch.

The SQL is a starting point, not a complete production backend. Direct anonymous reply insertion is intentionally not enabled. Until an Edge Function/server endpoint and real authentication are configured, the UI must not claim that a reply has been delivered to the owner.
