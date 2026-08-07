BUSINESS PLAN — TEMPORARY LOCAL DIRECT LOGIN

Copy these files into src and replace existing files:
- App.jsx
- main.jsx
- PhotographerApp.jsx
- supabaseClient.js
- auth/AuthPortal.jsx

Temporary localhost-only credentials:
Email: ramazanesen23@gmail.com
Password: Rms3354lv

Behavior:
- Works only on localhost or 127.0.0.1.
- Opens the Photographer workspace directly without email delivery.
- The session is stored only in localStorage for local testing.
- Sign Out removes the local test access.
- It does NOT work on Vercel/production.

Security:
Remove this temporary bypass before publishing or selling the application.
The real Supabase login flow remains available for every other account.
