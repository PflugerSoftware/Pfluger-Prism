# Project Prism

A comprehensive facilities planning and bond management application for Liberty Hill ISD (Independent School District). Project Prism helps district administrators create projects, estimate costs, plan bond programs, and visualize facility data through an intuitive interface.

**Original Design**: https://www.figma.com/design/XzMLl2zEKlfzBkvqF4zAfT/Project-Prism

---

## Table of Contents

- [Current Status](#current-status)
- [Quick Start](#quick-start)
- [Technology Stack](#technology-stack)
- [Application Architecture](#application-architecture)
- [Core Features](#core-features)
- [Data Architecture](#data-architecture)
- [Authentication](#authentication)
- [Project Structure](#project-structure)
- [Key Design Patterns](#key-design-patterns)
- [Known Limitations](#known-limitations)
- [Future Development](#future-development)

---

## Current Status

**Version**: Development/Pre-Production
**Environment**: Full-stack application with MySQL database
**Deployment**: Local development + Bluehost production API

### What's Working
✅ Full UI/UX implementation matching Figma designs
✅ Dashboard with charts and key metrics
✅ Interactive map view with Mapbox GL JS integration
✅ Project browsing and management interface
✅ Bond package management
✅ Multi-step Project Builder Pro wizard
✅ Multi-step Bond Builder Pro wizard with Gantt timeline
✅ **Two-tier Facilities → Projects data architecture**
✅ **Full backend API integration (MySQL + PHP)**
✅ **Data persistence to database**
✅ Real-time project and bond CRUD operations
✅ User authentication flow (basic auth)
✅ Theme system with project type color coding
✅ Responsive sidebar navigation with glassmorphism styling

### What's Not Working (Yet)
⏳ Facility selection UI in Project Builder
⏳ Facility-based project filtering and grouping
⏳ Facility detail pages
❌ Production-ready authentication (OAuth/JWT)
❌ File upload functionality
❌ Export features (PDF, Excel, etc.)
❌ User management and roles
❌ Multi-user collaboration

---

## Quick Start

### Prerequisites
- Node.js (v16 or higher recommended)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server (runs on localhost:3000)
npm run dev

# Build for production
npm run build
```

### Default Login Credentials
```
Email: apps@pflugerarchitects.com
Password: jPfeTsewgv04
```

---

## Technology Stack

### Frontend Framework
- **React 18** - Core UI framework
- **TypeScript** - Type safety and developer experience
- **Vite** - Build tool and dev server (with SWC for fast compilation)

### UI Components & Styling
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives (shadcn/ui)
- **Lucide React** - Icon library
- **Framer Motion** - Animation library
- **class-variance-authority** - Component variant management

### Data Visualization
- **Recharts** - Charts and graphs for dashboard
- **Mapbox GL JS** - Interactive mapping with 3D buildings
- **gantt-task-react** - Timeline/Gantt chart visualization

### State Management
- **React Context** - Global state management (Auth, Projects, Bonds, Facilities)
- **Local State** - Component-level state management

### Backend & Database
- **MySQL** - Relational database (hosted on Bluehost)
- **PHP 7.4+** - REST API backend
- **PDO** - Database access layer with prepared statements

---

## Application Architecture

### Single-Page Application (SPA) Structure

The app uses a **view-based routing system** managed through React state (not React Router). Navigation is controlled via the `App.tsx` entry point.

```
App.tsx
├── AuthProvider (authentication state)
├── ThemeProvider (theme system)
├── FacilitiesProvider (facility data)
├── ProjectsProvider (project data)
├── BondsProvider (bond data)
└── Main App
    ├── AppSidebar (navigation)
    ├── Detail Sidebars (ProjectDetails, BondDetails)
    └── Active View (one of the following):
        ├── DashboardStats
        ├── MapView
        ├── MyProjects
        ├── MyBonds
        ├── ProjectBuilderPro (multi-step wizard)
        ├── BondBuilderPro (multi-step wizard)
        └── Settings
```

### Core Views

| View | Purpose | Location |
|------|---------|----------|
| **Dashboard** | Overview with charts and key metrics | `src/components/MainViews/DashboardStats.tsx` |
| **Map View** | Interactive Mapbox GL JS map with school sites | `src/components/MainViews/MapView.tsx` |
| **My Projects** | Browse and manage projects | `src/components/MainViews/MyProjects.tsx` |
| **My Bonds** | Bond package management | `src/components/MainViews/MyBonds.tsx` |
| **Project Builder Pro** | 6-step project creation wizard | `src/components/ProjectBuilder/` |
| **Bond Builder Pro** | 4-step bond package builder | `src/components/BondBuilder/` |
| **Settings** | User preferences | `src/components/MainViews/Settings.tsx` |

---

## Core Features

### 1. Dashboard Analytics
- Project count and cost summaries
- Bond program overview
- Visual charts (bar, pie, area charts)
- Quick access cards for recent projects

### 2. Interactive Map View
- Mapbox GL JS with 3D buildings and terrain
- Custom markers for school sites with facility grouping
- Collapsible search panel with glassmorphism styling
- District statistics overlay
- Project type color coding
- Frame All button for district overview

### 3. Project Management
- Browse all projects with filtering
- View detailed project cards
- Cost breakdowns (elemental, trade, ratios)
- Project timeline visualization

### 4. Bond Package Management
- Create and manage bond packages
- Link multiple projects to bonds
- Timeline-based scheduling with Gantt charts
- Budget allocation and tracking

### 5. Project Builder Pro (6-Step Wizard)
1. **Project Overview** - Basic project information
2. **Location & Site** - Site selection and details
3. **Space Programming** - Pod-based space planning
4. **Schedule & Phases** - Timeline and milestones
5. **Cost Estimation** - Comprehensive cost calculations
6. **Review & Finalize** - Final review before creation

### 6. Bond Builder Pro (4-Step Wizard)
1. **Bond Info** - Basic bond package metadata
2. **Project Selection** - Choose projects from library
3. **Timeline** - Gantt chart scheduling
4. **Review** - Final review before creation

### 7. Space Programming (Pod System)
- **Pre-built Pods** - Templates like "Performing Arts Pod", "STEM Lab Pod"
- **Custom Pods** - Build custom space combinations
- **Space Library** - 40+ predefined space types with costs/SF

---

## Data Architecture

### Two-Tier Data Model: Facilities → Projects

The application uses a **hierarchical data architecture** to properly represent the relationship between physical school buildings and the work being done at them:

```
Facilities (Physical School Buildings)
  └── Projects (Work being done at facilities)
      └── Bonds (Financial packages containing projects)
```

### Database: MySQL on Bluehost

All data is stored in a MySQL database with the following structure:

**Core Tables:**
```
facilities              # School buildings (Elementary, Middle, High School, etc.)
  ├── id (PK)
  ├── name              # e.g., "Liberty Hill High School"
  ├── facility_type     # Elementary, Middle, High School, Specialty, etc.
  ├── status            # Existing, Under Construction, Planned
  ├── latitude/longitude
  ├── current_enrollment
  └── capacity

projects               # Work being done at facilities
  ├── id (PK)
  ├── facility_id (FK) # Links to facilities table (nullable)
  ├── name
  ├── project_type     # New Construction, Renovation, Addition, etc.
  ├── cost_estimate
  ├── square_footage
  ├── elemental_costs  # JSON array of Uniformat cost breakdowns
  └── ... (50+ fields)

bonds                  # Bond packages
  ├── id (PK)
  ├── bond_name
  ├── total_budget
  └── ... (linked to projects via bond_projects table)
```

### API Integration

**Bluehost PHP API**: `https://prism.pflugerarchitects.com/api`

**Available Endpoints:**
- `/facilities.php` - Facilities CRUD with aggregated project counts/costs
- `/projects.php` - Projects CRUD with elemental cost breakdowns
- `/bonds.php` - Bond packages CRUD
- `/pods.php` - Space programming templates
- `/auth.php` - Authentication

### Data Loaders

- **Facilities**: `src/components/System/FacilitiesContext.tsx`
- **Projects**: `src/data/loadProjects.ts`
- **Bonds**: `src/data/loadBonds.ts`

### Data Models

**Facility Interface**:
```typescript
interface Facility {
  id: number
  name: string
  facility_type: 'Elementary' | 'Middle' | 'High School' | 'Specialty' | 'Administration' | 'District'
  address?: string
  latitude?: number
  longitude?: number
  current_enrollment: number
  capacity: number
  status: 'Existing' | 'Under Construction' | 'Planned'
  project_count?: number        // Aggregated from API
  total_project_cost?: number   // Aggregated from API
}
```

**Project Interface** (simplified):
```typescript
interface Project {
  id: number
  facility_id?: number          // Link to parent facility
  name: string
  projectType: string
  costEstimate: number
  squareFootage: number
  status: string
  startDate: string
  completionDate: string
  elementalCosts: ElementalCost[]  // Uniformat breakdown
  // ... 40+ more fields
}
```

**Bond Interface**:
```typescript
interface Bond {
  id: number
  bondName: string
  totalBudget: number
  approvalDate?: string
  projects: BondProject[]
  // ... more fields
}
```

### Migration Summary

**12 projects migrated into 8 facilities:**
- **Existing Schools (5)**: Liberty Hill HS, Liberty Hill MS, Bill Burden Elementary, Louine Noble Elementary, Santa Rita Elementary
- **Planned Schools (3)**: Harvest Hills MS, Liberty Legacy HS, Sienna Skys Elementary

### District Map Data

District boundaries are loaded from CSV files in `/public/data/`:
- `district_shapes.csv` - Geographic boundary polygons
- `district_attributes.csv` - District-level metadata

This is the **only remaining CSV usage** in the application.

### Cost Calculation System

Projects have multiple cost components:
- **Base Cost** - Construction costs
- **Site Costs** - Site development
- **Design Costs** - A&E fees (architectural & engineering)
- **Contingency** - Risk buffer
- **Elemental Costs** - Breakdown by building element using Uniformat classification system

All costs roll up to `costEstimate` (total project cost).

**Elemental Cost Structure (Uniformat):**
The app uses Uniformat elemental cost classification, which organizes costs by building systems rather than construction trades. This is ideal for bond planning because:
- Provides strategic view of major building systems (structure, mechanical, electrical, etc.)
- Enables meaningful comparisons across different projects
- Better suited for early-phase planning than detailed trade breakdowns
- Easier for non-technical stakeholders (district managers, board members) to understand

Common elemental cost categories include:
- A1 (Substructure), A2 (Structure), A3 (Enclosure)
- B1 (Partitions), B2 (Finishes), B3 (Equipment)
- C1 (Mechanical), C2 (Electrical), C3 (Site Work)
- Z1 (General Requirements), Z2 (Contingency)

---

## Authentication

### Current: Mock Authentication

Location: `src/components/System/AuthContext.tsx`

**Current Implementation:**
- Hardcoded credentials check
- Session persistence via localStorage
- Global auth state via React Context

**Default Credentials:**
```
Email: apps@pflugerarchitects.com
Password: jPfeTsewgv04
```

**Auth Flow:**
1. User enters credentials in login screen
2. Credentials validated against hardcoded values
3. On success, `isAuthenticated` set to `true`
4. State persisted to localStorage
5. Main app renders

**Ready for Backend Integration:**
The auth system is structured to easily swap in API calls. See `DEVELOPER_HANDOFF.md` for integration details.

---

## Project Structure

```
ProjectPrism/
├── api/                            # Backend API (PHP)
│   ├── config.php                  # Database configuration
│   ├── facilities.php              # Facilities CRUD endpoint
│   ├── projects.php                # Projects CRUD endpoint
│   ├── bonds.php                   # Bonds CRUD endpoint
│   ├── pods.php                    # Space programming API
│   └── auth.php                    # Authentication
├── database/                       # Database schemas & migrations
│   ├── add-facilities-table.sql    # Facilities table creation
│   └── migrate-projects-to-facilities.php
├── public/
│   ├── data/                       # District map CSV files
│   └── assets/                     # Static assets
├── src/
│   ├── main.tsx                    # Vite entry point
│   ├── App.tsx                     # Main app component & routing
│   ├── components/
│   │   ├── MainViews/              # Top-level page components
│   │   │   ├── DashboardStats.tsx
│   │   │   ├── MapView.tsx
│   │   │   ├── MyProjects.tsx
│   │   │   ├── MyBonds.tsx
│   │   │   ├── ProjectBuilderPro.tsx
│   │   │   ├── BondBuilderPro.tsx
│   │   │   └── Settings.tsx
│   │   ├── SideBars/               # Navigation & detail sidebars
│   │   │   ├── AppSidebar.tsx      # Main navigation
│   │   │   ├── DetailSidebar.tsx   # Shared detail sidebar wrapper
│   │   │   ├── ProjectDetailsSidebar.tsx
│   │   │   └── BondDetailsSidebar.tsx
│   │   ├── BondBuilder/            # Bond Builder Pro wizard
│   │   │   ├── BondBuilderPro-BondInfo.tsx
│   │   │   ├── BondBuilderPro-ProjectSelection.tsx
│   │   │   ├── BondBuilderPro-Timeline.tsx
│   │   │   ├── BondBuilderPro-Review.tsx
│   │   │   ├── Timeline.tsx        # Gantt chart component
│   │   │   └── ProjectLibrary.tsx
│   │   ├── ProjectBuilder/         # Project Builder Pro wizard
│   │   │   ├── ProjectBuilderPro-ProjectOverview.tsx
│   │   │   ├── ProjectBuilderPro-LocationSite.tsx
│   │   │   ├── ProjectBuilderPro-SpaceProgramming.tsx
│   │   │   ├── ProjectBuilderPro-SchedulePhases.tsx
│   │   │   ├── ProjectBuilderPro-CostEstimation.tsx
│   │   │   └── ProjectBuilderPro-ReviewFinalize.tsx
│   │   ├── System/                 # Core system components
│   │   │   ├── AuthContext.tsx     # Authentication state
│   │   │   ├── FacilitiesContext.tsx  # Facility state management
│   │   │   ├── ProjectsContext.tsx    # Project state management
│   │   │   ├── BondsContext.tsx       # Bond state management
│   │   │   ├── ThemeManager.tsx    # Theme system
│   │   │   └── ImageWithFallback.tsx
│   │   ├── MyProjects/             # Project-related components
│   │   │   └── ProjectCard.tsx
│   │   └── ui/                     # Radix UI components (shadcn)
│   ├── config/                     # Configuration
│   │   └── apiConfig.ts            # API endpoint configuration
│   ├── data/                       # Data loaders
│   │   ├── loadProjects.ts
│   │   ├── loadBonds.ts
│   │   └── loadPods.ts
│   ├── assets/                     # Images and static files
│   └── styles/                     # Global styles
├── build/                          # Production build output
├── vite.config.ts                  # Vite configuration
├── tailwind.config.js              # Tailwind CSS config
├── tsconfig.json                   # TypeScript config
├── CLAUDE.md                       # Claude Code instructions
├── DEVELOPER_HANDOFF.md            # Backend integration guide
└── README.md                       # This file
```

---

## Key Design Patterns

### 1. Multi-Step Wizards

Both ProjectBuilderPro and BondBuilderPro use step-based wizards:

```typescript
// Parent component maintains state
const [currentStep, setCurrentStep] = useState(1)
const [formData, setFormData] = useState({...})

// Each step is a separate component
<Step1Component
  data={formData}
  onUpdate={setFormData}
  onNext={() => setCurrentStep(2)}
/>
```

- State maintained in parent component
- Each step receives state and setState props
- Navigation controlled by parent
- Data held in memory until final "Create" action

### 2. Pod-Based Space Programming

Projects are built from "Pods" (groups of spaces):

```typescript
interface Pod {
  id: string
  name: string
  description: string
  spaces: Space[]
  totalSF: number
  totalCost: number
}

interface Space {
  name: string
  quantity: number
  sf: number
  costPerSF: number
}
```

**Pod Types:**
- **Pre-built Pods** - Templates (e.g., "Performing Arts Pod")
- **Custom Pods** - User-selected spaces from library

### 3. Timeline Management

Bond Builder uses gantt-task-react for scheduling:

```typescript
// Projects converted to Gantt tasks
const tasks = projects.map(project => ({
  id: project.id,
  name: project.projectName,
  start: new Date(project.startDate),
  end: new Date(project.completionDate),
  type: 'task',
  styles: { backgroundColor: getProjectColor(project.type) }
}))
```

- Drag-and-drop timeline editing
- Visual color-coding by project type
- Date storage in YYYY-MM format

### 4. Theme System

Custom theme system (not standard Tailwind themes):

```typescript
// Project type colors defined in ThemeManager
const projectColors = {
  'New Construction': '#3b82f6',    // Blue
  'Renovation': '#10b981',          // Green
  'Addition': '#f59e0b',            // Amber
  // ...
}
```

- Managed via `ThemeManager.tsx`
- Professional light theme
- Project-type color associations

---

## Known Limitations

### Facilities Architecture
- **Facility UI incomplete** - Backend and context ready, but UI integration pending
- **No facility selection** - Project Builder doesn't yet allow facility selection
- **No facility filtering** - Projects can't be filtered/grouped by facility yet
- **No facility details** - No dedicated facility detail pages

### Authentication & Users
- **Basic auth only** - Not production-ready (no OAuth/JWT)
- **Single user** - No multi-user support
- **Simple sessions** - Basic localStorage only

### Features Not Implemented
- **File uploads** - No document/image upload capability
- **Export functionality** - No PDF/Excel export
- **Email notifications** - No messaging system
- **Audit trail** - No change history tracking
- **Advanced search** - Basic filtering only
- **User roles** - No permission system

---

## Future Development

### Phase 1: Complete Facilities Integration
- [ ] Facility selection UI in Project Builder
- [ ] Facility-based project filtering and grouping
- [ ] Facility detail pages showing all related projects
- [ ] Facility-level reporting and analytics
- [ ] Map view facility clustering
- [ ] Deprecate `project.schoolName` in favor of facility relationship

### Phase 2: Enhanced Authentication
- [ ] Production-ready authentication (OAuth/JWT)
- [ ] User management system
- [ ] Role-based access control
- [ ] Session management improvements

### Phase 3: Enhanced Features
- [ ] File upload (images, documents, attachments)
- [ ] PDF/Excel export for projects and bonds
- [ ] Email notifications for updates
- [ ] Advanced search and filtering
- [ ] Bulk operations (multi-select, batch edit)

### Phase 4: Collaboration & Workflow
- [ ] Multi-user support
- [ ] Real-time updates
- [ ] Comments and annotations
- [ ] Approval workflows
- [ ] Audit trail and version history

### Phase 5: Analytics
- [ ] Advanced reporting
- [ ] Custom dashboards
- [ ] Predictive analytics
- [ ] Budget forecasting

---

## Additional Documentation

- **CLAUDE.md** - Instructions for Claude Code when working with this codebase
- **DEVELOPER_HANDOFF.md** - Backend integration guide with API specs and database schema
- **Figma Design** - https://www.figma.com/design/XzMLl2zEKlfzBkvqF4zAfT/Project-Prism

---

## Development Notes

### Vite Configuration
- Dev server runs on **port 3000**
- Build output goes to `/build` directory
- SWC used for faster React compilation
- Extensive path aliases configured

### Working with the API
All data operations go through the Bluehost PHP API:
- **Development**: Data persists to MySQL database
- **Local testing**: Point to production API at `https://prism.pflugerarchitects.com/api`
- **API Config**: Edit `src/config/apiConfig.ts` to change API base URL

### Adding New Facilities
Use the `FacilitiesContext` methods:
```typescript
const { addFacility } = useFacilities()
await addFacility({
  name: "New Elementary School",
  facility_type: "Elementary",
  status: "Planned",
  current_enrollment: 0,
  capacity: 500
})
```

### Adding New Projects
Use the **Project Builder Pro** wizard in the UI. All changes save to the database via `/api/projects.php`.

### Adding New Bonds
Use the **Bond Builder Pro** wizard in the UI. All changes save to the database via `/api/bonds.php`.

---

## Support & Contact

**Client**: Liberty Hill ISD
**Development**: Pfluger Architects
**Platform**: Powered by Vermulens

For development questions, refer to `CLAUDE.md` or `DEVELOPER_HANDOFF.md`.

---

**Last Updated**: November 13, 2025
