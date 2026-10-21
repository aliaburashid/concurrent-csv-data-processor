# Ledger — Compensation Intelligence

A standalone React and TypeScript frontend for the Concurrent CSV Data Processor. It presents actual saved employee salary results in a responsive navy-and-teal workspace. All new code, dependencies, configuration, tests, and assets live in this directory. The existing Java backend, Maven configuration, root README, tests, and resource CSVs are unchanged.

## Run locally

Use Node.js 22.12+ (or 20.19+) and npm:

```bash
cd frontend
npm install
npm run dev
```

Open the Local URL printed by Vite. Spring Boot does not need to run. If another project uses the default port, Vite prints the next available port. To choose one explicitly:

```bash
npm run dev -- --port 5187
```

Build and preview the production app:

```bash
npm run build
npm run preview
```

The deployable static output is `frontend/dist/`. The app uses hash navigation, so static hosting does not require route rewrites. It makes no backend API calls.

## Load real CSV data

On startup, the workspace loads a **bundled project snapshot**, clearly labeled as a snapshot and not live data. The two CSVs in `src/data/` were copied byte-for-byte from the repository's original resource files on 2026-10-20. No employee records or financial totals are hardcoded in application components. The snapshot is not automatically updated when the backend runs.

To view a different run, choose **Import data** or **Manage** and select:

1. The original `employees.csv` from `../src/main/resources/`.
2. Its matching `updated_employees.csv` from the same directory.
3. **Import & explore**.

Expected input headers:

```csv
id,name,salary,joinedDate,role,projectCompletion
```

Expected output headers:

```csv
id,name,originalSalary,updatedSalary
```

Joining dates use `YYYY-MM-DD`. Roles are Director, Manager, or Employee (case-insensitive). Project completion uses fractions from 0 to 1: `0.8` means 80%. Currency symbols and numeric grouping separators are not accepted in numeric CSV fields. BOMs, CRLF, quoted commas, and quoted fields are supported by Papa Parse.

Import validates the entire pair before changing the workspace: required columns, numeric values, real calendar dates, supported roles, duplicate IDs, matching ID sets, names, and original salaries. An invalid import leaves the previous data in place and displays a helpful error. Limits are 10 MB per file and 50,000 records. An import may show a saved decrease; it is displayed as a decrease rather than silently recalculated.

Files are parsed in the browser and retained only in memory. They are not uploaded or saved to local storage. **Clear data** empties the workspace; **Use project snapshot** restores the original snapshot. Refreshing the page also restores the snapshot. A deployed browser cannot read arbitrary repository filesystem paths; users must select files explicitly.

## Features

- **Overview:** seven financial and employee metrics, payroll comparisons, eligibility breakdown, role increases, distribution of increases, and a searchable employee preview.
- **Employees:** search by name or ID; role, eligibility, and raise-status filters; sortable ID and salary columns; pagination; detailed before/after comparison dialogs; filtered CSV export.
- **Salary analysis:** role-level aggregation and visual explanations of the existing backend rules.
- **Salary simulator:** separate browser-only scenario inputs for salary, role, joining date, completion percentage, and calculation date, with a complete breakdown and before/after chart.
- **Processing workflow:** selectable stages and an optional play/pause illustration of the actual four-thread Java workflow. It is explicitly not a live backend monitor.
- **About:** portfolio-friendly project purpose, architecture, testing, and technology overview.
- Numeric units by default; optional USD, BHD, EUR, or GBP display labels. **This is a formatting choice, not currency conversion or a claim about the source currency.**
- Responsive sidebar, horizontally scrollable salary tables on narrow screens, keyboard-accessible dialogs with focus trapping and Escape dismissal, status/error messages, loading/empty states, tooltips, and reduced-motion support.

**Export CSV** downloads all loaded results. **Export filtered results** downloads the complete matching result set in the selected sort order, across pagination. Exports contain `id,name,originalSalary,updatedSalary`, retain unrounded numeric values, and protect text cells beginning with spreadsheet formula prefixes. Export never modifies the original backend files.

## Financial definitions and simulator parity

All dashboard values are derived from the joined CSV records, not from fresh salary calculations:

- Original payroll: sum of original salary values.
- Updated payroll: sum of saved updated salary values.
- Total increase: updated payroll minus original payroll.
- Raised/unchanged/decreased: determined from each saved salary difference.
- Eligibility: original project completion at least 60%; distinct from actual raise status (for example, a zero salary can be eligible yet unchanged).
- Average salary increase: arithmetic mean of individual percentage changes, including unchanged employees.
- Overall payroll change: total increase divided by original payroll. This salary-weighted measure intentionally differs from the individual average.
- Zero-to-zero salary changes are displayed as 0%. A zero-to-nonzero imported result is rejected because its percentage change is undefined.

The simulator was implemented after inspecting `SalaryCalculationService`. For valid inputs it mirrors its Java double arithmetic and `Period.between(...).getYears()` semantics: only completed years count (including leap-day boundaries), each year adds 2%, roles add 5% / 2% / 1%, completion below 60% returns the original salary, and strictly above 80% applies a 1.5× multiplier to the combined rate. The final calculation is `salary + salary * finalRate`; rounding is only for display. Inputs are validated before previewing a scenario, including scenarios below the eligibility threshold.

The default calculation date is the browser's local current date; choose the backend system's date to reproduce its run. The output CSV contains no processing date. A new simulation may therefore differ from an older saved output. The simulator neither changes employee data nor executes the Java application.

The supplied snapshot reconciles to 30 employees: original payroll **2,035,000**, updated payroll **2,271,430**, total increase **236,430**, **21** raises, **9** unchanged salaries, mean individual increase **11%**, and overall payroll change **11.6181818…%**. These reference expectations appear only in tests and documentation; the app computes them from CSV data.

## Verification

```bash
npm test
npm run build
npm run test:e2e
npm run format:check
```

Unit tests cover the actual CSV totals, every saved salary at a fixed reference date, the exact 60% and 80% boundaries, role rates, partial years, leap-day service, invalid inputs, CSV matching, quoted fields, and export behavior. Browser tests cover desktop and mobile interactions, import failure recovery, filtering, comparisons, downloads, simulator thresholds, workflow controls, routing, and page overflow.

Browser tests use an installed Google Chrome through Playwright and start their own Vite server on port **5186**. Chrome must be installed and that port must be free. They do not reuse an unrelated existing server. Test reports and screenshots are generated under ignored `test-results/`. No backend commands or tests need to run for this frontend.

## New files and component structure

```text
frontend/
├── .gitignore                       # Frontend-generated artifacts only
├── .prettierignore
├── .prettierrc.json
├── README.md                        # This setup and usage guide
├── package.json                     # Dependencies and scripts
├── package-lock.json                # Reproducible dependency versions
├── index.html                       # Vite entry and page metadata
├── tsconfig.json                    # Strict TypeScript configuration
├── vite.config.ts                   # React, Tailwind, tests, vendor splitting
├── playwright.config.ts             # Desktop and mobile browser configuration
├── public/
│   └── favicon.svg                  # Local brand asset
├── e2e/
│   └── dashboard.spec.ts            # Browser interaction checks
└── src/
    ├── main.tsx                     # React entry and provider
    ├── App.tsx                      # Shell, sidebar, routes, data controls
    ├── styles.css                   # Tailwind integration and visual system
    ├── context/
    │   └── Workspace.tsx            # Dataset and configurable number formatting
    ├── data/
    │   ├── employees.csv            # Exact original project snapshot
    │   ├── updated_employees.csv    # Exact processed project snapshot
    │   └── snapshot.ts              # Lazy snapshot loader
    ├── lib/
    │   ├── types.ts                 # Shared data types
    │   ├── csv.ts                   # Parsing, validation, matching, export
    │   ├── csv.test.ts              # Import/export tests
    │   ├── salary.ts                # Aggregation and Java-equivalent simulator
    │   └── salary.test.ts           # Financial and salary-rule checks
    ├── components/
    │   ├── UI.tsx                   # Cards, metrics, tooltips, dialogs, empty states
    │   ├── Charts.tsx               # Recharts visualizations
    │   ├── EmployeeTable.tsx        # Search, filters, sorting, pagination
    │   ├── ComparisonDialog.tsx     # Employee before/after analysis
    │   └── ImportDialog.tsx         # Atomic paired CSV import and source controls
    └── pages/
        ├── Overview.tsx
        ├── Analysis.tsx
        ├── Simulator.tsx
        ├── Workflow.tsx
        └── About.tsx
```

## Scope and limitations

This is a browser-local viewer, not a payroll system of record. There is no live backend connection, authentication service, persistence, backend execution, or invented processing status. Charts describe the loaded dataset. The workflow play control is an illustration. Imported data is lost on refresh, and snapshot files must be explicitly replaced inside `frontend/src/data/` if a new bundled snapshot is desired. No backend changes are needed for the implemented features.
