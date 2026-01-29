# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Project Prism is a facilities planning and bond management application for Liberty Hill ISD (school district). It helps district administrators create projects, estimate costs, plan bond programs, and visualize facility data.

**Technology Stack:**
- React 18 with TypeScript
- Vite build system
- Tailwind CSS + Radix UI components
- Mapbox GL JS for mapping
- Recharts for data visualization
- gantt-task-react for timeline visualization

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on localhost:3000)
npm run dev

# Build for production
npm run build
```

## Application Architecture

### Main Application Structure

The app uses a **single-page application architecture** with view-based routing managed through React state (not React Router). The main entry point is `App.tsx`, which handles:
- Authentication flow (login screen or main app)
- Theme provider wrapping
- Navigation between main views

**Core Views** (defined in `src/components/MainViews/`):
- `DashboardStats` - Dashboard with charts and key metrics
- `MyProjects` - Project browsing and management
- `MyBonds` - Bond package management
- `MapView` - Interactive Mapbox GL JS map with school sites
- `BondBuilderPro` - Timeline-based bond package builder (multi-step wizard)
- `ProjectBuilderPro` - Project creation wizard (multi-step wizard)
- `Settings` - User preferences

Navigation is controlled by `activeView` state in `App.tsx` and the `AppSidebar` component.

### Data Architecture

**Data Source:**
- All application data is loaded from the **Bluehost PHP API** at `https://prism.pflugerarchitects.com/api`
- Data loaders are in `src/data/loadProjects.ts` and `src/data/loadBonds.ts`
- API configuration is managed in `src/config/apiConfig.ts`

**API Endpoints:**
- `/facilities.php` - Facility (school building) data with project counts and costs
- `/projects.php` - Project data with elemental cost breakdowns
- `/bonds.php` - Bond packages with associated projects
- `/pods.php?resource=pods` - Pre-built space pods
- `/pods.php?resource=spaces` - Individual space types
- `/auth.php` - Authentication

**Data Hierarchy:**
The application uses a **two-tier data model**:

```
Facilities (Physical School Buildings)
  └── Projects (Work being done at facilities)
      └── Bonds (Financial packages containing projects)
```

**Facilities → Projects Relationship:**
- Each **Facility** represents a physical school building (e.g., "Liberty Hill High School")
- Each **Project** belongs to a facility via the `facility_id` foreign key
- Projects can be unlinked (district-wide projects have `facility_id = null`)
- Facility types: Elementary, Middle, High School, Specialty, Administration, District
- Facility statuses: Existing, Under Construction, Planned

This architecture enables:
- Grouping projects by physical location
- Separate workflows for new schools vs. work at existing schools
- Better distinction between New Construction and Renovations/Additions
- Facility-level reporting (total project costs, project counts per building)
- Future facility detail pages showing all related work

**Data Models:**
- `Facility` interface (src/components/System/FacilitiesContext.tsx) - School building with location, enrollment, capacity
- `Project` interface (src/data/loadProjects.ts) - Comprehensive project data with `facility_id` link and elemental cost arrays
- `Bond` interface (src/data/loadBonds.ts) - Bond packages with linked projects
- `BondProject` interface - Simplified project format for timeline display

**Current Implementation Status:**
- ✅ Facilities table created in MySQL with full CRUD API
- ✅ FacilitiesContext provides global facility state management
- ✅ Projects migrated to facilities (12 projects → 8 facilities)
- ⏳ Facility selection UI in Project Builder (planned)
- ⏳ Facility-based filtering and grouping (planned)
- ⏳ Facility detail pages (planned)

**District Map Data:**
- District shapes and attributes are loaded from CSV files in `/public/data/` (district_shapes.csv, district_attributes.csv)
- This is the only remaining CSV usage in the application

### Component Organization

**MainViews/** - Top-level page components
- Each view is a complete page with its own state and logic
- Views can accept `onNavigate` prop to trigger navigation to other views

**BondBuilder/** - Bond Builder Pro wizard components
- `BondBuilderPro-BondInfo.tsx` - Step 1: Bond metadata
- `BondBuilderPro-ProjectSelection.tsx` - Step 2: Select projects
- `BondBuilderPro-Timeline.tsx` - Step 3: Timeline scheduling
- `BondBuilderPro-Review.tsx` - Step 4: Final review
- `Timeline.tsx` - Gantt chart timeline component using gantt-task-react
- `ProjectLibrary.tsx` - Project selection/browsing interface

**ProjectBuilder/** - Project Builder Pro wizard components
- `ProjectBuilderPro-ProjectOverview.tsx` - Step 1: Basic info
- `ProjectBuilderPro-LocationSite.tsx` - Step 2: Site selection
- `ProjectBuilderPro-SpaceProgramming.tsx` - Step 3: Space programming (pod-based)
- `ProjectBuilderPro-SchedulePhases.tsx` - Step 4: Schedule
- `ProjectBuilderPro-CostEstimation.tsx` - Step 5: Cost calculations
- `ProjectBuilderPro-ReviewFinalize.tsx` - Step 6: Final review

**System/** - Core system components
- `AuthContext.tsx` - Authentication state management (currently mock auth)
- `ProjectsContext.tsx` - Global project state management
- `BondsContext.tsx` - Global bond state management
- `FacilitiesContext.tsx` - Global facility state management (school buildings)
- `ThemeManager.tsx` - Theme system with project type colors
- `ImageWithFallback.tsx` - Image loading with fallback handling

**ui/** - Radix UI components from shadcn/ui

### Key Design Patterns

**Multi-Step Wizards:**
Both BondBuilderPro and ProjectBuilderPro use step-based wizards:
- State is maintained in the parent component
- Each step is a separate component receiving state and setState
- Navigation between steps controlled by parent
- All data is held in memory until final "Create" action

**Pod-Based Space Programming:**
Projects are built from "Pods" (groups of related spaces):
- Pre-built pods (e.g., "Performing Arts Pod") with predefined spaces
- Custom pods where users select individual spaces from a library
- Each pod has a name, description, and array of spaces with SF and cost

**Timeline Management:**
Bond Builder uses gantt-task-react for project scheduling:
- Projects can be dragged and repositioned on timeline
- Dates stored in YYYY-MM format
- Duration calculated in months
- Visual color-coding by project type

**Authentication Flow:**
- Login screen shows when `isAuthenticated` is false
- Currently uses hardcoded credentials: `apps@pflugerarchitects.com` / `jPfeTsewgv04`
- Full authentication context in `AuthContext.tsx`

### Theme System

The app uses a custom theme system (not standard Tailwind themes):
- Managed via `ThemeManager.tsx`
- Project types have associated colors (defined in `projectColors`)
- Professional light theme by default
- Color scheme: grays (#374151, #1f2937) with muted accents

### Important File Paths

```
src/
├── App.tsx                     # Main app entry point
├── main.tsx                    # Vite entry
├── components/
│   ├── MainViews/              # Page-level components
│   ├── BondBuilder/            # Bond wizard components
│   ├── ProjectBuilder/         # Project wizard components
│   ├── System/                 # Core utilities & context providers
│   │   ├── FacilitiesContext.tsx
│   │   ├── ProjectsContext.tsx
│   │   ├── BondsContext.tsx
│   │   └── AuthContext.tsx
│   └── ui/                     # Radix UI components
├── data/                       # Data loaders
│   ├── loadProjects.ts
│   └── loadBonds.ts
└── styles/                     # Global styles

api/
├── facilities.php              # Facilities CRUD endpoint
├── projects.php                # Projects CRUD endpoint
├── bonds.php                   # Bonds CRUD endpoint
└── config.php                  # Database configuration

database/
├── add-facilities-table.sql    # Facilities table schema
└── migrate-projects-to-facilities.php  # Migration script

public/
└── data/                       # District map CSV files (shapes/attributes)

vite.config.ts                  # Vite configuration
```

### Map Integration

Map view uses Mapbox GL JS with custom markers:
- School sites with lat/long coordinates
- Custom popup UI showing project details
- Interactive district stats overlay
- Marker colors correspond to project types
- 3D buildings and terrain visualization
- Custom map centering with padding for sidebars

### Cost Calculation System

Projects have multiple cost components:
- **Base cost** - Construction costs
- **Site costs** - Site development
- **Design costs** - A&E fees (architectural & engineering)
- **Contingency** - Risk buffer
- **Elemental costs** - Cost breakdown by building element using Uniformat classification (A1-Substructure, A2-Structure, A3-Enclosure, B1-Partitions, B2-Finishes, C1-Mechanical, C2-Electrical, etc.)

All costs flow up to `costEstimate` (total project cost).

**Why Elemental Costs (Uniformat)?**
- Designed for bond planning and early-phase cost estimation
- Organized by building systems (structure, mechanical, electrical, etc.)
- More useful for district managers than contractor-focused trade breakdowns
- Enables meaningful project comparisons and benchmarking

## API Integration

**Current State:**
The app is fully integrated with the Bluehost PHP API backend at `https://prism.pflugerarchitects.com/api`.

**Data Flow:**
- All project and bond data is fetched from and saved to the API
- Data loaders use `fetch()` calls to API endpoints (see `src/config/apiConfig.ts`)
- Changes are persisted to the MySQL database via PHP endpoints
- See `DEVELOPER_HANDOFF.md` for complete API documentation

**Known Limitations:**
- Authentication uses basic validation (not production-ready OAuth/JWT)
- No file upload functionality yet
- Export features create client-side CSV files (not stored server-side)

## Vite Configuration

- Dev server runs on port 3000
- Build output goes to `/build` directory
- Extensive path aliases configured in `vite.config.ts`
- Uses SWC for faster React compilation

## Working with Timelines

The Bond Builder timeline uses gantt-task-react:
- Tasks must have start/end dates in Date format
- Projects without dates are filtered out
- Date format conversion happens in Timeline component
- Custom styling applied via task.styles property

## Authentication

Uses PHP sessions with bcrypt password hashing. Session timeout is 8 hours.

**Admin login:**
- Email: `apps@pflugerarchitects.com`
- Password: `jPfeTsewgv04`

**Vermulens (Cost Estimator) login:**
- Email: `vermulens@pflugerarchitects.com`
- Password: `eomyF9L7tOJ6`

Auth state is managed globally via `AuthContext`. Vermulens users are routed to a dedicated cost entry portal.
