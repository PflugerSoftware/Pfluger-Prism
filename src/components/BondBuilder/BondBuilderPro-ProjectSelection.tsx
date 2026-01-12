import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Checkbox } from '../ui/checkbox'
import { 
  Search,
  Building2,
  CheckCircle,
  Circle,
  DollarSign,
  Calendar,
  Maximize2
} from 'lucide-react'
import { useTheme } from "../System/ThemeManager"
import { BondBuilderTempBond, Project } from './BondBuilderPro'

interface BondBuilderProProjectSelectionProps {
  tempBond: BondBuilderTempBond
  setTempBond: React.Dispatch<React.SetStateAction<BondBuilderTempBond>>
  availableProjects: Project[]
}

export function BondBuilderProProjectSelection({ 
  tempBond, 
  setTempBond,
  availableProjects 
}: BondBuilderProProjectSelectionProps) {
  const { colors, themeColors } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  const toggleProjectSelection = (projectId: string) => {
    const isSelected = tempBond.selectedProjectIds.includes(projectId)
    
    if (isSelected) {
      setTempBond({
        ...tempBond,
        selectedProjectIds: tempBond.selectedProjectIds.filter(id => id !== projectId)
      })
    } else {
      setTempBond({
        ...tempBond,
        selectedProjectIds: [...tempBond.selectedProjectIds, projectId]
      })
    }
  }

  const selectAll = () => {
    const filteredIds = getFilteredProjects().map(p => p.id)
    setTempBond({
      ...tempBond,
      selectedProjectIds: [...new Set([...tempBond.selectedProjectIds, ...filteredIds])]
    })
  }

  const deselectAll = () => {
    setTempBond({
      ...tempBond,
      selectedProjectIds: []
    })
  }

  const getFilteredProjects = () => {
    return availableProjects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === 'all' || project.type === filterType
      return matchesSearch && matchesType
    })
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

  const getProjectTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'new-construction': 'bg-blue-100 text-blue-700 border-blue-200',
      'renovation': 'bg-green-100 text-green-700 border-green-200',
      'addition': 'bg-purple-100 text-purple-700 border-purple-200',
      'equity': 'bg-orange-100 text-orange-700 border-orange-200',
      'specialty': 'bg-pink-100 text-pink-700 border-pink-200'
    }
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const selectedProjects = availableProjects.filter(p => 
    tempBond.selectedProjectIds.includes(p.id)
  )
  
  const totalSelectedCost = selectedProjects.reduce((sum, p) => sum + p.cost, 0)

  return (
    <div className="h-full flex">
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto pr-6">
        <div className="space-y-6">

          {/* Search and Filter Controls */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: themeColors.textTertiary }} />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border rounded-md"
              style={{
                borderColor: themeColors.muted,
                backgroundColor: themeColors.cardBg,
                color: themeColors.textPrimary
              }}
            >
              <option value="all">All Types</option>
              <option value="new-construction">New Construction</option>
              <option value="renovation">Renovation</option>
              <option value="addition">Addition</option>
              <option value="equity">Equity</option>
              <option value="specialty">Specialty</option>
            </select>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Deselect All
              </Button>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getFilteredProjects().map((project) => {
              const isSelected = tempBond.selectedProjectIds.includes(project.id)
              
              return (
                <Card 
                  key={project.id}
                  className={`cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-2 shadow-md' 
                      : 'border hover:shadow-md'
                  }`}
                  style={{
                    borderColor: isSelected ? colors.secondary.skyBlue : undefined
                  }}
                  onClick={() => toggleProjectSelection(project.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {isSelected ? (
                          <CheckCircle 
                            className="h-5 w-5" 
                            style={{ color: colors.secondary.skyBlue }}
                          />
                        ) : (
                          <Circle className="h-5 w-5" style={{ color: themeColors.textTertiary }} />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-sm leading-tight" style={{ color: themeColors.textPrimary }}>{project.name}</h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs flex-shrink-0 ${getProjectTypeColor(project.type)}`}
                          >
                            {getProjectTypeLabel(project.type)}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-4 text-xs" style={{ color: themeColors.textSecondary }}>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              <span className="font-medium">${(project.cost / 1000000).toFixed(1)}M</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{project.duration} months</span>
                            </div>
                            {project.squareFootage && (
                              <div className="flex items-center gap-1">
                                <Maximize2 className="h-3 w-3" />
                                <span>{(project.squareFootage / 1000).toFixed(0)}K SF</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color: themeColors.textTertiary }}>Status:</span>
                            <Badge 
                              variant={project.status === 'ready' ? 'default' : 'secondary'}
                              className="text-xs h-5"
                            >
                              {project.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {getFilteredProjects().length === 0 && (
            <div className="text-center py-12" style={{ color: themeColors.textSecondary }}>
              <Building2 className="h-16 w-16 mx-auto mb-4" style={{ color: themeColors.textTertiary }} />
              <p>No projects found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar Summary */}
      <div className="w-64 border-l p-6" style={{
        backgroundColor: themeColors.cardBg,
        borderColor: themeColors.muted
      }}>
        <div className="sticky top-0 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: themeColors.textPrimary }}>Selection Summary</h3>
            
            <div className="space-y-4">
              {/* Total Projects */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-700 mb-1">Projects Selected</div>
                <div className="text-2xl font-bold text-blue-900">
                  {tempBond.selectedProjectIds.length}
                </div>
              </div>

              {/* Total Cost */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm text-green-700 mb-1">Total Cost</div>
                <div className="text-2xl font-bold text-green-900">
                  ${(totalSelectedCost / 1000000).toFixed(1)}M
                </div>
              </div>

              {/* Breakdown by Type */}
              {tempBond.selectedProjectIds.length > 0 && (
                <div className="p-4 rounded-lg border" style={{
                  backgroundColor: themeColors.mutedBg,
                  borderColor: themeColors.muted
                }}>
                  <div className="text-sm font-medium mb-3" style={{ color: themeColors.textPrimary }}>Projects by Type</div>
                  <div className="space-y-2">
                    {['new-construction', 'renovation', 'addition', 'equity', 'specialty'].map(type => {
                      const count = selectedProjects.filter(p => p.type === type).length
                      if (count === 0) return null
                      
                      return (
                        <div key={type} className="flex justify-between text-xs">
                          <span style={{ color: themeColors.textSecondary }}>{getProjectTypeLabel(type)}:</span>
                          <span className="font-medium" style={{ color: themeColors.textPrimary }}>{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {tempBond.selectedProjectIds.length === 0 && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-700">
                Select at least one project to continue to the timeline step.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
