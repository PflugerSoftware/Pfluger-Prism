import { DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Input } from "../../ui/input"

interface CostSummaryRingsProps {
  baseCost: number
  siteCost: number
  designCost: number
  contingencyCost: number
  squareFootage: number
  isEditMode: boolean
  onSiteCostChange?: (value: number) => void
  onDesignCostChange?: (value: number) => void
  onContingencyChange?: (value: number) => void
}

export function CostSummaryRings({
  baseCost,
  siteCost,
  designCost,
  contingencyCost,
  squareFootage,
  isEditMode,
  onSiteCostChange,
  onDesignCostChange,
  onContingencyChange
}: CostSummaryRingsProps) {
  const totalCost = baseCost + siteCost + designCost + contingencyCost
  const nonBaseCost = siteCost + designCost + contingencyCost

  const rings = [
    { name: 'Base', value: baseCost, color: '#00A9E0', percent: totalCost > 0 ? (baseCost / totalCost) * 100 : 0 },
    { name: 'Site', value: siteCost, color: '#67823A', percent: nonBaseCost > 0 ? (siteCost / nonBaseCost) * 100 : 0, onChange: onSiteCostChange },
    { name: 'Design', value: designCost, color: '#003C71', percent: nonBaseCost > 0 ? (designCost / nonBaseCost) * 100 : 0, onChange: onDesignCostChange },
    { name: 'Contingency', value: contingencyCost, color: '#F2A900', percent: nonBaseCost > 0 ? (contingencyCost / nonBaseCost) * 100 : 0, onChange: onContingencyChange },
  ]

  const size = 180
  const strokeWidth = 12
  const gap = 4
  const center = size / 2

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-muted-bg)' }}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <DollarSign className="h-4 w-4" style={{ color: 'var(--theme-accent)' }} />
          Cost Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          {/* Total header */}
          <div className="w-full mb-4 pb-4 border-b text-center" style={{ borderColor: 'var(--theme-muted-bg)' }}>
            <span className="text-2xl font-bold" style={{ color: 'var(--theme-text-primary)' }}>
              ${(totalCost / 1000000).toFixed(2)}M
            </span>
            <span className="text-sm ml-2" style={{ color: 'var(--theme-text-tertiary)' }}>
              ${Math.round(totalCost / (squareFootage || 1))}/SF
            </span>
          </div>

          {/* Activity Rings SVG */}
          <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
              {rings.map((ring, index) => {
                const radius = center - (strokeWidth / 2) - (index * (strokeWidth + gap)) - 10
                const circumference = 2 * Math.PI * radius
                const strokeDashoffset = circumference - (ring.percent / 100) * circumference

                return (
                  <g key={ring.name}>
                    {/* Background ring */}
                    <circle
                      cx={center}
                      cy={center}
                      r={radius}
                      fill="none"
                      stroke={`${ring.color}20`}
                      strokeWidth={strokeWidth}
                    />
                    {/* Progress ring */}
                    <circle
                      cx={center}
                      cy={center}
                      r={radius}
                      fill="none"
                      stroke={ring.color}
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      style={{
                        transition: 'stroke-dashoffset 0.5s ease-in-out',
                        filter: `drop-shadow(0 0 3px ${ring.color}40)`
                      }}
                    />
                  </g>
                )
              })}
            </svg>
          </div>

          {/* Legend with editable inputs */}
          <div className="w-full mt-4 space-y-2">
            {rings.map((ring) => (
              <div key={ring.name} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: ring.color, boxShadow: `0 0 6px ${ring.color}60` }}
                  />
                  <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>{ring.name}</span>
                </div>
                {isEditMode && ring.name !== 'Base' && ring.onChange ? (
                  <Input
                    type="text"
                    value={Math.round(ring.value).toLocaleString()}
                    onChange={(e) => {
                      const numValue = parseFloat(e.target.value.replace(/,/g, '')) || 0
                      ring.onChange?.(numValue)
                    }}
                    className="h-6 text-xs font-medium text-right w-28"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                      ${(ring.value / 1000000).toFixed(2)}M
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${ring.color}20`, color: ring.color }}>
                      {ring.percent.toFixed(0)}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
