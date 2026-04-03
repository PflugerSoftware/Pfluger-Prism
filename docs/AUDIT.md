# Project Prism - Comprehensive Codebase Audit

**Date:** 2026-03-03
**Audited by:** 8 parallel agents (Auth, Injection, Secrets, Architecture, Code Quality, Data Layer, 12-Factor, Performance)

---

## 1. Executive Summary

```
AUDIT SCOPE: Project Prism - Facilities planning and bond management for Liberty Hill ISD
STACK: TypeScript/React 18 (Vite) + PHP (no framework) + MySQL on Bluehost
SCALE: 137 source files, ~30,652 total LoC
DATE: 2026-03-03

FINDINGS BY SEVERITY:
  CRITICAL: 10    HIGH: 19    MEDIUM: 24    LOW: 14    INFO: 2

FINDINGS BY DOMAIN:
  Security (Agents 1-3):     27
  Quality (Agents 4-5):      20
  Data (Agent 6):             12
  Operations (Agent 7):       14
  Performance (Agent 8):      16

TOP 5 MOST URGENT:
  1. 6 of 8 API endpoints have ZERO authentication - anyone can CRUD all data (CRITICAL, Agent 1)
  2. Database password hardcoded in git-tracked config.php (CRITICAL, Agent 3)
  3. Unauthenticated destructive import-liberty-hill.php with wildcard CORS (CRITICAL, Agent 1)
  4. Plaintext user credentials committed in CLAUDE.md and README.md (HIGH, Agent 3)
  5. 38MB CSV loaded in browser for a single district shape lookup (HIGH, Agent 8)

POSTURE:
  Security:      RED
  Architecture:  YELLOW
  Code Quality:  YELLOW
  Operations:    RED
  Performance:   YELLOW
```

---

## 2. Critical Path Analysis

### CRIT-01: Unauthenticated API Endpoints
**Severity:** CRITICAL | **Agents:** 1, 2, 6, 8
**Files:** `api/projects.php`, `api/bonds.php`, `api/facilities.php`, `api/pods.php`

`requireAuth()` is defined in `config.php` but only called by `cost-rates.php`. The four primary data endpoints accept unauthenticated requests for all CRUD operations. Anyone who knows the API URL (publicly documented in the repo) can create, read, update, and delete all project, bond, facility, and pod data.

**Evidence:** None of these files contain a `requireAuth()` call. The function exists in `config.php:95-117`.

**Remediation:** Add `requireAuth();` immediately after `require_once 'config.php';` in each file. Also add `credentials: 'include'` to all `fetch()` calls in `src/data/loadProjects.ts`, `src/data/loadBonds.ts`, `src/data/loadPods.ts`, and `src/components/System/FacilitiesContext.tsx`.

**Effort:** 1-2 hours

---

### CRIT-02: Database Credentials in Version Control
**Severity:** CRITICAL | **Agents:** 1, 3, 7
**Files:** `api/config.php:22`, `docs/Bluehost DB/config.php:22`

```php
define('DB_PASS', 'modFyc-6qaxtu-fixnyv');
```

Committed to git in two locations. The `.gitignore` has the config.php entry commented out (`# /api/config.php`). Even if removed from HEAD now, the password is permanently in git history.

**Remediation:**
1. Rotate the database password immediately
2. Move credentials to environment variables (`getenv('DB_PASS')`)
3. Uncomment the `.gitignore` entry and run `git rm --cached api/config.php`
4. Delete `docs/Bluehost DB/config.php` from tracking
5. Consider `git filter-repo` or BFG Repo-Cleaner to purge history

**Effort:** 2-4 hours (including credential rotation)

---

### CRIT-03: Unauthenticated Destructive Import Endpoint
**Severity:** CRITICAL | **Agents:** 1, 2, 7
**File:** `api/import-liberty-hill.php`

This endpoint has `Access-Control-Allow-Origin: *` (wildcard CORS), no authentication, and performs:
- `ALTER TABLE` at request time (line 34)
- `DELETE FROM facilities WHERE name LIKE ...` (lines 85-98)
- Mass INSERT of facility records
- Full PHP stack trace in error responses (line 220)

Any browser on any domain can trigger it.

**Remediation:** Delete from production or add `requireAuth()` + restrict CORS. Convert to a CLI script.

**Effort:** 30 minutes

---

### CRIT-04: Plaintext Credentials in Repository Files
**Severity:** HIGH | **Agents:** 1, 3
**Files:** `CLAUDE.md:274-278`, `README.md:80-81`

Admin password (`jPfeTsewgv04`) and Vermulens password (`eomyF9L7tOJ6`) are committed in plaintext.

**Remediation:** Remove from both files. Rotate both passwords. Store in a password manager or `.env.local`.

**Effort:** 1 hour

---

### CRIT-05: No CSRF Protection
**Severity:** HIGH | **Agents:** 1, 2
**File:** `api/config.php:10`

`SameSite=None` on session cookies explicitly allows cross-site cookie sending. Combined with no CSRF tokens on any endpoint, every state-changing operation is vulnerable to CSRF attacks.

**Remediation:** Change `SameSite` to `Lax`. If cross-origin is genuinely needed, implement CSRF tokens.

**Effort:** 1-2 hours

---

### CRIT-06: Debug Data in Production Bond Response
**Severity:** HIGH | **Agents:** 1, 2, 6, 7, 8
**File:** `api/bonds.php:175-191`

Every GET request returns a `_debug` key with `raw_db_rows`, `deduplication_log`, and internal query details. Additionally, 15+ `error_log()` calls dump full JSON-encoded database rows on every request.

**Remediation:** Remove the `_debug` block and all debug `error_log()` calls.

**Effort:** 30 minutes

---

## 3. Consolidated Findings Table

### Security Findings (Agents 1-3)

| ID | Severity | Finding | File:Line | Remediation |
|----|----------|---------|-----------|-------------|
| SEC-01 | CRITICAL | No auth on projects endpoint | `api/projects.php` | Add `requireAuth()` |
| SEC-02 | CRITICAL | No auth on bonds endpoint | `api/bonds.php` | Add `requireAuth()` |
| SEC-03 | CRITICAL | No auth on facilities endpoint | `api/facilities.php` | Add `requireAuth()` |
| SEC-04 | CRITICAL | No auth on pods endpoint | `api/pods.php` | Add `requireAuth()` |
| SEC-05 | CRITICAL | DB password hardcoded in git | `api/config.php:22` | Move to env vars, rotate |
| SEC-06 | CRITICAL | Duplicate DB creds in docs | `docs/Bluehost DB/config.php:22` | Remove from git |
| SEC-07 | CRITICAL | Unprotected destructive import endpoint | `api/import-liberty-hill.php` | Delete or auth-gate |
| SEC-08 | HIGH | Plaintext passwords in CLAUDE.md | `CLAUDE.md:274-278` | Remove, rotate passwords |
| SEC-09 | HIGH | Plaintext password in README | `README.md:80-81` | Remove |
| SEC-10 | HIGH | No CSRF protection, SameSite=None | `api/config.php:10` | Change to Lax, add CSRF tokens |
| SEC-11 | HIGH | No RBAC enforcement | All API endpoints | Add `requireRole()` checks |
| SEC-12 | HIGH | Frontend data loaders missing credentials | `src/data/loadProjects.ts`, `loadBonds.ts` | Add `credentials: 'include'` |
| SEC-13 | HIGH | Stack trace in error response | `api/import-liberty-hill.php:220` | Remove trace from response |
| SEC-14 | HIGH | Debug data in bonds response | `api/bonds.php:175-191` | Remove `_debug` block |
| SEC-15 | HIGH | .gitignore has config.php commented out | `.gitignore:35` | Uncomment, git rm --cached |
| SEC-16 | HIGH | Wildcard `*` npm version ranges | `package.json` (clsx, date-fns, etc.) | Pin to semver ranges |
| SEC-17 | MEDIUM | No brute-force protection on login | `api/auth.php:98-106` | Add attempt tracking/lockout |
| SEC-18 | MEDIUM | No password complexity policy | `api/auth.php:82-83` | Enforce min length 12+ |
| SEC-19 | MEDIUM | 8hr session, no inactivity timeout | `api/config.php:106` | Add inactivity check |
| SEC-20 | MEDIUM | Timing side-channel in login | `api/auth.php:98-106` | Always run password_verify |
| SEC-21 | MEDIUM | Exception messages leak to client | `api/projects.php:181`, multiple files | Return generic errors |
| SEC-22 | MEDIUM | CSV formula injection (client export) | `src/components/MainViews/MyProjects.tsx:208` | Sanitize cell values |
| SEC-23 | MEDIUM | CSV formula injection (server export) | `api/cost-rates.php:65-87` | Prefix dangerous chars |
| SEC-24 | MEDIUM | No Content-Security-Policy header | PHP backend | Add CSP header |
| SEC-25 | MEDIUM | No HSTS header | PHP backend | Add HSTS header |
| SEC-26 | MEDIUM | PHP display_errors not disabled | `api/config.php` | Add `ini_set('display_errors', 0)` |
| SEC-27 | MEDIUM | No .htaccess for server security | `api/` directory | Add .htaccess |

### Architecture Findings (Agent 4)

| ID | Severity | Finding | File:Line | Remediation |
|----|----------|---------|-----------|-------------|
| ARCH-01 | HIGH | Dual incompatible `Project` interfaces | `loadProjects.ts:3`, `BondBuilderPro.tsx:25` | Rename/align BondBuilder type |
| ARCH-02 | MEDIUM | 3 components bypass context, fetch directly | DashboardStats, BondBuilderPro, ProjectFlowSankey | Use `useProjects()` context |
| ARCH-03 | MEDIUM | FacilitiesContext uses raw fetch, not loader pattern | `FacilitiesContext.tsx:39` | Create `loadFacilities.ts` |
| ARCH-04 | MEDIUM | Duplicate color logic | `FacilityDetailedContent.tsx:52-72` | Use ThemeManager exports |
| ARCH-05 | LOW | Mock data residue (~300 lines dead) | MyProjects, MyBonds, BondBuilderPro | Remove dead mock data |

### Code Quality Findings (Agent 5)

| ID | Severity | Finding | File:Line | Remediation |
|----|----------|---------|-----------|-------------|
| CQ-01 | HIGH | No linter or formatter configured | Project root | Add ESLint + Prettier |
| CQ-02 | MEDIUM | 5 files exceed 500 lines, 1 exceeds 1200 | See decomposition table | Extract sub-components |
| CQ-03 | MEDIUM | 50+ `any` type usages across data layer | loadProjects.ts, loadBonds.ts, etc. | Define API response interfaces |
| CQ-04 | MEDIUM | 50+ duplicate cost formatting expressions | Entire codebase | Create `formatMillions()` utility |
| CQ-05 | MEDIUM | 6x duplicate bubble position calculation | `MapView.tsx` | Extract calculation utility |
| CQ-06 | MEDIUM | alert() used in 13 places vs. Sonner toast | 6 files | Replace with toast() |
| CQ-07 | LOW | Inconsistent data sourcing (fetch vs context) | Multiple files | Standardize on context |
| CQ-08 | LOW | Inconsistent API URL construction | FacilitiesContext vs loadProjects | Use `getApiUrl()` everywhere |

### Data Layer Findings (Agent 6)

| ID | Severity | Finding | File:Line | Remediation |
|----|----------|---------|-----------|-------------|
| DATA-01 | HIGH | Enum mismatch: facilities 'Administration' vs projects 'Administration Building' | DB schema | Standardize enum values |
| DATA-02 | HIGH | Empty string in NOT NULL enum (project_type, id=73) | Database row | Fix data, enable strict mode |
| DATA-03 | HIGH | No optimistic locking on updates (last-write-wins) | `projects.php`, `bonds.php` | Add version/timestamp check |
| DATA-04 | MEDIUM | TOCTOU on facility delete | `facilities.php:205-233` | Wrap in transaction with SELECT FOR UPDATE |
| DATA-05 | MEDIUM | Delete-and-reinsert for elemental costs | `projects.php:297-318` | Distinguish "not provided" vs "empty" |
| DATA-06 | MEDIUM | Denormalized project_count can drift | `bonds` table | Compute from join table or add trigger |
| DATA-07 | MEDIUM | Dates stored as varchar (start_date, completion_date) | `projects` table | Migrate to DATE type |
| DATA-08 | MEDIUM | last_modified varchar redundant with updated_at TIMESTAMP | `projects` table | Remove last_modified |
| DATA-09 | LOW | duration stored as varchar ("42 months") | `projects` table | Change to INT (months) |
| DATA-10 | LOW | bonds.approval_date mixes date + status text | `bonds` table | Split into date + boolean flag |
| DATA-11 | LOW | No FK constraint on created_by columns | `projects`, `bonds` | Add FK or remove columns |
| DATA-12 | HIGH | No unique constraint on (project_id, code) in elemental costs | `project_elemental_costs` | Add composite unique key |

### Operations Findings (Agent 7)

| ID | Severity | Finding | File:Line | Remediation |
|----|----------|---------|-----------|-------------|
| OPS-01 | CRITICAL | Debug _debug in production response | `bonds.php:174-192` | Remove entirely |
| OPS-02 | HIGH | No CI/CD pipeline | N/A | Add build + deploy pipeline |
| OPS-03 | HIGH | No structured logging anywhere | All endpoints | Add JSON logging |
| OPS-04 | HIGH | No request logging middleware | PHP backend | Add request logging function |
| OPS-05 | HIGH | Error swallowing in data loaders | `loadProjects.ts:106`, `loadBonds.ts:132` | Add error state to UI |
| OPS-06 | HIGH | No React error boundary | `App.tsx` | Add top-level ErrorBoundary |
| OPS-07 | HIGH | Dev hits production API directly | `apiConfig.ts:10` | Use env var for API URL |
| OPS-08 | MEDIUM | No health check endpoint | PHP API | Create `/health.php` |
| OPS-09 | MEDIUM | Hardcoded API base URL | `apiConfig.ts:10` | Use `import.meta.env.VITE_API_URL` |
| OPS-10 | MEDIUM | DB connections created even for OPTIONS | `projects.php:10` | Move getDBConnection inside handlers |
| OPS-11 | LOW | Dead Supabase config still in codebase | `supabaseConfig.ts`, `.env.example` | Remove dead references |
| OPS-12 | LOW | Vite dev port hardcoded | `vite.config.ts:60` | Read from env var |
| OPS-13 | LOW | No tsconfig.json at project root | Project root | Add with strict: true |
| OPS-14 | LOW | Source maps not explicitly disabled | `vite.config.ts` | Add `sourcemap: false` |

### Performance Findings (Agent 8)

| ID | Severity | Finding | File:Line | Remediation |
|----|----------|---------|-----------|-------------|
| PERF-01 | HIGH | 38MB CSV loaded for single district shape | `loadDistricts.ts:44` | Pre-extract to small GeoJSON |
| PERF-02 | HIGH | Sankey chart polls every 5 seconds | `ProjectFlowSankey.tsx:187` | Use context, remove polling |
| PERF-03 | MEDIUM | Zero code splitting, all views eagerly loaded | `App.tsx` | Use React.lazy + Suspense |
| PERF-04 | MEDIUM | Map fully re-initialized on data changes | `MapView.tsx:421-671` | Separate map init from marker updates |
| PERF-05 | MEDIUM | 3 components duplicate API fetches | DashboardStats, BondBuilderPro, Sankey | Use context hooks |
| PERF-06 | MEDIUM | Context values not memoized | All context providers | Add useMemo to context values |
| PERF-07 | MEDIUM | No request timeouts on frontend fetch | All data loaders | Add AbortController |
| PERF-08 | MEDIUM | No server-side cache headers configured | API & static assets | Add .htaccess Cache-Control |
| PERF-09 | LOW | DOM querying on every hover event | `MapView.tsx:203-208` | Cache marker positions |
| PERF-10 | LOW | No fetch cancellation on unmount | `ProjectsContext.tsx:18-21` | Add AbortController cleanup |

---

## 4. 12-Factor Scorecard

| Factor | Status | Key Finding | Recommendation |
|--------|--------|------------|----------------|
| I. Codebase | PASS | Single git repo, properly tracked | None |
| II. Dependencies | PARTIAL | Lockfile committed, but 5 npm deps use `*` version, no PHP package manager | Pin all versions |
| III. Config | FAIL | DB creds hardcoded in config.php, API URL hardcoded in apiConfig.ts, CORS origins hardcoded | Move all to env vars |
| IV. Backing Services | FAIL | DB connection via hardcoded constants, not swappable via config | Externalize as DATABASE_URL |
| V. Build/Release/Run | PARTIAL | Frontend build is clean; PHP has runtime ALTER TABLE in import endpoint | Remove runtime migrations |
| VI. Processes | PASS | SPA is stateless; PHP sessions are standard | Acceptable |
| VII. Port Binding | PARTIAL | Vite port hardcoded to 3000 | Read from env |
| VIII. Concurrency | PARTIAL | PHP process model works; import endpoint has race conditions | Add locking |
| IX. Disposability | PARTIAL | Fast startup; no graceful shutdown for long transactions | Add transaction timeouts |
| X. Dev/Prod Parity | FAIL | Dev hits production API directly; .env.example references wrong backend (Supabase) | Create staging env |
| XI. Logs | FAIL | No structured logging; debug error_log in production; frontend swallows errors | Add logging strategy |
| XII. Admin Processes | FAIL | Migration script as web endpoint; no migration runner; no CLI admin tools | Convert to CLI scripts |

**Overall: 2 PASS, 5 PARTIAL, 5 FAIL**

---

## 5. Architecture Quality Summary

| Principle | Status | Key Evidence |
|-----------|--------|-------------|
| Single Responsibility | CONCERN | 5 files over 500 lines mixing form state, UI, data processing. ProjectOverview at 1226 lines. |
| Open/Closed | CONCERN | if/else chains for project type colors/icons in 3+ places. Adding a type requires changes in 3+ files. |
| Liskov Substitution | PASS | No interface violations detected. |
| Interface Segregation | PASS | Context providers have focused APIs. |
| Dependency Inversion | CONCERN | All data access depends on concrete fetch() calls. No abstractions for external services. |
| Layer Separation | CONCERN | FacilitiesContext bypasses data loader pattern. PHP mixes routing + business logic + data access. |
| Module Boundaries | VIOLATION | Two incompatible `Project` interfaces. Components bypass context to fetch directly. |

---

## 6. Cross-Cutting Themes

### Root Cause: Security was deferred
The most pervasive issue is that `requireAuth()` exists but was never applied to the main endpoints. This suggests auth was implemented for the mechanism (login/sessions) but not enforced on the data layer. The frontend-only auth (showing/hiding UI) provides zero protection.

### Root Cause: No development tooling
The absence of a linter, formatter, TypeScript strict mode, tests, and CI/CD allows inconsistencies to accumulate unchecked. Style drift (semicolons, API patterns, data sourcing) stems from having no enforcement mechanism.

### Root Cause: Prototype-to-production gap
Several patterns (hardcoded credentials, debug data in responses, mock data left in components, 38MB CSV for one district) suggest a prototype that grew into production use without a hardening pass.

### Root Cause: Dual data sourcing
The presence of both `loadProjects()` direct calls and `useProjects()` context in different components creates stale-data bugs, redundant API calls, and confusion about the canonical data source.

---

## 7. Remediation Roadmap

### Immediate (this week)
1. Add `requireAuth()` to projects.php, bonds.php, facilities.php, pods.php
2. Delete or auth-gate `import-liberty-hill.php`
3. Rotate database password; move to env vars
4. Remove plaintext passwords from CLAUDE.md and README.md
5. Remove `_debug` block and debug `error_log()` from bonds.php
6. Uncomment config.php in .gitignore; `git rm --cached` both config files
7. Add `credentials: 'include'` to all frontend fetch() calls

### Short-term (2 weeks)
8. Change SameSite from None to Lax
9. Add role-based guards for write operations
10. Add brute-force protection on login
11. Replace generic error messages in PHP (remove $e->getMessage() from responses)
12. Add `ini_set('display_errors', 0)` to config.php
13. Extract Liberty Hill district shape to a small GeoJSON file (eliminate 38MB CSV)
14. Remove 5-second polling in ProjectFlowSankey; use context data
15. Add React ErrorBoundary to App.tsx

### Medium-term (1 month)
16. Consolidate data sourcing: all components use context hooks, remove direct loadProjects() calls
17. Resolve dual Project interface: rename BondBuilder's version or align types
18. Add ESLint + Prettier configuration, add tsconfig.json with strict mode
19. Implement React.lazy code splitting for MapView, BondBuilderPro, ProjectBuilderPro
20. Add CSRF token validation for state-changing requests
21. Fix schema issues: enum mismatch, varchar dates, strict SQL mode
22. Add inactivity timeout using last_activity session field
23. Create `formatMillions()` utility to replace 50+ duplicate expressions
24. Memoize context values with useMemo
25. Use env var for API base URL (`VITE_API_URL`)

### Long-term (quarter)
26. Decompose large components (ProjectOverview, MapView, FacilityDetailedContent)
27. Add structured logging (PHP and frontend)
28. Add health check endpoint
29. Set up CI/CD pipeline with build + type checking
30. Add optimistic locking for concurrent updates
31. Create separate staging environment
32. Add CSP, HSTS, and other security headers
33. Migrate date columns from varchar to DATE type
34. Consider test suite for critical paths (auth, CRUD operations)

**Dependency graph:** Items 1-7 must be done first (security foundation). Item 7 (credentials in fetch) unblocks items 8-9 (RBAC). Item 16 (context consolidation) should precede item 19 (code splitting). Item 17 (type alignment) should precede item 23 (utility extraction).

---

## 8. Positive Patterns

These patterns are working well and should be preserved:

1. **bcrypt password hashing** - Using `password_verify()` with bcrypt is solid. Session regeneration on login is correct.
2. **PDO prepared statements** - All SQL uses parameterized queries. No string concatenation in SQL found.
3. **Context-based state management** - The Provider/Context/Hook pattern for Projects, Bonds, and Facilities is well-structured.
4. **apiRequest() utility** - The centralized API helper with credential handling and 401 detection is well-designed (just needs to be used consistently).
5. **Session expiration event system** - The `window.dispatchEvent(new CustomEvent('session-expired'))` pattern for cross-component auth coordination is elegant.
6. **Mapbox marker text uses textContent** - `labelDiv.textContent = facilityName` correctly avoids innerHTML for user-derived data.
7. **Facility deletion with project check** - `facilities.php` validates no linked projects before delete (though should be in a transaction).
8. **Package lockfile committed** - `package-lock.json` is tracked, ensuring deterministic installs.
9. **Theme system** - Centralized color/theme management via ThemeManager provides consistency.
10. **Component co-location** - Wizard steps are organized by feature (BondBuilder/, ProjectBuilder/) rather than by type, which aids navigation.

---

## Methodology Notes

### Limitations
- This is a static analysis audit. Runtime behavior, actual production configuration, network topology, and server-side PHP settings on Bluehost were not directly observed.
- `npm audit` was not run. Dependency vulnerability scanning should be performed separately.
- No load testing was performed. Performance findings are based on code patterns, not measured metrics.
- Git history was not exhaustively searched for all historical credential exposure.

### Assumptions
- The Bluehost shared hosting environment uses default PHP configuration unless overridden by .htaccess or php.ini.
- The application is used by a small team (2-3 users) at Pfluger Architects, not public-facing.
- The Supabase integration is vestigial from a previous architecture and is not actively used.

### Recommended Follow-up
- **Penetration test** of the live API endpoints (especially the unauthenticated ones)
- **`npm audit`** for automated dependency vulnerability scanning
- **Bundle analysis** (`npx vite-bundle-visualizer`) to identify code splitting opportunities
- **Load testing** if user count is expected to grow
- **Git history audit** with tools like `trufflehog` or `gitleaks` for additional credential exposure
