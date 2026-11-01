# ShiftPay — Frontend Architecture

## Folder map

```
src/
├── main.tsx                  Entry point: starts the mock API (MSW), then Router + AuthProvider + AppStateProvider
│
├── app/                      App shell: things that glue pages together
│   ├── App.tsx               Top-level <Routes>, global modals
│   ├── RequireRole.tsx       Route guard: no session → /login, wrong role → own home page
│   ├── paths.ts              ALL URLs (PATHS.owner.team, ...) + role helpers
│   ├── navigation.ts         Sidebar menu for every role (label, icon, URL)
│   ├── routes.tsx            URL → page component table
│   ├── AppStateProvider.tsx  UI-only state (which global modal is open)
│   ├── layouts/
│   │   ├── DashboardLayout   Sidebar + page area (wraps every /employee, /admin, /owner page)
│   │   └── AppSidebar        Connects the shared Sidebar to navigation.ts and the logged-in user
│   └── dev/
│       ├── DevToolbar        Floating role switcher (quick demo login)
│       └── useDemoLogin      Logs in with the demo account of a role
│
├── api/                      Talking to the server: endpoint functions + custom hooks per topic
│   ├── auth.tsx              authApi, AuthProvider, useAuth()
│   ├── shifts.ts             useShifts, useCreateShift, useUpdateShift, useDutyWorkers, useUpdateDuty
│   ├── payroll.ts            usePayout, usePayslips, useConfirmPayslip, useAnalytics
│   ├── organization.ts       useTeam, useInviteMember, useUpdateMember, useVenues, useTemplates...
│   └── settings.ts           owner/admin settings, employee profile, password, support tickets
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
│   ├── api/
│   │   ├── client.ts         fetch wrapper: base URL, JSON, Bearer token, ApiError, 401 handling
│   │   └── queryCache.ts     Shared cache of query results + invalidate() for refetching
│   ├── hooks/
│   │   ├── useApiQuery.ts    GET hook: { data, isLoading, error, refetch }
│   │   └── useApiMutation.ts POST/PUT/PATCH/DELETE hook: { mutate, isPending, error }
│   ├── ui/                   Modal, ConfirmDialog, QueryState, Toggle, CustomSelect, ...
│   ├── layout/               Sidebar, Header, PageHeader, NotificationsPopover
│   ├── styles/               global.css (colors, fonts) + page.module.css (cards, tables, forms, badges)
│   ├── constants/options.ts  Dropdown option lists (roles, venue types, periods...)
│   └── lib/
│       ├── format.ts         formatUAH, formatDate, formatHours, getInitials, payslipNet
│       └── payroll.ts        Business rules: calcHours, validateShift, canTransition, buildPayslip...
│
├── types/                    TypeScript shapes of the data (Shift, Payslip, TeamMember, AuthUser...)
└── mocks/                    Fake backend used until lab 7
    ├── *.ts                  Seed data, one file per topic (users, team, shifts, payslips...)
    └── server/
        ├── db.ts             In-memory database, saved to localStorage (key shiftpay.mockdb.v1)
        ├── handlers.ts       REST endpoints under /api with auth, role checks and validation
        └── browser.ts        MSW service worker setup
```

## How data flows

```
Page → useShifts() / useCreateShift()   (api/shifts.ts)
     → useApiQuery / useApiMutation     (shared/hooks)
     → apiClient.get / post             (shared/api/client.ts, fetch + token)
     → /api/shifts                      (MSW handlers now, Express in lab 7)
```

After a mutation, `useApiMutation` calls `queryCache.invalidate('shifts', ...)`, and every page that
shows shifts refetches. Example: an admin approves a shift, so the employee's balance and the
owner's payroll list update without manual state passing.

## Demo accounts

| Role          | Email               | Password   |
| ------------- | ------------------- | ---------- |
| Працівник     | barista@shiftpay.ua | barista123 |
| Адміністратор | admin@shiftpay.ua   | admin123   |
| Власник       | owner@shiftpay.ua   | owner123   |

To reset the demo data, clear the `shiftpay.mockdb.v1` key in localStorage or send `POST /api/dev/reset`.

## Switching to a real backend (lab 7)

1. Implement the same endpoints as `mocks/server/handlers.ts` in Express.
2. Create `.env` with `VITE_API_URL=http://localhost:4000/api` (see `.env.example`).
3. With `VITE_API_URL` set, `main.tsx` skips MSW and every request goes to the server.
   Pages and hooks need no changes.

## Where do I find…

| I want to change…                     | Open                                                |
| ------------------------------------- | --------------------------------------------------- |
| A page                                | `features/<role>/<PageName>Page/<PageName>Page.tsx` |
| A page's styles                       | The `.module.css` file in the same folder           |
| A modal that belongs to one page      | Same folder as the page (`InviteModal.tsx`, ...)    |
| How a page loads or saves data        | `api/<topic>.ts`                                    |
| A business rule (hours, statuses)     | `shared/lib/payroll.ts`                             |
| What the fake server answers          | `mocks/server/handlers.ts`                          |
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
3. If it needs data, add the endpoint to `mocks/server/handlers.ts` and a hook to `api/<topic>.ts`.
   Show loading and errors with `QueryState`.
4. Register it in `app/routes.tsx`.
5. If it needs a sidebar item, add it to `NAV_ITEMS` in `app/navigation.ts`.
6. Add the route to `cypress/e2e/routes.cy.ts`.

## Rules

- Import with the `@/` alias (`@/shared/ui/Modal`), not `../../..`. Files inside the same
  page folder use `./`.
- `shared/` never imports from `features/` or `app/`. `features/` never imports from `app/`.
  `app/` may import from everything.
- Pages never call `fetch` directly: they use hooks from `api/`.
- One page = one folder. Anything used by only that page lives in its folder.
  Anything used by two or more pages moves to `shared/`.
- Data shapes go in `types/`, demo values go in `mocks/`, business rules go in `shared/lib/payroll.ts`.
