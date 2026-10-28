# ShiftPay — Frontend Architecture

## Folder map

```
src/
├── main.tsx                  Entry point: Router + AppStateProvider + global CSS
│
├── app/                      App shell: things that glue pages together
│   ├── App.tsx               Top-level <Routes>, global modals, Canvas mode switch
│   ├── paths.ts              ALL URLs (PATHS.owner.team, ...) + role helpers
│   ├── navigation.ts         Sidebar menu for every role (label, icon, URL)
│   ├── routes.tsx            URL → page component table
│   ├── AppStateProvider.tsx  Shared state (venues, shifts, adjustments, open modals)
│   ├── layouts/
│   │   ├── DashboardLayout   Sidebar + page area (wraps every /employee, /admin, /owner page)
│   │   └── AppSidebar        Connects the shared Sidebar to navigation.ts
│   └── dev/
│       ├── DevToolbar        Floating role switcher + "Figma Canvas" button
│       └── CanvasView        Figma Canvas mode (screens side by side)
│
├── features/                 Pages, grouped by who uses them
│   ├── auth/LoginPage/
│   ├── system/NotFoundPage/
│   ├── employee/
│   │   ├── EmployeeHomePage/       /employee
│   │   ├── EmployeeArchivePage/    /employee/archive   (+ PayslipModal)
│   │   ├── EmployeeProfilePage/    /employee/settings
│   │   └── SubmitShiftModal/       "Подати зміну" modal
│   ├── admin/
│   │   ├── AdminShiftRegisterPage/ /admin
│   │   ├── AdminAdjustmentsPage/   /admin/adjustments
│   │   ├── AdminWorkersPage/       /admin/workers
│   │   └── AdminSettingsPage/      /admin/settings
│   └── owner/
│       ├── OwnerVenuesPage/        /owner              (+ AddVenueModal)
│       ├── OwnerTeamPage/          /owner/team         (+ InviteModal)
│       ├── OwnerShiftsPage/        /owner/shifts       (+ PayoutModal)
│       ├── OwnerAnalyticsPage/     /owner/analytics
│       ├── OwnerSettingsPage/      /owner/settings
│       └── OwnerSupportPage/       /owner/support
│
├── shared/                   Reusable pieces with no page-specific logic
│   ├── ui/                   Modal, ConfirmDialog, Toggle, CustomSelect, CustomDatePicker, Icon, FakeQrCode
│   ├── layout/               Sidebar, Header, PageHeader, NotificationsPopover
│   ├── styles/               global.css (colors, fonts) + page.module.css (cards, tables, forms, badges)
│   ├── constants/options.ts  Dropdown option lists (roles, venue types, periods...)
│   └── lib/format.ts         Helpers: formatUAH, getInitials, payslipNet
│
├── types/                    TypeScript shapes of the data (Venue, TeamMember, PayrollShift...)
└── mocks/                    Fake data, one file per topic. Replace with API calls later.
```

## Where do I find…

| I want to change…                     | Open                                                |
| ------------------------------------- | --------------------------------------------------- |
| A page                                | `features/<role>/<PageName>Page/<PageName>Page.tsx` |
| A page's styles                       | The `.module.css` file in the same folder           |
| A modal that belongs to one page      | Same folder as the page (`InviteModal.tsx`, ...)    |
| A sidebar item (text, icon, order)    | `app/navigation.ts`                                 |
| A URL                                 | `app/paths.ts`                                      |
| Which page opens on which URL         | `app/routes.tsx`                                    |
| Demo data (names, shifts, payslips)   | `mocks/<topic>.ts`                                  |
| Fields of a data object               | `types/<topic>.ts`                                  |
| Dropdown options                      | `shared/constants/options.ts`                       |
| Colors, fonts                         | `shared/styles/global.css`                          |
| Shared card/table/button/badge styles | `shared/styles/page.module.css`                     |
| An icon                               | `shared/ui/Icon.tsx`                                |

## How to add a new page

1. Add the URL to `app/paths.ts`.
2. Create `features/<role>/<Name>Page/<Name>Page.tsx` (+ `<Name>Page.module.css` if needed).
   Start from `PageHeader` + `page.module.css` classes, like the other pages.
3. Register it in `app/routes.tsx`.
4. If it needs a sidebar item, add it to `NAV_ITEMS` in `app/navigation.ts`.
5. Add the route to `cypress/e2e/routes.cy.ts`.

## Rules

- Import with the `@/` alias (`@/shared/ui/Modal`), not `../../..`. Files inside the same
  page folder use `./`.
- `shared/` never imports from `features/` or `app/`. `features/` never imports from `app/`.
  `app/` may import from everything.
- One page = one folder. Anything used by only that page lives in its folder.
  Anything used by two or more pages moves to `shared/`.
- Data shapes go in `types/`, demo values go in `mocks/`. When a backend arrives, only
  `mocks/` (and `AppStateProvider`) need to be swapped for API calls.
