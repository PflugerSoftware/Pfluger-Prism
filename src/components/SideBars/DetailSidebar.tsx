import { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from "../ui/button"
import { useTheme } from "../System/ThemeManager"

interface DetailSidebarProps {
  isOpen: boolean
  isMainSidebarExpanded: boolean
  onClose: () => void

  // Header content
  title: string
  badges?: ReactNode
  headerColor?: string
  quickStats?: ReactNode

  // Action buttons (top-right corner)
  actionButtons?: ReactNode

  // Tabs header (sticky, above scrollable content)
  tabsHeader?: ReactNode

  // Main content (tabs, cards, etc.)
  children: ReactNode

  // Optional custom z-index
  zIndex?: number

  // Optional: adjust for parent padding (for non-map views)
  hasParentPadding?: boolean

  // Map view specific props
  isMapView?: boolean
  isMapSearchPanelCollapsed?: boolean
  panelIndex?: number // For stacking multiple panels
}

export function DetailSidebar({
  isOpen,
  isMainSidebarExpanded,
  onClose,
  title,
  badges,
  headerColor,
  quickStats,
  actionButtons,
  children,
  zIndex = 2000,
  hasParentPadding = false,
  isMapView = false,
  isMapSearchPanelCollapsed = false,
  panelIndex = 0
}: DetailSidebarProps) {
  const { componentThemes, currentTheme } = useTheme()
  const detailTheme = componentThemes.sidebar.detail[currentTheme === 'dark' ? 'dark' : 'light']

  // Calculate left position based on context
  const calculateLeftPosition = () => {
    if (isMapView) {
      // In map view, position after main sidebar + search panel + previous panels
      const mainSidebarWidth = isMainSidebarExpanded ? 280 : 80
      const searchPanelWidth = isMapSearchPanelCollapsed ? 60 : 288 // 288px = 384px * 0.75
      const margin = 16 // Consistent margin/gap throughout (1rem)
      const panelWidth = 384 // Each detail panel width (96 * 4 = 384px)

      // Main sidebar margin (16) + main sidebar width (280/80) + gap (16) + search panel width + gap (16) + (panel stacking)
      const baseLeft = margin + mainSidebarWidth + margin + searchPanelWidth + margin
      const stackOffset = panelIndex * (panelWidth + margin) // Each panel is 384px wide with 16px gap

      return `${baseLeft + stackOffset}px`
    } else {
      // Default position for non-map views
      return isMainSidebarExpanded ? '316px' : '116px'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="fixed w-96"
          style={{
            top: '1rem', // 16px to match App sidebar margin
            bottom: '1rem', // 16px to match App sidebar margin
            left: calculateLeftPosition(),
            transition: 'left 0.3s ease-in-out',
            zIndex
          }}
        >
          <div className={`h-full flex flex-col ${detailTheme.container.bg} ${detailTheme.container.backdropBlur} border ${detailTheme.container.border} ${detailTheme.container.shadow} rounded-2xl overflow-hidden`}>
            {/* Action Buttons - Top right corner */}
            <div className={`sticky top-0 px-4 pt-4 pb-2 z-20 flex justify-end gap-2`}>
              {actionButtons || (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Header - Full width */}
            <div
              className={`sticky top-[60px] ${detailTheme.header.border} px-4 py-4 z-10 transition-colors duration-300`}
              style={{
                backgroundColor: headerColor || undefined
              }}
            >
              <h2 className="text-2xl font-semibold mb-2 truncate" style={{ color: 'var(--theme-text-primary)' }}>{title}</h2>

              {/* Badges */}
              {badges && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {badges}
                </div>
              )}

              {/* Quick Stats */}
              {quickStats && (
                <div className="mt-4">
                  {quickStats}
                </div>
              )}
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {children}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
