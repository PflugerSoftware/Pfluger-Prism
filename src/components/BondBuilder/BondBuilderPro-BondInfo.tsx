import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { 
  FileText, 
  Calendar, 
  DollarSign,
  Building2,
  Plus,
  X,
  Info,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useTheme } from "../System/ThemeManager"
import { BondBuilderTempBond } from './BondBuilderPro'

interface BondBuilderProBondInfoProps {
  tempBond: BondBuilderTempBond
  setTempBond: React.Dispatch<React.SetStateAction<BondBuilderTempBond>>
}

export function BondBuilderProBondInfo({ tempBond, setTempBond }: BondBuilderProBondInfoProps) {
  const { colors, themeColors } = useTheme()
  const [newObligation, setNewObligation] = useState('')
  const [isTimelineOpen, setIsTimelineOpen] = useState(false)
  const [isFinancialParamsOpen, setIsFinancialParamsOpen] = useState(false)
  const currentYear = new Date().getFullYear()

  const addObligation = () => {
    if (newObligation.trim()) {
      setTempBond({
        ...tempBond,
        generalObligations: [...tempBond.generalObligations, newObligation.trim()]
      })
      setNewObligation('')
    }
  }

  const removeObligation = (index: number) => {
    setTempBond({
      ...tempBond,
      generalObligations: tempBond.generalObligations.filter((_, i) => i !== index)
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addObligation()
    }
  }

  return (
    <div className="h-full flex">
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto pr-6">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Header Section */}


          {/* Bond Name */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Bond Name
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bondName">Capital Bond Name *</Label>
                <Input
                  id="bondName"
                  placeholder="e.g., Liberty Hill ISD 2025 Bond"
                  value={tempBond.bondName}
                  onChange={(e) => setTempBond({ ...tempBond, bondName: e.target.value })}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-2">This name will appear on all bond documentation and voter materials</p>
              </div>

              <div>
                <Label htmlFor="bondDescription">Bond Description (Optional)</Label>
                <Textarea
                  id="bondDescription"
                  placeholder="Describe the purpose and goals of this bond package..."
                  value={tempBond.bondDescription}
                  onChange={(e) => setTempBond({ ...tempBond, bondDescription: e.target.value })}
                  className="mt-2"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Timeline Length */}
          <Card>
            <Collapsible open={isTimelineOpen} onOpenChange={setIsTimelineOpen}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Bond Timeline & Cost Projections
                  </CardTitle>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      {isTimelineOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Start Date Quick Presets - Always Visible */}
                <div>
                  <Label className="text-xs text-gray-600">Quick Start Year Presets:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTempBond({
                        ...tempBond,
                        bondStartYear: currentYear + 1
                      })}
                      className={tempBond.bondStartYear === currentYear + 1 ? 'bg-[#00A9E0] text-white border-[#00A9E0] hover:bg-[#0090c0]' : ''}
                    >
                      {currentYear + 1} (Next Year)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTempBond({
                        ...tempBond,
                        bondStartYear: currentYear + 2
                      })}
                      className={tempBond.bondStartYear === currentYear + 2 ? 'bg-[#00A9E0] text-white border-[#00A9E0] hover:bg-[#0090c0]' : ''}
                    >
                      {currentYear + 2} (+2 years)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTempBond({
                        ...tempBond,
                        bondStartYear: currentYear + 3
                      })}
                      className={tempBond.bondStartYear === currentYear + 3 ? 'bg-[#00A9E0] text-white border-[#00A9E0] hover:bg-[#0090c0]' : ''}
                    >
                      {currentYear + 3} (+3 years)
                    </Button>
                  </div>
                </div>

                {/* Timeline Length Quick Presets - Always Visible */}
                <div>
                  <Label className="text-xs text-gray-600">Quick Timeline Length Presets:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTempBond({ ...tempBond, timelineYears: 10 })}
                      className={tempBond.timelineYears === 10 ? 'bg-[#00A9E0] text-white border-[#00A9E0] hover:bg-[#0090c0]' : ''}
                    >
                      10 Years
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTempBond({ ...tempBond, timelineYears: 20 })}
                      className={tempBond.timelineYears === 20 ? 'bg-[#00A9E0] text-white border-[#00A9E0] hover:bg-[#0090c0]' : ''}
                    >
                      20 Years
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTempBond({ ...tempBond, timelineYears: 30 })}
                      className={tempBond.timelineYears === 30 ? 'bg-[#00A9E0] text-white border-[#00A9E0] hover:bg-[#0090c0]' : ''}
                    >
                      30 Years
                    </Button>
                  </div>
                </div>

                {/* Collapsible Detailed Fields */}
                <CollapsibleContent>
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Bond Start Year */}
                      <div>
                        <Label htmlFor="bondStartYear">Bond Start Year *</Label>
                        <Input
                          id="bondStartYear"
                          type="number"
                          min={currentYear}
                          max={currentYear + 10}
                          placeholder="e.g., 2026"
                          value={tempBond.bondStartYear || ''}
                          onChange={(e) => setTempBond({ 
                            ...tempBond, 
                            bondStartYear: parseInt(e.target.value) || currentYear 
                          })}
                          className="mt-2"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Year when bond projects will begin. Starting later will increase costs due to inflation.
                        </p>
                      </div>

                      {/* Timeline Length */}
                      <div>
                        <Label htmlFor="timelineLength">Timeline Length (Years) *</Label>
                        
                        {/* Quick Select Buttons */}
                        <div className="flex gap-2 mt-2">
                          <Button
                            type="button"
                            variant={tempBond.timelineYears === 10 ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTempBond({ ...tempBond, timelineYears: 10 })}
                            className="flex-1"
                          >
                            10 Years
                          </Button>
                          <Button
                            type="button"
                            variant={tempBond.timelineYears === 20 ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTempBond({ ...tempBond, timelineYears: 20 })}
                            className="flex-1"
                          >
                            20 Years
                          </Button>
                          <Button
                            type="button"
                            variant={tempBond.timelineYears === 30 ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTempBond({ ...tempBond, timelineYears: 30 })}
                            className="flex-1"
                          >
                            30 Years
                          </Button>
                        </div>

                        {/* Fine Tuning Input */}
                        <div className="mt-3">
                          <Label htmlFor="timelineLength" className="text-xs text-muted-foreground">
                            Or fine-tune:
                          </Label>
                          <Input
                            id="timelineLength"
                            type="number"
                            min="1"
                            max="50"
                            placeholder="Enter custom years"
                            value={tempBond.timelineYears || ''}
                            onChange={(e) => setTempBond({ 
                              ...tempBond, 
                              timelineYears: parseInt(e.target.value) || 0 
                            })}
                            className="mt-1"
                          />
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-2">
                          Typical bond timelines range from 10-30 years for project execution.
                        </p>
                      </div>
                    </div>

                    {/* Annual Inflation Rate */}
                    <div>
                      <Label htmlFor="inflationRate" className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Annual Inflation Rate (%)
                      </Label>
                      <Input
                        id="inflationRate"
                        type="number"
                        step="0.1"
                        min="0"
                        max="15"
                        placeholder="e.g., 3.5"
                        value={tempBond.annualInflationRate || ''}
                        onChange={(e) => setTempBond({ 
                          ...tempBond, 
                          annualInflationRate: parseFloat(e.target.value) || 0 
                        })}
                        className="mt-2"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Expected annual construction cost inflation. Historical averages range from 2.5% to 5%.
                      </p>
                    </div>

                    {/* Inflation Impact Preview */}
                    {tempBond.bondStartYear > currentYear && tempBond.annualInflationRate > 0 && (
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-orange-700">
                            <p className="font-medium mb-2">Inflation Cost Impact</p>
                            <div className="space-y-1">
                              <p>• Years until bond start: <span className="font-semibold">{tempBond.bondStartYear - currentYear} years</span></p>
                              <p>• Annual inflation rate: <span className="font-semibold">{tempBond.annualInflationRate}%</span></p>
                              <p>• Projected cost increase: <span className="font-semibold text-orange-900">
                                {(((Math.pow(1 + tempBond.annualInflationRate / 100, tempBond.bondStartYear - currentYear) - 1) * 100).toFixed(1))}%
                              </span></p>
                            </div>
                            <p className="mt-3 text-xs">
                              💡 Starting the bond in {tempBond.bondStartYear} instead of {currentYear} means project costs will be approximately {(((Math.pow(1 + tempBond.annualInflationRate / 100, tempBond.bondStartYear - currentYear) - 1) * 100).toFixed(1))}% higher.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Cost Comparison Table */}
                    {tempBond.annualInflationRate > 0 && (
                      <div className="mt-4">
                        <Label className="text-sm font-medium mb-2 block">Cost Impact Comparison (Example: $100M Project)</Label>
                        <div className="border rounded-lg overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="text-left py-2 px-3 font-medium text-gray-700">Start Year</th>
                                <th className="text-left py-2 px-3 font-medium text-gray-700">Years Delay</th>
                                <th className="text-right py-2 px-3 font-medium text-gray-700">Projected Cost</th>
                                <th className="text-right py-2 px-3 font-medium text-gray-700">Increase</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[0, 1, 2, 3].map((delay) => {
                                const year = currentYear + delay
                                const multiplier = Math.pow(1 + tempBond.annualInflationRate / 100, delay)
                                const cost = 100000000 * multiplier
                                const increase = ((multiplier - 1) * 100)
                                const isSelected = year === tempBond.bondStartYear
                                
                                return (
                                  <tr 
                                    key={delay} 
                                    className={`border-t ${isSelected ? 'bg-blue-50 font-medium' : 'hover:bg-gray-50'}`}
                                  >
                                    <td className="py-2 px-3">
                                      {year}
                                      {isSelected && <span className="ml-2 text-xs text-blue-600">← Selected</span>}
                                    </td>
                                    <td className="py-2 px-3 text-gray-600">
                                      {delay === 0 ? 'Immediate' : `+${delay} year${delay > 1 ? 's' : ''}`}
                                    </td>
                                    <td className="text-right py-2 px-3 font-medium">
                                      ${(cost / 1000000).toFixed(2)}M
                                    </td>
                                    <td className={`text-right py-2 px-3 ${increase > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                                      {delay === 0 ? '-' : `+${increase.toFixed(1)}%`}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          💡 This table shows how a $100M project cost would increase based on the {tempBond.annualInflationRate}% annual inflation rate.
                        </p>
                      </div>
                    )}


                  </div>
                </CollapsibleContent>
              </CardContent>
            </Collapsible>
          </Card>

          {/* Financial Parameters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Calculation Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Interest Rate Quick Presets - Always Visible */}
              <div>
                <Label className="text-xs text-gray-600">Quick Interest Rate Presets:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTempBond({
                      ...tempBond,
                      interestRate: 3.5
                    })}
                    className={tempBond.interestRate === 3.5 ? 'bg-[#00A9E0] text-white border-[#00A9E0] hover:bg-[#0090c0]' : ''}
                  >
                    3.5% (Low)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTempBond({
                      ...tempBond,
                      interestRate: 4.5
                    })}
                    className={tempBond.interestRate === 4.5 ? 'bg-[#00A9E0] text-white border-[#00A9E0] hover:bg-[#0090c0]' : ''}
                  >
                    4.5% (Average)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTempBond({
                      ...tempBond,
                      interestRate: 5.5
                    })}
                    className={tempBond.interestRate === 5.5 ? 'bg-[#00A9E0] text-white border-[#00A9E0] hover:bg-[#0090c0]' : ''}
                  >
                    5.5% (High)
                  </Button>
                </div>
              </div>

              {/* Collapsible Advanced Options */}
              <Collapsible open={isFinancialParamsOpen} onOpenChange={setIsFinancialParamsOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full flex items-center justify-between p-2">
                    <span className="text-xs text-gray-600">Advanced Options</span>
                    {isFinancialParamsOpen ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4">
                  <p className="text-sm text-gray-600">
                    Configure the expected interest rate used to calculate total bond costs including financing expenses.
                  </p>

                  {/* Interest Rate */}
                  <div>
                    <Label htmlFor="interestRate">Expected Interest Rate (%) *</Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.1"
                      min="0"
                      max="15"
                      placeholder="e.g., 4.5"
                      value={tempBond.interestRate || ''}
                      onChange={(e) => setTempBond({ 
                        ...tempBond, 
                        interestRate: parseFloat(e.target.value) || 0 
                      })}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Annual interest rate for bond financing. Current market rates typically range from 3.5% to 6%.
                    </p>
                  </div>

                  {/* Interest Cost Impact */}
                  {tempBond.interestRate > 0 && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-green-800 mb-2">Interest Cost Impact</p>
                          <div className="space-y-2 text-green-700">
                            <p>• Interest Rate: <span className="font-semibold">{tempBond.interestRate}%</span></p>
                            <p>• Bond Term: <span className="font-semibold">{tempBond.timelineYears} years</span></p>
                            <p className="text-xs mt-2 pt-2 border-t border-green-200">
                              💡 Interest costs are calculated over the {tempBond.timelineYears}-year bond term and added to the base project costs to determine total bond cost.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>

          {/* General Obligations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                General Obligations & Improvement Types
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Specify the types of facility improvements and obligations this bond will address. These will help categorize and communicate bond priorities.
                </p>
                
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="e.g., Facility Upgrades, Technology Infrastructure, Safety Improvements"
                    value={newObligation}
                    onChange={(e) => setNewObligation(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <Button 
                    onClick={addObligation}
                    style={{ backgroundColor: colors.secondary.skyBlue, color: colors.primary.white }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                {/* Obligations List */}
                {tempBond.generalObligations.length > 0 && (
                  <div className="space-y-2">
                    <Label>Current Obligations:</Label>
                    <div className="space-y-2">
                      {tempBond.generalObligations.map((obligation, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                        >
                          <span className="text-sm">{obligation}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeObligation(index)}
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tempBond.generalObligations.length === 0 && (
                  <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
                    <Building2 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No obligations added yet</p>
                    <p className="text-xs">Add improvement types to define bond priorities</p>
                  </div>
                )}
              </div>

              {/* Common Suggestions */}
              <div>
                <Label className="text-xs text-gray-600">Common Examples:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    'Facility Upgrades',
                    'Technology Infrastructure', 
                    'Safety & Security',
                    'HVAC Systems',
                    'Roof Replacements',
                    'Athletic Facilities',
                    'Classroom Additions'
                  ].map((suggestion) => (
                    <Badge 
                      key={suggestion}
                      variant="secondary" 
                      className="cursor-pointer hover:bg-gray-300"
                      onClick={() => {
                        if (!tempBond.generalObligations.includes(suggestion)) {
                          setTempBond({
                            ...tempBond,
                            generalObligations: [...tempBond.generalObligations, suggestion]
                          })
                        }
                      }}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Sidebar Summary */}

    </div>
  )
}
