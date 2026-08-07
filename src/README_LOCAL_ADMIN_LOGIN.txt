BUSINESS PLAN — LOCAL ADMIN LOGIN

Copy these files into src and replace the existing files:

- App.jsx
- main.jsx
- PhotographerApp.jsx
- supabaseClient.js
- auth/AuthPortal.jsx

Temporary localhost-only admin credentials:

Email: ramazanesen23@gmail.com
Password: Rms3354lv

What happens:
- On localhost, these credentials open the Admin Dashboard.
- The Admin Dashboard includes user list, pending/approved/suspended filters,
  one-year approval, one-year extension, workspace assignment and suspend actions.
- Other valid Supabase users still use the normal authentication flow.
- Sign Out clears the temporary local admin session.
- This bypass does not work on Vercel/production.

Important:
Remove this temporary local bypass before production.
