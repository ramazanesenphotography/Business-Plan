BUSINESS PLAN — AUTH / ADMIN / TEACHER V1

COPY INTO src:
- App.jsx
- main.jsx
- PhotographerApp.jsx
- supabaseClient.js
- auth/AuthPortal.jsx

Keep your existing files:
- DashboardPage.jsx
- CalendarPage.jsx
- ClientsPage.jsx
- ReportsPage.jsx
- all test pages
- components folder
- assets folder
- index.css

WHAT THIS VERSION ADDS
1. Sign In
2. Register
3. Email verification message
4. Password reset email
5. Pending administrator approval screen
6. Subscription expiry screen
7. Workspace selection: Photographer / Teacher
8. Admin dashboard
9. Admin approve for one year
10. Admin extend one year
11. Admin suspend user
12. Admin change workspace
13. Existing Business Plan becomes Photographer Workspace
14. Basic Teacher Workspace prototype
15. Sign Out

TEST ACCOUNTS
Admin:
ramazanesen23@gmail.com

Photographer:
photo@ramazanesen.com

Passwords remain whatever you previously created in Supabase Auth.
If you do not know a password, use Forgot password.

RUN
npm install
npm run dev

IMPORTANT
This is the authentication and workspace-routing test version.
Your current shoots/clients data isolation by user is NOT included yet.
Before selling the application, the next database step must add owner_id/workspace_id
and RLS policies so different customers cannot see each other's records.
