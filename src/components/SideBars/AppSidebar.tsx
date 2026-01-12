import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderOpen,
  Map,
  Building2,
  Wrench,
  Settings,
  PanelLeftOpen,
  PanelLeftClose,
  Briefcase,
  LogOut,
} from "lucide-react";
import { useAuth } from "../System/AuthContext";

import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { ImageWithFallback } from "../System/ImageWithFallback";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import { useTheme } from "../System/ThemeManager";
import lhisdCrest from "figma:asset/liberty-hill-isd-crest.png";
import dustinAkinPhoto from "../../assets/Dustin Akin.png";

type ActiveView = 'dashboard' | 'projects' | 'map' | 'bond-builder' | 'project-builder' | 'my-bonds' | 'settings'

interface AppSidebarProps {
  activeView: ActiveView
  onViewChange: (view: ActiveView) => void
  isExpanded: boolean
  onExpandedChange: (expanded: boolean) => void
}

export function AppSidebar({ activeView, onViewChange, isExpanded, onExpandedChange }: AppSidebarProps) {
  const { componentThemes, currentTheme } = useTheme()
  const sidebarTheme = componentThemes.sidebar[currentTheme === 'dark' ? 'dark' : 'light']
  const { logout, user } = useAuth()

  // Main navigation items
  const items = [
    {
      title: "Dashboard",
      view: "dashboard" as ActiveView,
      icon: LayoutDashboard,
      description: "Overview & analytics"
    },
    {
      title: "Map View",
      view: "map" as ActiveView,
      icon: Map,
      description: "District facilities map"
    },
    {
      title: "My Projects",
      view: "projects" as ActiveView,
      icon: FolderOpen,
      description: "Browse all projects"
    },
    {
      title: "My Bonds",
      view: "my-bonds" as ActiveView,
      icon: Briefcase,
      description: "Bond packages"
    },
    {
      title: "Project Builder Pro",
      view: "project-builder" as ActiveView,
      icon: Wrench,
      description: "Create new project"
    },
    {
      title: "Bond Builder Pro",
      view: "bond-builder" as ActiveView,
      icon: Building2,
      description: "Create bond package"
    },
  ];

  return (
    <>
      {/* Collapse Button - Floating when expanded, inside sidebar when collapsed */}
        {isExpanded && (
        <motion.button
          onClick={() => onExpandedChange(!isExpanded)}
          className={`fixed h-8 w-8 rounded-lg ${sidebarTheme.button.bg} ${sidebarTheme.button.hover} flex items-center justify-center transition-all border ${sidebarTheme.button.border} shadow-md z-[3001]`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0, left: '15.625rem', top: '2.25rem' }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          aria-label="Toggle sidebar"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <PanelLeftClose className="h-4 w-4" style={{ color: 'var(--theme-icon-color)' }} />
        </motion.button>
      )}

      <motion.aside
        className={`${sidebarTheme.container.bg} ${sidebarTheme.container.backdropBlur} fixed overflow-hidden flex flex-col shrink-0 m-4 rounded-2xl ${sidebarTheme.container.shadow} border ${sidebarTheme.container.border} z-[3000]`}
        style={{ height: 'calc(100vh - 2rem)' }}
        initial={false}
        animate={{
          width: isExpanded ? 280 : 80
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >

      {/* Collapse Button when collapsed - Inside sidebar at top */}
      {!isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex justify-center pt-3 pb-2"
        >
          <button
            onClick={() => onExpandedChange(!isExpanded)}
            className={`h-8 w-8 rounded-lg ${sidebarTheme.button.bg} ${sidebarTheme.button.hover} flex items-center justify-center transition-all border ${sidebarTheme.button.border}`}
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="h-4 w-4" style={{ color: 'var(--theme-icon-color)' }} />
          </button>
        </motion.div>
      )}

      {/* Header with Logo */}
      <div className={`${isExpanded ? 'p-4' : 'p-2'} pb-3 border-b ${sidebarTheme.divider}`}>
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3 w-full">
            <div className="flex items-center justify-center flex-shrink-0">
              <div className="bg-black rounded-lg flex items-center justify-center px-1.5 py-0.5 h-6 w-12">
                <span className="text-white font-semibold text-[10px]">Pfluger</span>
              </div>
            </div>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col overflow-hidden"
                >
                  <span className="text-sm font-semibold leading-tight whitespace-nowrap">Prism</span>
                  <span className="text-[10px] whitespace-nowrap" style={{ color: 'var(--theme-text-tertiary)' }}>Powered by Vermulens</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-1">
          {items.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeView === item.view;

            return (
              <motion.button
                key={item.view}
                onClick={() => onViewChange(item.view)}
                className={`
                  relative w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                  ${isActive ? sidebarTheme.nav.active : sidebarTheme.nav.hover}
                `}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-r"
                    style={{ backgroundColor: sidebarTheme.activeBg }}
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`p-2 rounded-lg ${isActive ? sidebarTheme.icon.active : sidebarTheme.icon.inactive}`}>
                  <Icon className="w-5 h-5" style={{ color: 'var(--theme-icon-color)' }} />
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden text-left"
                    >
                      <span className="font-medium whitespace-nowrap text-sm text-left" style={{ color: isActive ? 'var(--theme-text-primary)' : 'var(--theme-text-secondary)' }}>
                        {item.title}
                      </span>
                      <p className="text-xs whitespace-nowrap text-left" style={{ color: 'var(--theme-text-tertiary)' }}>{item.description}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Footer with User Profile, Settings, Help and Liberty Hill Logo */}
      <div className={`p-0 mt-auto border-t ${sidebarTheme.divider}`}>
        {/* Liberty Hill ISD Logo */}
        <div className={`w-full flex items-center justify-center py-3 border-b ${sidebarTheme.divider}`}>
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                key="expanded-logo"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="w-1/2 aspect-square"
              >
                <ImageWithFallback
                  src="https://files.smartsites.parentsquare.com/3558/header_logo_img_hoxz2a.png"
                  alt="Liberty Hill ISD"
                  className="w-full h-full object-contain"
                />
              </motion.div>
            ) : (
              <motion.div
                key="collapsed-logo"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="w-3/4 aspect-square"
              >
                <ImageWithFallback
                  src="https://files.smartsites.parentsquare.com/3558/header_logo_img_hoxz2a.png"
                  alt="Liberty Hill ISD"
                  className="w-full h-full object-contain"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-3">
          <div className="space-y-1">
            {/* User Profile */}
            <motion.button
              className={`w-full ${isExpanded ? 'p-3' : 'p-1.5 justify-center'} ${sidebarTheme.nav.hover} rounded-lg flex items-center gap-3`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Avatar className={`${isExpanded ? 'h-9 w-9' : 'h-8 w-8'} flex-shrink-0`}>
                <AvatarImage src={dustinAkinPhoto} alt="Dustin Akin" />
                <AvatarFallback className="bg-sky-blue text-white">
                  DA
                </AvatarFallback>
              </Avatar>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 min-w-0 overflow-hidden"
                  >
                        <div className="font-medium text-sm whitespace-nowrap text-left" style={{ color: 'var(--theme-text-primary)' }}>Dustin Akin</div>
                        <div className="text-xs whitespace-nowrap text-left" style={{ color: 'var(--theme-text-secondary)' }}>Executive Director of Operations</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Settings */}
            <motion.button
              onClick={() => onViewChange('settings')}
              className={`
                relative w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                ${activeView === 'settings' ? sidebarTheme.nav.active : sidebarTheme.nav.hover}
              `}
              whileHover={{ x: 4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {activeView === 'settings' && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-r"
                  style={{ backgroundColor: sidebarTheme.activeBg }}
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className={`p-2 rounded-lg ${activeView === 'settings' ? sidebarTheme.icon.active : sidebarTheme.icon.inactive}`}>
                <Settings className="h-5 w-5" style={{ color: 'var(--theme-icon-color)' }} />
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <span className="font-medium whitespace-nowrap text-sm" style={{ color: 'var(--theme-text-primary)' }}>Settings</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Sign Out */}
            <motion.button
              onClick={logout}
              className={`
                relative w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                ${sidebarTheme.nav.hover}
              `}
              whileHover={{ x: 4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`p-2 rounded-lg ${sidebarTheme.icon.inactive}`}>
                <LogOut className="h-5 w-5" style={{ color: 'var(--theme-icon-color)' }} />
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <span className="font-medium whitespace-nowrap text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Sign Out</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.aside>
    </>
  );
}