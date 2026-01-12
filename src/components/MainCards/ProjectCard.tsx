import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Eye, Edit, MoreHorizontal, CheckCircle2, Building2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { useTheme, getProjectTypeColor } from "../System/ThemeManager"

// Custom hook for counting animation with easing
function useCountUp(end: number, duration: number = 1500) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number | null = null
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      // Easing function: ease out cubic for smooth deceleration
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)

      // For values less than 10, keep decimal precision, otherwise round
      const value = easeOutCubic * end
      setCount(end < 10 ? value : Math.round(value))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])

  return count
}

interface Project {
  id: number
  name: string
  schoolName?: string
  buildingType: string
  projectType: string
  costEstimate: number
  lastModified: string
  status: string
  squareFootage: number
  address: string
  siteArea: string
  capacity: number
  duration: string
  startDate: string
  completionDate: string
  baseCost: number
  siteCosts: number
  designCosts: number
  contingency: number
}

interface ProjectHeroProps {
  project: Project
  onView: (project: Project) => void
  buildingTypeColors: Record<string, string>
  statusColors: Record<string, string>
  isCompareMode?: boolean
  isSelected?: boolean
  onToggleSelect?: () => void
  facilityName?: string
  showFacilityBadge?: boolean
}

export function ProjectHero({
  project,
  onView,
  buildingTypeColors,
  statusColors,
  isCompareMode = false,
  isSelected = false,
  onToggleSelect,
  facilityName,
  showFacilityBadge = false
}: ProjectHeroProps) {
  const { financialColors, utils } = useTheme()
  const targetValue = project.costEstimate / 1000000
  const animatedValue = useCountUp(targetValue, 1200)
  const [isHovered, setIsHovered] = useState(false)

  // Get the color for this project type from centralized theme function
  const projectColor = getProjectTypeColor(project.projectType)

  const handleClick = () => {
    if (isCompareMode && onToggleSelect) {
      onToggleSelect()
    } else if (!isCompareMode) {
      onView(project)
    }
  }

  return (
    <Card
      className={`transition-all duration-300 group overflow-hidden relative hover:border-opacity-50 ${
        isCompareMode ? 'cursor-pointer' : 'cursor-pointer hover:shadow-xl'
      } ${
        isSelected ? 'ring-4 ring-offset-2' : 'border-2'
      }`}
      style={{
        borderColor: isSelected
          ? projectColor.color
          : (isHovered && !isCompareMode ? projectColor.color : 'transparent'),
        transform: isHovered && !isCompareMode ? 'translateY(-4px)' : 'translateY(0)',
        backgroundColor: isSelected ? utils.rgba(projectColor.color, 0.05) : 'var(--theme-card-bg)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Colored accent bar on left */}
      <div
        className="absolute left-0 top-0 bottom-0 transition-all duration-300"
        style={{
          backgroundColor: projectColor.color,
          width: isHovered ? '6px' : '4px'
        }}
      />

      {/* Subtle background gradient on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${utils.rgba(projectColor.color, 0.02)} 0%, ${utils.rgba(projectColor.color, 0.05)} 100%)`
        }}
      />

      <CardHeader className="pb-3 pl-6 relative z-10">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {isSelected && (
                <CheckCircle2
                  className="h-5 w-5 flex-shrink-0"
                  style={{ color: projectColor.color }}
                  strokeWidth={2.5}
                />
              )}
              <h4 className="text-sm font-semibold leading-tight line-clamp-2 pr-1 transition-colors" style={{ color: 'var(--theme-text-primary)' }}>
                {project.name}
              </h4>
            </div>
            {project.schoolName && !showFacilityBadge && (
              <div className="text-xs truncate transition-colors" style={{ color: 'var(--theme-text-secondary)' }}>
                {project.schoolName}
              </div>
            )}
            {showFacilityBadge && facilityName && (
              <div className="flex items-center gap-1.5 text-xs transition-colors" style={{ color: 'var(--theme-text-secondary)' }}>
                <Building2 className="h-3 w-3" style={{ color: 'var(--theme-icon-color)' }} />
                <span className="truncate font-medium">{facilityName}</span>
              </div>
            )}
            <Badge
              variant="secondary"
              className="text-xs font-medium transition-all duration-300"
              style={{
                backgroundColor: isHovered ? utils.rgba(projectColor.color, 0.15) : utils.rgba(projectColor.color, 0.1),
                color: projectColor.color,
                border: `1px solid ${isHovered ? utils.rgba(projectColor.color, 0.3) : utils.rgba(projectColor.color, 0.2)}`
              }}
            >
              {project.projectType}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 flex-shrink-0 -mt-1 transition-colors"
                onClick={(e) => e.stopPropagation()}
                style={{ color: 'var(--theme-icon-color)' }}
              >
                <MoreHorizontal className="h-3.5 w-3.5" style={{ color: 'currentColor' }} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(project)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0 pb-4 pl-6 relative z-10">
          <div
            className="text-2xl font-bold transition-all duration-300"
            style={{
              color: projectColor.color,
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              transformOrigin: 'left center'
            }}
          >
            ${animatedValue.toFixed(1)}M
          </div>
        <div className="pt-1 border-t group-hover:border-gray-300 dark:group-hover:border-gray-600 transition-colors">
          <div className="text-xs truncate" style={{ color: 'var(--theme-text-secondary)' }}>
            Last edited {project.lastModified}
          </div>
        </div>
      </CardContent>

      {/* Shimmer effect on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${utils.rgba(projectColor.color, 0.1)} 50%, transparent 100%)`,
          transform: isHovered ? 'translateX(100%)' : 'translateX(-100%)',
          transition: 'transform 0.7s ease-in-out'
        }}
      />
    </Card>
  )
}
