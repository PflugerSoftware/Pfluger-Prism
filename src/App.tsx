import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TooltipProvider } from "./components/ui/tooltip"
import { Toaster } from "./components/ui/sonner"
import { ThemeProvider } from "./components/System/ThemeManager"
import { AuthProvider, useAuth } from "./components/System/AuthContext"
import { ProjectsProvider } from "./components/System/ProjectsContext"
import { BondsProvider } from "./components/System/BondsContext"
import { FacilitiesProvider } from "./components/System/FacilitiesContext"
import { ProjectPrismLogin } from "./components/MainViews/Login"
import { AppSidebar } from "./components/SideBars/AppSidebar"
import { DashboardStats } from "./components/MainViews/DashboardStats"
import { MyProjects } from "./components/MainViews/MyProjects"
import { MyBonds } from "./components/MainViews/MyBonds"
import { MyFacilities } from "./components/MainViews/MyFacilities"
import { MapView } from "./components/MainViews/MapView"
import { BondBuilderPro } from "./components/MainViews/BondBuilderPro"
import { ProjectBuilderPro } from "./components/MainViews/ProjectBuilderPro"
import { Settings } from "./components/MainViews/Settings"
import { CostEntry } from "./components/MainViews/CostEntry"
import { ProjectDetailContent } from "./components/SideBars/ProjectDetailContent"
import { BondDetailsContent } from "./components/SideBars/BondDetailsContent"
import type { Project } from "./data/loadProjects"
import type { Bond } from "./data/loadBonds"

type ActiveView = 'dashboard' | 'projects' | 'map' | 'bond-builder' | 'project-builder' | 'my-bonds' | 'my-facilities' | 'settings'

function MainAppContent() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard')
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)

  // Detail sidebar state - managed at App level
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedBond, setSelectedBond] = useState<Bond | null>(null)
  const [isProjectSidebarOpen, setIsProjectSidebarOpen] = useState(false)
  const [isBondSidebarOpen, setIsBondSidebarOpen] = useState(false)

  // Map view search panel state
  const [isMapSearchPanelCollapsed, setIsMapSearchPanelCollapsed] = useState(false)

  const handleViewChange = (view: ActiveView) => {
    setActiveView(view)
    // Close detail sidebars when switching views
    setIsProjectSidebarOpen(false)
    setIsBondSidebarOpen(false)
    setSelectedProject(null)
    setSelectedBond(null)
  }

  // Handlers for opening detail sidebars
  const handleOpenProjectSidebar = (project: Project) => {
    setSelectedProject(project)
    setIsProjectSidebarOpen(true)
    setIsBondSidebarOpen(false) // Close bond sidebar if open
  }

  const handleOpenBondSidebar = (bond: Bond) => {
    setSelectedBond(bond)
    setIsBondSidebarOpen(true)
    setIsProjectSidebarOpen(false) // Close project sidebar if open
  }

  const handleCloseProjectSidebar = () => {
    setIsProjectSidebarOpen(false)
    setSelectedProject(null)
  }

  const handleCloseBondSidebar = () => {
    setIsBondSidebarOpen(false)
    setSelectedBond(null)
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardStats onNavigate={handleViewChange} onViewBond={handleOpenBondSidebar} />
      case 'projects':
        return <MyProjects
          onNavigate={handleViewChange}
          isSidebarExpanded={isSidebarExpanded}
          onOpenProjectSidebar={handleOpenProjectSidebar}
        />
      case 'my-bonds':
        return <MyBonds
          onNavigate={handleViewChange}
          isSidebarExpanded={isSidebarExpanded}
          onOpenBondSidebar={handleOpenBondSidebar}
        />
      case 'my-facilities':
        return <MyFacilities onNavigate={handleViewChange} />
      case 'map':
        return <MapView
          isSidebarExpanded={isSidebarExpanded}
          onOpenProjectSidebar={handleOpenProjectSidebar}
          onSearchPanelCollapsedChange={setIsMapSearchPanelCollapsed}
          isProjectDetailOpen={isProjectSidebarOpen}
        />
      case 'bond-builder':
        return <BondBuilderPro onNavigate={handleViewChange} />
      case 'project-builder':
        return <ProjectBuilderPro onNavigate={handleViewChange} />
      case 'settings':
        return <Settings />
      default:
        return <DashboardStats onNavigate={handleViewChange} onViewBond={handleOpenBondSidebar} />
    }
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ backgroundColor: 'var(--theme-app-bg)' }}>
      {/* Main content - full screen */}
      <main className="absolute inset-0 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{
              opacity: 1,
              scale: 1,
              // Apply padding for all views except map (which is truly full-screen)
              paddingLeft: activeView === 'map'
                ? 0
                : (isSidebarExpanded ? '316px' : '116px')
            }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className={activeView === 'bond-builder' || activeView === 'project-builder' || activeView === 'map' ? 'flex-1 h-full' : 'flex-1 p-6 overflow-auto'}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Main Sidebar - floating above content */}
      <AppSidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        isExpanded={isSidebarExpanded}
        onExpandedChange={setIsSidebarExpanded}
      />

      {/* Detail Sidebars - at App level, outside padded containers */}
      {/* Don't show project detail for map view - MapView handles its own panels */}
      {activeView !== 'map' && (
        <ProjectDetailContent
          project={selectedProject}
          isOpen={isProjectSidebarOpen}
          isMainSidebarExpanded={isSidebarExpanded}
          onClose={handleCloseProjectSidebar}
          isMapView={false}
          isMapSearchPanelCollapsed={isMapSearchPanelCollapsed}
        />
      )}

      <BondDetailsContent
        bond={selectedBond}
        isOpen={isBondSidebarOpen}
        isMainSidebarExpanded={isSidebarExpanded}
        onClose={handleCloseBondSidebar}
      />
    </div>
  )
}

// Vermulens-specific app - just the cost entry page
function VermulensApp() {
  const { logout } = useAuth()

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9fafb' }}>
      {/* Simple header for Vermulens */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Project Prism - Cost Entry</h1>
          <p className="text-sm text-gray-500">Vermulens Cost Estimator Portal</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Sign Out
        </button>
      </div>
      <CostEntry />
    </div>
  )
}

function MainApp() {
  const { isAuthenticated, isLoading, user, login, error, clearError } = useAuth()

  // Show loading state while checking authentication
  if (isLoading && !error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #f3f4f6, #e5e7eb, #d1d5db)' }}>
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <ProjectPrismLogin
        onLogin={login}
        error={error}
        isLoading={isLoading}
        onClearError={clearError}
      />
    )
  }

  // Vermulens users get their own simplified app
  if (user?.role === 'vermulens') {
    return <VermulensApp />
  }

  return (
    <TooltipProvider>
      <MainAppContent />
      <Toaster />
    </TooltipProvider>
  )
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <FacilitiesProvider>
          <ProjectsProvider>
            <BondsProvider>
              <MainApp />
            </BondsProvider>
          </ProjectsProvider>
        </FacilitiesProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}