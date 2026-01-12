import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { LucideIcon, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
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

      // Round to whole number for cleaner display during animation
      setCount(Math.round(easeOutCubic * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])

  return count
}

export interface HeroCardAction {
  label: string
  icon?: LucideIcon
  onClick: () => void
  variant?: 'default' | 'destructive'
}

export interface HeroCardMetric {
  label: string
  value: string | number
  format?: (value: string | number) => string
}

export interface HeroCardProps {
  title: string
  subtitle?: string
  badge?: {
    label: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
    className?: string
  }
  primaryValue: {
    value: string | number
    format?: (value: string | number) => string
    className?: string
    animate?: boolean // Enable counting animation for numeric values
  }
  metrics?: HeroCardMetric[]
  footer?: string
  actions?: HeroCardAction[]
  onClick?: () => void
  className?: string
  icon?: LucideIcon
  iconClassName?: string
}

export function HeroCard({
  title,
  subtitle,
  badge,
  primaryValue,
  metrics = [],
  footer,
  actions = [],
  onClick,
  className = "",
  icon: Icon,
  iconClassName = undefined
}: HeroCardProps) {
  const { statusColors, financialColors } = useTheme()

  // Check if value is numeric and should be animated
  const numericValue = typeof primaryValue.value === 'number' ? primaryValue.value : parseFloat(primaryValue.value as string)
  const isNumeric = !isNaN(numericValue) && primaryValue.animate
  const animatedValue = useCountUp(isNumeric ? numericValue : 0, 1200)

  const formatValue = (value: string | number, formatter?: (v: string | number) => string) => {
    return formatter ? formatter(value) : value
  }

  const displayValue = isNumeric ? animatedValue : primaryValue.value

  return (
    <Card
      className={`hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      style={{ backgroundColor: 'var(--theme-card-bg)' }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          {Icon && (
            <div className="flex-shrink-0">
              <Icon className="h-5 w-5" style={{ color: 'var(--theme-icon-color)' }} />
            </div>
          )}
          <div className="space-y-1.5 flex-1 min-w-0">
            <h4 className="text-sm leading-tight line-clamp-2 pr-1" style={{ color: 'var(--theme-text-primary)' }}>{title}</h4>
            {subtitle && (
              <p className="text-xs line-clamp-1" style={{ color: 'var(--theme-text-secondary)' }}>{subtitle}</p>
            )}
            {badge && (
              <Badge
                variant={badge.variant || "secondary"}
                className={`${badge.className || ''} text-xs`}
              >
                {badge.label}
              </Badge>
            )}
          </div>
          {actions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 flex-shrink-0 -mt-1" style={{ color: 'var(--theme-icon-color)' }}>
                  <MoreHorizontal className="h-3.5 w-3.5" style={{ color: 'currentColor' }} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.map((action, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      action.onClick()
                    }}
                    className={action.variant === 'destructive' ? statusColors.error.text : ''}
                    style={action.variant === 'destructive' ? { color: statusColors.error.color } : undefined}
                  >
                    {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0 pb-4">
        <div className="text-3xl font-bold" style={{ color: typeof primaryValue.value === 'number' ? financialColors.positive.color : 'var(--theme-text-primary)' }}>
          {formatValue(displayValue, primaryValue.format)}
        </div>
        {metrics.length > 0 && (
          <div className={`grid gap-3 ${metrics.length === 2 ? 'grid-cols-2' : `grid-cols-${Math.min(metrics.length, 3)}`}`}>
            {metrics.map((metric, index) => (
              <div key={index} className="text-xs">
                <div style={{ color: 'var(--theme-text-secondary)' }}>{metric.label}</div>
                <div className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                  {formatValue(metric.value, metric.format)}
                </div>
              </div>
            ))}
          </div>
        )}
        {footer && (
          <div className="pt-1 border-t">
            <div className="text-xs truncate" style={{ color: 'var(--theme-text-secondary)' }}>
              {footer}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
