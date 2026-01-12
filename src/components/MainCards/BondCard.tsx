import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Badge } from "../ui/badge"
import { Calendar as CalendarIcon, CheckCircle2 } from "lucide-react"
import { useTheme } from "../System/ThemeManager"

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

interface BondProject {
  id: string
  name: string
  type: string
  cost: number
  startDate: string
  endDate: string
  duration: number
}

interface Bond {
  id: number
  name: string
  totalValue: number
  totalBudget?: number
  projectCount: number
  status: string
  approvalDate: string
  startYear: number
  endYear: number
  projects: BondProject[]
}

interface BondCardProps {
  bond: Bond
  onView: (bond: Bond) => void
  statusColors: Record<string, string>
  projectTypeColors: Record<string, string>
  isCompareMode?: boolean
  isSelected?: boolean
  onToggleSelect?: () => void
  isSelectDisabled?: boolean
}

export function BondCard({
  bond,
  onView,
  statusColors,
  projectTypeColors,
  isCompareMode = false,
  isSelected = false,
  onToggleSelect,
  isSelectDisabled = false
}: BondCardProps) {
  const { colors, financialColors, statusColors: themeStatusColors, utils } = useTheme()
  const [isHovered, setIsHovered] = useState(false)
  const targetValue = bond.totalValue / 1000000
  const animatedValue = useCountUp(targetValue, 1200)

  // Get bond status color from theme
  const getBondStatusColor = () => {
    const status = bond.status.toLowerCase()
    if (status.includes('approved') || status.includes('active')) return themeStatusColors.success.color
    if (status.includes('draft') || status.includes('pending')) return themeStatusColors.warning.color
    if (status.includes('complete')) return themeStatusColors.info.color
    return themeStatusColors.neutral.color
  }

  const bondStatusColor = getBondStatusColor()

  // Calculate budget status
  const budgetUsagePercent = (bond.totalValue / (bond.totalBudget || bond.totalValue)) * 100
  const getBudgetColor = () => {
    if (budgetUsagePercent > 100) return financialColors.negative.color
    if (budgetUsagePercent > 85) return themeStatusColors.warning.color
    return financialColors.positive.color
  }
  const budgetColor = getBudgetColor()

  const handleClick = () => {
    if (isCompareMode && onToggleSelect) {
      onToggleSelect()
    } else if (!isCompareMode) {
      onView(bond)
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
          ? bondStatusColor
          : (isHovered && !isCompareMode ? bondStatusColor : 'transparent'),
        transform: isHovered && !isCompareMode ? 'translateY(-4px)' : 'translateY(0)',
        backgroundColor: isSelected ? utils.rgba(bondStatusColor, 0.05) : 'var(--theme-card-bg)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Colored accent bar on left */}
      <div
        className="absolute left-0 top-0 bottom-0 transition-all duration-300"
        style={{
          backgroundColor: bondStatusColor,
          width: isHovered ? '6px' : '4px'
        }}
      />

      {/* Subtle background gradient on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${utils.rgba(bondStatusColor, 0.02)} 0%, ${utils.rgba(bondStatusColor, 0.05)} 100%)`
        }}
      />

      <CardHeader className="pb-3 pl-6 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {isSelected && (
                  <CheckCircle2
                    className="h-5 w-5 flex-shrink-0"
                    style={{ color: bondStatusColor }}
                    strokeWidth={2.5}
                  />
                )}
                <h4 className="text-sm font-semibold leading-tight transition-colors" style={{ color: 'var(--theme-text-primary)' }}>
                  {bond.name}
                </h4>
                <Badge
                  variant="secondary"
                  className="text-xs font-medium transition-all duration-300"
                  style={{
                    backgroundColor: isHovered ? utils.rgba(bondStatusColor, 0.15) : utils.rgba(bondStatusColor, 0.1),
                    color: bondStatusColor,
                    border: `1px solid ${isHovered ? utils.rgba(bondStatusColor, 0.3) : utils.rgba(bondStatusColor, 0.2)}`
                  }}
                >
                  {bond.status}
                </Badge>
              </div>

            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0 pb-4 pl-6 relative z-10">
        <div
          className="text-2xl font-bold transition-all duration-300"
          style={{
            color: bondStatusColor,
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            transformOrigin: 'left center'
          }}
        >
          ${animatedValue.toFixed(1)}M
        </div>

        {/* Capacity Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
            <span>{bond.projectCount} projects</span>
            <span>{Math.round(budgetUsagePercent)}% used</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden relative" style={{ backgroundColor: 'var(--theme-muted-bg)' }}>
            <div
              className="h-full transition-all duration-500"
              style={{
                backgroundColor: budgetColor,
                width: `${Math.min(budgetUsagePercent, 100)}%`
              }}
            />
          </div>
          <div className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
            ${(bond.totalValue / 1000000).toFixed(1)}M of ${((bond.totalBudget || bond.totalValue) / 1000000).toFixed(1)}M budget
          </div>
        </div>

        <div className="text-xs transition-colors" style={{ color: 'var(--theme-text-secondary)' }}>
          <CalendarIcon className="h-3 w-3 inline mr-1" style={{ color: 'var(--theme-text-secondary)' }} />
          {bond.startYear} - {bond.endYear}
        </div>
      </CardContent>

      {/* Shimmer effect on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${utils.rgba(bondStatusColor, 0.1)} 50%, transparent 100%)`,
          transform: isHovered ? 'translateX(100%)' : 'translateX(-100%)',
          transition: 'transform 0.7s ease-in-out'
        }}
      />
    </Card>
  )
}
