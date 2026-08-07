Extract this ZIP directly into the project's src folder.

Files included:
- CalendarPage.jsx
- components/dashboard/DashboardComponents.jsx

Calendar changes:
- Delivery Links is now a clearly labelled block in both New Shoot and Edit Shoot.
- Drive, Gallery, Invoice and Contract URLs are saved and restored.
- The modal body scrolls, while the title and Save buttons stay visible.
- Planned / Confirmed / In Progress jobs appear first, nearest date first.
- Completed / Cancelled jobs appear below, most recent date first.

Dashboard changes:
- The real DashboardStatCard component was fixed.
- Currency and amount are rendered separately.
- Full values appear at browser zoom 100%; no TR... ellipsis.
- Card spacing and number sizing are reduced without changing the dashboard layout.

Important:
The DashboardComponents.jsx file must go inside:
src/components/dashboard/DashboardComponents.jsx
