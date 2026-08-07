BUSINESS PLAN — SAAS V2

Copy these files/folders into src and replace existing ones:

- App.jsx
- main.jsx
- PhotographerApp.jsx
- supabaseClient.js
- auth/AuthPortal.jsx

Keep all existing photographer pages, components and assets.

V2 includes:
- Sign In
- Register
- Email verification flow
- Forgot Password request
- PASSWORD_RECOVERY event handling
- New Password screen
- Admin approval screen
- Admin user management
- One-year approve / extend
- Suspend account
- Workspace assignment
- Photographer workspace
- Teacher workspace prototype
- Subscription expiry control
- Sign Out

Important:
The reset email must redirect to an allowed URL in Supabase:
http://localhost:5173/**
https://business-plan-rho.vercel.app/**

After copying:
npm run dev

Then test:
1. Open login page.
2. Enter admin email.
3. Press Forgot password.
4. Open the recovery email.
5. The application must show Create a new password.
6. Save the password and sign in.

NEXT SECURITY PHASE:
Add owner_id/workspace_id to clients and shoots and enable tenant RLS before selling the system.
