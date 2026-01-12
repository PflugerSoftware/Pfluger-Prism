import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { Input } from '../ui/input'
import {
  Building2,
  DollarSign,
  FileText,
  Download,
  Calendar,
  Target,
  CheckCircle,
  Edit,
  X,
  Check,
  RotateCcw,
  Save,
  Clock
} from 'lucide-react'
import { useTheme } from "../System/ThemeManager"
import { BondBuilderTempBond, Project, Package } from './BondBuilderPro'
import { useBonds } from '../System/BondsContext'
import { Bond, BondProject } from '../../data/loadBonds'

interface BondBuilderProReviewProps {
  tempBond: BondBuilderTempBond
  setTempBond: React.Dispatch<React.SetStateAction<BondBuilderTempBond>>
  availableProjects: Project[]
  packages: Package[]
  onNavigate?: (view: 'my-bonds') => void
}

export function BondBuilderProReview({
  tempBond,
  setTempBond,
  availableProjects,
  packages,
  onNavigate
}: BondBuilderProReviewProps) {
  const { colors, themeColors } = useTheme()
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [isEditingTarget, setIsEditingTarget] = useState(false)
  const [customTargetAmount, setCustomTargetAmount] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [isButtonHovered, setIsButtonHovered] = useState(false)
  const { bonds, addBond } = useBonds()

  // Match projects by base ID (in case timeline added suffixes)
  const selectedProjects = availableProjects.filter(p => {
    const baseId = p.id.split('-')[0]
    return tempBond.selectedProjectIds.includes(baseId) || tempBond.selectedProjectIds.includes(p.id)
  })

  const currentYear = new Date().getFullYear()
  const yearsUntilStart = tempBond.bondStartYear - currentYear
  const inflationMultiplier = Math.pow(1 + tempBond.annualInflationRate / 100, yearsUntilStart)
  
  const totalBaseCost = selectedProjects.reduce((sum, p) => sum + p.cost, 0)
  const totalCost = totalBaseCost * inflationMultiplier
  const totalSquareFootage = selectedProjects.reduce((sum, p) => sum + (p.squareFootage || 0), 0)
  
  // Calculate total interest over bond term
  const calculateTotalInterest = () => {
    const principal = totalCost
    const rate = tempBond.interestRate / 100
    const years = tempBond.timelineYears
    return principal * rate * (years + 1) / 2
  }
  
  const totalInterest = calculateTotalInterest()
  const totalCostWithInterest = totalCost + totalInterest

  // Calculate target bond amount - rounded up to nearest 5M
  const roundToNearest5M = (amount: number): number => {
    const fiveMillion = 5000000
    return Math.ceil(amount / fiveMillion) * fiveMillion
  }

  const calculatedTargetAmount = roundToNearest5M(totalCostWithInterest)
  const targetBondAmount = tempBond.targetBondAmount || calculatedTargetAmount
  const remainingCapacity = targetBondAmount - totalCostWithInterest
  const isUnderTarget = remainingCapacity > 0

  const handleEditTarget = () => {
    setCustomTargetAmount((targetBondAmount / 1000000).toFixed(1))
    setIsEditingTarget(true)
  }

  const handleSaveTarget = () => {
    const newAmount = parseFloat(customTargetAmount) * 1000000
    if (!isNaN(newAmount) && newAmount > 0) {
      setTempBond({ ...tempBond, targetBondAmount: newAmount })
    }
    setIsEditingTarget(false)
  }

  const handleCancelEdit = () => {
    setIsEditingTarget(false)
    setCustomTargetAmount('')
  }

  const handleResetToCalculated = () => {
    setTempBond({ ...tempBond, targetBondAmount: undefined })
    setIsEditingTarget(false)
    setCustomTargetAmount('')
  }

  const handleSaveBond = async () => {
    setIsSaving(true)

    try {
      // Generate new bond ID (max existing ID + 1) - this will be overwritten by API
      const maxId = bonds.length > 0 ? Math.max(...bonds.map(b => b.id)) : 0
      const newBondId = maxId + 1

      // Map project types from Bond Builder format to display format
      const projectTypeMap: Record<string, string> = {
        'new-construction': 'New Construction',
        'renovation': 'Renovations',
        'addition': 'Additions',
        'equity': 'Equity Improvements',
        'specialty': 'Specialty'
      }

      // Extract project IDs (convert string IDs to numbers)
      const projectIds = selectedProjects.map(p => parseInt(p.id))

      // Debug: Check for duplicates

      // Remove any duplicates to prevent database issues
      const uniqueProjectIds = [...new Set(projectIds)]
      if (uniqueProjectIds.length !== projectIds.length) {
      }

      // Create new bond object
      const newBond: Bond = {
        id: newBondId,
        name: tempBond.bondName || 'Untitled Bond',
        totalValue: totalCost,
        totalBudget: targetBondAmount,
        projectCount: uniqueProjectIds.length, // Use unique count
        status: 'Planning',
        approvalDate: `${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} (Projected)`,
        startYear: tempBond.bondStartYear,
        endYear: tempBond.bondStartYear + tempBond.timelineYears,
        projectIds: uniqueProjectIds, // Use unique IDs to prevent duplicates
        projectOrder: uniqueProjectIds.reduce((acc, id, index) => {
          acc[id] = index + 1
          return acc
        }, {} as Record<number, number>)
      }

      // Add bond to context (this will call the API)
      await addBond(newBond)

      // Navigate back to My Bonds view
      setIsSaving(false)
      if (onNavigate) {
        onNavigate('my-bonds')
      }

      alert('Bond package created successfully!')
    } catch (error) {
      setIsSaving(false)
      alert('Failed to save bond package. Please try again.')
    }
  }

  const handleGenerateReport = () => {
    setIsGeneratingReport(true)
    setTimeout(() => {
      setIsGeneratingReport(false)
    }, 2000)
  }

  const getProjectTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'new-construction': 'New Construction',
      'renovation': 'Renovation',
      'addition': 'Addition',
      'equity': 'Equity',
      'specialty': 'Specialty'
    }
    return labels[type] || type
  }

  return (
    <div className="h-full">
      {/* Main Content */}
      <div className="overflow-auto">
        <div className="max-w-5xl mx-auto p-8 space-y-6">

          {/* Header Section */}
          <div className="p-6 rounded-lg border" style={{
            background: `linear-gradient(to right, ${themeColors.mutedBg}, ${themeColors.appBg})`,
            borderColor: themeColors.muted
          }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg shadow-sm" style={{ backgroundColor: themeColors.cardBg }}>
                  <CheckCircle className="h-8 w-8" style={{ color: colors.secondary.oliveGreen }} />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold" style={{ color: themeColors.textPrimary }}>{tempBond.bondName || 'Bond Package Complete'}</h2>
                  <p style={{ color: themeColors.textSecondary }}>
                    {tempBond.timelineYears}-year bond •
                    {(() => {
                      const projectsWithDates = selectedProjects.filter(p => p.startDate && p.endDate)
                      if (projectsWithDates.length > 0) {
                        const startYears = projectsWithDates.map(p => parseInt(p.startDate!.split('-')[0]))
                        const endYears = projectsWithDates.map(p => parseInt(p.endDate!.split('-')[0]))
                        const minYear = Math.min(...startYears)
                        const maxYear = Math.max(...endYears)
                        return ` Construction ${minYear}-${maxYear}`
                      }
                      return ` Starting in ${tempBond.bondStartYear}`
                    })()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleGenerateReport}
                  disabled={isGeneratingReport}
                >
                  {isGeneratingReport ? (
                    <>
                      <Download className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleSaveBond}
                  disabled={isSaving}
                  onMouseEnter={() => setIsButtonHovered(true)}
                  onMouseLeave={() => setIsButtonHovered(false)}
                  style={{
                    backgroundColor: isButtonHovered ? 'rgba(22, 163, 74, 1)' : 'rgba(22, 163, 74, 0.5)',
                    color: isButtonHovered ? 'white' : 'black',
                    transform: isButtonHovered ? 'translateY(-1px)' : 'translateY(0)',
                    boxShadow: isButtonHovered ? '0 4px 12px rgba(22, 163, 74, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.15s ease-out'
                  }}
                >
                  {isSaving ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Bond
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* General Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Bond Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm" style={{ color: themeColors.textSecondary }}>Bond Name</div>
                  <div className="font-medium" style={{ color: themeColors.textPrimary }}>{tempBond.bondName || 'Untitled Bond'}</div>
                </div>
                <div>
                  <div className="text-sm" style={{ color: themeColors.textSecondary }}>Timeline</div>
                  <div className="font-medium" style={{ color: themeColors.textPrimary }}>{tempBond.timelineYears} years</div>
                </div>
                <div>
                  <div className="text-sm" style={{ color: themeColors.textSecondary }}>Start Year</div>
                  <div className="font-medium" style={{ color: themeColors.textPrimary }}>{tempBond.bondStartYear}</div>
                </div>
                <div>
                  <div className="text-sm" style={{ color: themeColors.textSecondary }}>Projects Included</div>
                  <div className="font-medium" style={{ color: themeColors.textPrimary }}>{selectedProjects.length} project{selectedProjects.length !== 1 ? 's' : ''}</div>
                </div>
                <div>
                  <div className="text-sm" style={{ color: themeColors.textSecondary }}>Interest Rate</div>
                  <div className="font-medium" style={{ color: themeColors.textPrimary }}>{tempBond.interestRate}%</div>
                </div>
                <div>
                  <div className="text-sm" style={{ color: themeColors.textSecondary }}>Inflation Rate</div>
                  <div className="font-medium" style={{ color: themeColors.textPrimary }}>{tempBond.annualInflationRate}%</div>
                </div>
              </div>

              {tempBond.generalObligations.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <div className="text-sm mb-2" style={{ color: themeColors.textSecondary }}>General Obligations</div>
                    <div className="flex flex-wrap gap-2">
                      {tempBond.generalObligations.map((obligation, index) => (
                        <Badge key={index} variant="secondary">
                          {obligation}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {tempBond.bondDescription && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <div className="text-sm mb-2" style={{ color: themeColors.textSecondary }}>Description</div>
                    <p className="text-sm" style={{ color: themeColors.textPrimary }}>{tempBond.bondDescription}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Projects in This Bond */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Projects in This Bond
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedProjects.map((project) => {
                  // Format dates for display
                  const formatDate = (dateStr?: string) => {
                    if (!dateStr) return null
                    const [year, month] = dateStr.split('-')
                    const date = new Date(parseInt(year), parseInt(month) - 1)
                    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                  }

                  return (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 rounded-lg border transition-colors"
                      style={{
                        backgroundColor: themeColors.mutedBg,
                        borderColor: themeColors.muted
                      }}
                    >
                      <div className="flex-1">
                        <div className="font-medium mb-1" style={{ color: themeColors.textPrimary }}>{project.name}</div>
                        <div className="flex items-center gap-4 text-sm" style={{ color: themeColors.textSecondary }}>
                          <span>{getProjectTypeLabel(project.type)}</span>
                          {project.squareFootage && (
                            <>
                              <span>•</span>
                              <span>{project.squareFootage.toLocaleString()} SF</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{project.duration} months</span>
                        </div>
                        {(project.startDate || project.endDate) && (
                          <div className="flex items-center gap-2 text-sm mt-1" style={{ color: themeColors.textSecondary }}>
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                              {formatDate(project.startDate) || 'Not scheduled'} - {formatDate(project.endDate) || 'Not scheduled'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold" style={{ color: colors.secondary.skyBlue }}>
                          ${(project.cost / 1000000).toFixed(1)}M
                        </div>
                        {project.squareFootage && (
                          <div className="text-xs" style={{ color: themeColors.textTertiary }}>
                            ${Math.round(project.cost / project.squareFootage)}/SF
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Total */}
              <Separator className="my-4" />
              <div className="flex items-center justify-between px-4">
                <div className="font-medium" style={{ color: themeColors.textPrimary }}>Total Bond Amount ({tempBond.bondStartYear}):</div>
                <div className="text-2xl font-bold" style={{ color: colors.secondary.skyBlue }}>
                  ${(totalCost / 1000000).toFixed(1)}M
                </div>
              </div>
              {yearsUntilStart > 0 && (
                <div className="text-xs text-right px-4 mt-1" style={{ color: themeColors.textTertiary }}>
                  Base cost: ${(totalBaseCost / 1000000).toFixed(1)}M + {tempBond.annualInflationRate}% inflation ({yearsUntilStart} years)
                </div>
              )}
            </CardContent>
          </Card>


          {/* Timeline Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Bond Term:</span>
                  <span className="font-medium">{tempBond.timelineYears} years</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Start Year:</span>
                  <span className="font-medium">{tempBond.bondStartYear}</span>
                </div>
                {(() => {
                  const projectsWithDates = selectedProjects.filter(p => p.startDate && p.endDate)
                  if (projectsWithDates.length > 0) {
                    const startYears = projectsWithDates.map(p => parseInt(p.startDate!.split('-')[0]))
                    const endYears = projectsWithDates.map(p => parseInt(p.endDate!.split('-')[0]))
                    const minYear = Math.min(...startYears)
                    const maxYear = Math.max(...endYears)
                    const constructionYears = maxYear - minYear + 1
                    return (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Construction Period:</span>
                          <span className="font-medium">{minYear}-{maxYear} ({constructionYears} years)</span>
                        </div>
                      </>
                    )
                  }
                  return null
                })()}
                {packages.length > 0 && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Bond Packages:</span>
                      <span className="font-medium">{packages.length} package{packages.length !== 1 ? 's' : ''}</span>
                    </div>
                    <Separator className="my-3" />
                    {packages.map((pkg) => (
                      <div key={pkg.id} className="flex items-center justify-between p-3 bg-purple-50 rounded border border-purple-200">
                        <div>
                          <div className="font-medium">{pkg.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {pkg.projects.length} project{pkg.projects.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-purple-700">
                          ${(pkg.totalCost / 1000000).toFixed(1)}M
                        </div>
                      </div>
                    ))}
                  </>
                )}
                </div>
              </CardContent>
            </Card>

          {/* Cost Summary Card - Highlighted */}
          <Card className="border-2" style={{
            borderColor: colors.secondary.oliveGreen,
            backgroundColor: `${colors.secondary.oliveGreen}15`
          }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2" style={{ color: colors.secondary.oliveGreen }}>
                  <DollarSign className="h-5 w-5" />
                  Final Cost Summary
                </CardTitle>
                <div className="text-lg font-semibold" style={{ color: colors.secondary.oliveGreen }}>
                  ${(totalCostWithInterest / 1000000).toFixed(1)}M
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-3">
                  {/* Base Cost */}
                  <div className="flex justify-between">
                    <span style={{ color: themeColors.textSecondary }}>Base Projects ({currentYear}):</span>
                    <span className="font-semibold" style={{ color: themeColors.textPrimary }}>${(totalBaseCost / 1000000).toFixed(1)}M</span>
                  </div>

                  {/* Inflation Adjustment */}
                  {yearsUntilStart > 0 && (
                    <div className="flex justify-between">
                      <span style={{ color: themeColors.textSecondary }}>+ Inflation ({tempBond.annualInflationRate}%, {yearsUntilStart}yr):</span>
                      <span className="font-semibold" style={{ color: themeColors.textPrimary }}>${((totalCost - totalBaseCost) / 1000000).toFixed(1)}M</span>
                    </div>
                  )}

                  <Separator />

                  {/* Adjusted Bond Amount */}
                  <div className="flex justify-between">
                    <span className="font-medium" style={{ color: themeColors.textPrimary }}>Bond Amount ({tempBond.bondStartYear}):</span>
                    <span className="font-semibold" style={{ color: themeColors.textPrimary }}>${(totalCost / 1000000).toFixed(1)}M</span>
                  </div>

                  {/* Interest */}
                  <div className="flex justify-between">
                    <span style={{ color: themeColors.textSecondary }}>+ Interest ({tempBond.interestRate}%, {tempBond.timelineYears}yr):</span>
                    <span className="font-semibold" style={{ color: themeColors.textPrimary }}>${(totalInterest / 1000000).toFixed(1)}M</span>
                  </div>

                  <Separator />

                  {/* Total Cost */}
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold" style={{ color: colors.secondary.oliveGreen }}>Total Bond Cost:</span>
                    <span className="font-bold" style={{ color: colors.secondary.oliveGreen }}>${(totalCostWithInterest / 1000000).toFixed(1)}M</span>
                  </div>
                </div>

                {/* Target Bond Amount - Rounded to nearest 5M */}
                <div className="p-4 rounded-lg border-2" style={{
                  backgroundColor: isUnderTarget ? `${colors.secondary.oliveGreen}15` : `${colors.secondary.orange}15`,
                  borderColor: isUnderTarget ? colors.secondary.oliveGreen : colors.secondary.orange
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5" style={{
                        color: isUnderTarget ? colors.secondary.oliveGreen : colors.secondary.orange
                      }} />
                      <div className="text-sm font-medium" style={{
                        color: isUnderTarget ? colors.secondary.oliveGreen : colors.secondary.orange
                      }}>
                        Target Bond Amount
                      </div>
                    </div>
                    {!isEditingTarget && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEditTarget}
                        className="h-7 px-2"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <div className="text-center">
                    {isEditingTarget ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-2xl font-bold">$</span>
                          <Input
                            type="number"
                            step="0.1"
                            value={customTargetAmount}
                            onChange={(e) => setCustomTargetAmount(e.target.value)}
                            className="w-32 text-2xl font-bold text-center"
                            autoFocus
                          />
                          <span className="text-2xl font-bold">M</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            onClick={handleSaveTarget}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                          {tempBond.targetBondAmount && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleResetToCalculated}
                              title="Reset to calculated amount"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={`text-4xl font-bold mb-2 ${isUnderTarget ? 'text-green-700' : 'text-orange-700'}`}>
                          ${(targetBondAmount / 1000000).toFixed(1)}M
                        </div>
                        <div className={`text-sm mb-1 ${isUnderTarget ? 'text-green-600' : 'text-orange-600'}`}>
                          {isUnderTarget ? 'Remaining Capacity' : 'At Target'}
                        </div>
                        <div className={`text-xs ${isUnderTarget ? 'text-green-600' : 'text-orange-600'}`}>
                          {isUnderTarget ? `$${(remainingCapacity / 1000000).toFixed(1)}M under target` :
                           tempBond.targetBondAmount ? 'Custom amount' : 'Rounded to nearest $5M'}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
