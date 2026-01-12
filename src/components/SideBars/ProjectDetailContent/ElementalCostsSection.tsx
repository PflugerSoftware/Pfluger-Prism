import { Building, ChevronDown, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import type { Project } from '../../../data/loadProjects'
import type { CostRateData, ElementalCost } from './types'
import { CATEGORY_ORDER, CATEGORY_COLORS } from './types'
import { calculateElementCost } from './utils'

interface ElementalCostsSectionProps {
  isEditMode: boolean
  project: Project
  editedProject: Project | null
  costRates: CostRateData[]
  costRatesLoading: boolean
  sliderPositions: Record<string, number>
  onSliderChange: (code: string, position: number) => void
  onElementalCostUpdate: (costs: ElementalCost[]) => void
  collapsedCategories: Set<string>
  onToggleCategory: (category: string) => void
}

export function ElementalCostsSection({
  isEditMode,
  project,
  editedProject,
  costRates,
  costRatesLoading,
  sliderPositions,
  onSliderChange,
  onElementalCostUpdate,
  collapsedCategories,
  onToggleCategory
}: ElementalCostsSectionProps) {

  const currentProject = isEditMode && editedProject ? editedProject : project

  const handleSliderChange = (rate: CostRateData, newPos: number) => {
    onSliderChange(rate.elemental_code, newPos)

    if (editedProject) {
      const { costPerSF: newCostPerSF, cost: newCost } = calculateElementCost(
        rate,
        newPos,
        editedProject.squareFootage || 1,
        editedProject.procurementMethod || '',
        editedProject.constructionType || '',
        editedProject.numberOfStories || 1
      )

      const existingCosts = editedProject.elementalCosts || []
      const existingIndex = existingCosts.findIndex(ec => ec.code === rate.elemental_code)

      let newElementalCosts: ElementalCost[]
      if (existingIndex >= 0) {
        newElementalCosts = existingCosts.map(ec =>
          ec.code === rate.elemental_code
            ? { ...ec, costPerSF: newCostPerSF, cost: newCost }
            : ec
        )
      } else {
        newElementalCosts = [
          ...existingCosts,
          {
            code: rate.elemental_code,
            name: rate.code_name,
            costPerSF: newCostPerSF,
            cost: newCost
          }
        ]
      }
      onElementalCostUpdate(newElementalCosts)
    }
  }

  if (costRatesLoading) {
    return (
      <Card className="shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-muted-bg)' }}>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Building className="h-4 w-4" style={{ color: 'var(--theme-primary)' }} />
            Elemental Costs (Uniformat)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4" style={{ color: 'var(--theme-text-secondary)' }}>Loading cost rates...</div>
        </CardContent>
      </Card>
    )
  }

  if (costRates.length === 0) {
    if (project?.elementalCosts && project.elementalCosts.length > 0) {
      return (
        <Card className="shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-muted-bg)' }}>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Building className="h-4 w-4" style={{ color: 'var(--theme-primary)' }} />
              Elemental Costs (Uniformat)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {project.elementalCosts.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-xs py-1 border-b"
                  style={{ borderColor: 'var(--theme-muted-bg)' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono" style={{ color: 'var(--theme-text-tertiary)' }}>{item.code}</span>
                    <span style={{ color: 'var(--theme-text-primary)' }}>{item.name}</span>
                  </div>
                  <div className="flex gap-4">
                    <span style={{ color: 'var(--theme-text-secondary)' }}>${item.costPerSF.toFixed(2)}</span>
                    <span className="font-semibold" style={{ color: 'var(--theme-text-primary)' }}>${(item.cost / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              ))}
              <div className="border-t-2 pt-2 flex justify-between items-center" style={{ borderColor: 'var(--theme-primary)' }}>
                <span className="font-bold" style={{ color: 'var(--theme-text-primary)' }}>Total Construction</span>
                <div className="flex gap-4 text-sm">
                  <span style={{ color: 'var(--theme-text-secondary)' }}>
                    ${Math.round(project.elementalCosts.reduce((sum, item) => sum + item.cost, 0) / project.squareFootage)}/SF
                  </span>
                  <span className="font-bold" style={{ color: 'var(--theme-text-primary)' }}>
                    ${(project.elementalCosts.reduce((sum, item) => sum + item.cost, 0) / 1000000).toFixed(2)}M
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-muted-bg)' }}>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Building className="h-4 w-4" style={{ color: 'var(--theme-primary)' }} />
            Elemental Costs (Uniformat)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8" style={{ color: 'var(--theme-text-secondary)' }}>
            <Building className="h-12 w-12 mx-auto mb-2" style={{ color: 'var(--theme-muted-bg)' }} />
            <p className="text-sm">No elemental cost data available</p>
            <p className="text-xs mt-1" style={{ color: 'var(--theme-text-tertiary)' }}>Cost breakdown by building element has not been added yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Group cost rates by category
  const categories = costRates.reduce((acc, rate) => {
    const category = rate.category || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(rate)
    return acc
  }, {} as Record<string, typeof costRates>)

  let grandTotalCostPerSF = 0
  let grandTotalCost = 0

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-muted-bg)' }}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Building className="h-4 w-4" style={{ color: 'var(--theme-primary)' }} />
          Elemental Costs (Uniformat)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {CATEGORY_ORDER.map(category => {
            const rates = categories[category]
            if (!rates || rates.length === 0) return null

            const categoryColor = CATEGORY_COLORS[category] || '#6B7280'
            const isCollapsed = collapsedCategories.has(category)

            // Calculate category totals
            let categoryCostPerSF = 0
            let categoryCost = 0
            rates.forEach(rate => {
              const sliderPos = sliderPositions[rate.elemental_code] ?? 50
              const { costPerSF, cost } = calculateElementCost(
                rate,
                sliderPos,
                currentProject.squareFootage || 1,
                currentProject.procurementMethod || '',
                currentProject.constructionType || '',
                currentProject.numberOfStories || 1
              )
              categoryCostPerSF += costPerSF
              categoryCost += cost
            })
            grandTotalCostPerSF += categoryCostPerSF
            grandTotalCost += categoryCost

            return (
              <div key={category} className="border rounded-lg overflow-hidden" style={{ borderColor: `${categoryColor}40` }}>
                {/* Category Header - clickable to collapse */}
                <button
                  type="button"
                  onClick={() => onToggleCategory(category)}
                  className="w-full px-3 py-2 flex justify-between items-center cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: `${categoryColor}15` }}
                >
                  <div className="flex items-center gap-2">
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4" style={{ color: categoryColor }} />
                    ) : (
                      <ChevronDown className="h-4 w-4" style={{ color: categoryColor }} />
                    )}
                    <span className="font-semibold text-sm" style={{ color: categoryColor }}>{category}</span>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <span style={{ color: 'var(--theme-text-secondary)' }}>
                      ${categoryCostPerSF.toFixed(2)}/SF
                    </span>
                    <span className="font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                      ${(categoryCost / 1000).toFixed(0)}K
                    </span>
                  </div>
                </button>

                {/* Category Items */}
                {!isCollapsed && (
                  <div className="divide-y" style={{ borderColor: 'var(--theme-muted-bg)' }}>
                    {rates.map((rate) => {
                      const sliderPos = sliderPositions[rate.elemental_code] ?? 50
                      const { costPerSF, cost } = calculateElementCost(
                        rate,
                        sliderPos,
                        currentProject.squareFootage || 1,
                        currentProject.procurementMethod || '',
                        currentProject.constructionType || '',
                        currentProject.numberOfStories || 1
                      )

                      return (
                        <div
                          key={rate.elemental_code}
                          className="px-3 py-2.5 text-xs"
                          style={{ borderColor: 'var(--theme-muted-bg)' }}
                        >
                          {/* Row 1: Code and Name */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}>{rate.elemental_code}</span>
                            <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }} title={rate.code_name}>{rate.code_name}</span>
                          </div>

                          {/* Row 2: Slider with min/max labels and current value */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] w-7 text-right" style={{ color: 'var(--theme-text-tertiary)' }}>
                              ${rate.cost_per_sf_low.toFixed(0)}
                            </span>
                            <div className="flex-1 relative">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={sliderPos}
                                onChange={(e) => handleSliderChange(rate, parseInt(e.target.value))}
                                disabled={!isEditMode}
                                className="w-full h-2 rounded-full appearance-none"
                                style={{
                                  background: `linear-gradient(to right, ${categoryColor} 0%, ${categoryColor} ${sliderPos}%, var(--theme-muted-bg) ${sliderPos}%, var(--theme-muted-bg) 100%)`,
                                  cursor: isEditMode ? 'pointer' : 'default',
                                  opacity: isEditMode ? 1 : 0.8
                                }}
                              />
                              {/* Thumb indicator for read-only mode */}
                              {!isEditMode && (
                                <div
                                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 pointer-events-none"
                                  style={{
                                    left: `calc(${sliderPos}% - 6px)`,
                                    backgroundColor: 'white',
                                    borderColor: categoryColor,
                                    boxShadow: `0 1px 3px rgba(0,0,0,0.2)`
                                  }}
                                />
                              )}
                            </div>
                            <span className="text-[10px] w-7" style={{ color: 'var(--theme-text-tertiary)' }}>
                              ${rate.cost_per_sf_high.toFixed(0)}
                            </span>
                          </div>

                          {/* Row 3: Cost values */}
                          <div className="flex justify-end items-center gap-3 mt-1.5">
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded" style={{ backgroundColor: `${categoryColor}10`, color: categoryColor }}>
                              ${costPerSF.toFixed(2)}/SF
                            </span>
                            <span className="text-xs font-bold" style={{ color: 'var(--theme-text-primary)' }}>
                              ${(cost / 1000).toFixed(0)}K
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

          {/* Grand Total */}
          <div className="border-t-2 pt-3 flex justify-between items-center" style={{ borderColor: 'var(--theme-primary)' }}>
            <span className="font-bold" style={{ color: 'var(--theme-text-primary)' }}>Total Construction</span>
            <div className="flex gap-4 text-sm">
              <span className="font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>
                ${grandTotalCostPerSF.toFixed(2)}/SF
              </span>
              <span className="font-bold" style={{ color: 'var(--theme-text-primary)' }}>
                ${(grandTotalCost / 1000000).toFixed(2)}M
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
