import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { Progress } from '../ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  Calculator,
  Building2,
  Calendar,
  MapPin,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  FileText,
  PieChart,
  BarChart3,
  Settings
} from 'lucide-react'
import { useTheme } from "../System/ThemeManager"
import { ProjectBuilderTempProject } from './ProjectBuilderPro'

interface ProjectBuilderProCostEstimationProps {
  tempProject: ProjectBuilderTempProject
  setTempProject: React.Dispatch<React.SetStateAction<ProjectBuilderTempProject>>
}

export function ProjectBuilderProCostEstimation({ tempProject, setTempProject }: ProjectBuilderProCostEstimationProps) {
  const { colors } = useTheme()
  
  // Mock data from previous steps - in real app this would come from state/context
  const projectData = {
    // Step 1: Project Overview
    overview: {
      projectName: "Liberty Hill Elementary Expansion",
      projectType: "New Construction",
      buildingType: "Elementary School",
      targetCapacity: 850,
      projectPriority: "High",
      estimatedDuration: "24 months"
    },
    
    // Step 2: Location & Site
    location: {
      siteName: "Liberty Hill Elementary School",
      address: "16500 W State Hwy 29, Liberty Hill, TX 78642",
      siteArea: "15.2 acres",
      soilConditions: "Clay/Rock",
      utilities: ["Water", "Sewer", "Electric", "Gas", "Fiber"],
      siteChallenges: ["Slope variations", "Existing tree preservation"]
    },
    
    // Step 3: Space Programming
    spaceProgramming: {
      totalSquareFootage: 26500,
      pods: [
        {
          name: "Academic Wing Pod",
          spaces: [
            { name: "Standard Classroom", quantity: 12, sf: 900, cost: 48250 },
            { name: "Wet Science Lab", quantity: 2, sf: 1200, cost: 125000 }, 
            { name: "Library Media Center", quantity: 1, sf: 2400, cost: 320000 }
          ],
          totalCost: 1129000
        },
        {
          name: "Athletics Pod", 
          spaces: [
            { name: "Competition Gym", quantity: 1, sf: 6000, cost: 875000 },
            { name: "Auxiliary Gym", quantity: 1, sf: 3000, cost: 425000 }
          ],
          totalCost: 1300000
        },
        {
          name: "Dining Pod",
          spaces: [
            { name: "Cafeteria", quantity: 1, sf: 4500, cost: 675000 },
            { name: "Kitchen", quantity: 1, sf: 2000, cost: 400000 }
          ],
          totalCost: 1075000
        }
      ],
      totalSpaceCost: 3504000
    },
    
    // Step 4: Schedule & Phases
    schedule: {
      phases: [
        { name: "Design Phase", duration: "6 months", cost: 580000 },
        { name: "Site Preparation", duration: "3 months", cost: 450000 },
        { name: "Foundation & Structure", duration: "8 months", cost: 2850000 },
        { name: "MEP & Interior", duration: "6 months", cost: 1950000 },
        { name: "Final Finishes", duration: "3 months", cost: 720000 }
      ],
      totalScheduleCost: 6550000
    }
  }

  // Cost calculations
  const baseCost = projectData.spaceProgramming.totalSpaceCost
  const siteCosts = 680000 // Site preparation, utilities, etc.
  const designCosts = 580000 // Professional services
  const contingency = Math.round(baseCost * 0.15) // 15% contingency
  const escalation = Math.round(baseCost * 0.08) // 8% escalation
  const totalProjectCost = baseCost + siteCosts + designCosts + contingency + escalation

  const costBreakdown = [
    { category: "Space Programming", amount: baseCost, percentage: Math.round((baseCost / totalProjectCost) * 100) },
    { category: "Site Development", amount: siteCosts, percentage: Math.round((siteCosts / totalProjectCost) * 100) },
    { category: "Design Services", amount: designCosts, percentage: Math.round((designCosts / totalProjectCost) * 100) },
    { category: "Contingency (15%)", amount: contingency, percentage: Math.round((contingency / totalProjectCost) * 100) },
    { category: "Escalation (8%)", amount: escalation, percentage: Math.round((escalation / totalProjectCost) * 100) }
  ]

  const costPerSquareFoot = Math.round(totalProjectCost / projectData.spaceProgramming.totalSquareFootage)

  return (
    <div className="h-full flex">
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto pr-6">
        <div className="space-y-6">
          
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <Calculator className="h-8 w-8" style={{ color: colors.secondary.skyBlue }} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Cost Estimation Summary</h2>
                <p className="text-gray-600">Complete cost analysis based on your project specifications</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Total Project Cost</div>
                <div className="text-3xl font-bold text-green-700">${totalProjectCost.toLocaleString()}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Cost per Square Foot</div>
                <div className="text-3xl font-bold text-blue-700">${costPerSquareFoot}/sf</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Total Square Footage</div>
                <div className="text-3xl font-bold text-gray-700">{projectData.spaceProgramming.totalSquareFootage.toLocaleString()} SF</div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="summary" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary">Cost Summary</TabsTrigger>
              <TabsTrigger value="breakdown">Detailed Breakdown</TabsTrigger>
              <TabsTrigger value="comparison">Market Comparison</TabsTrigger>
              <TabsTrigger value="review">Project Review</TabsTrigger>
            </TabsList>

            {/* Cost Summary Tab */}
            <TabsContent value="summary" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cost Breakdown Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Cost Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {costBreakdown.map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{item.category}</span>
                            <span className="text-sm font-bold">${item.amount.toLocaleString()}</span>
                          </div>
                          <Progress 
                            value={item.percentage} 
                            className="h-2"
                          />
                          <div className="text-xs text-gray-600 text-right">{item.percentage}%</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Assessment */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Cost Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium text-yellow-800">Medium Risk Factors</span>
                        </div>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>• Site soil conditions may require additional foundation work</li>
                          <li>• Material escalation in current market conditions</li>
                        </ul>
                      </div>
                      
                      <div className="p-3 bg-green-50 border border-green-200 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-800">Risk Mitigation</span>
                        </div>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• 15% contingency included for unforeseen costs</li>
                          <li>• Well-defined scope and space programming</li>
                          <li>• Established relationships with local contractors</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Detailed Breakdown Tab */}
            <TabsContent value="breakdown" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Space Programming Costs */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Space Programming Costs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {projectData.spaceProgramming.pods.map((pod, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-medium">{pod.name}</h4>
                            <span className="font-bold text-green-700">${pod.totalCost.toLocaleString()}</span>
                          </div>
                          <div className="space-y-2">
                            {pod.spaces.map((space, spaceIndex) => (
                              <div key={spaceIndex} className="flex justify-between text-sm text-gray-600">
                                <span>{space.name} ({space.quantity}x)</span>
                                <span>${(space.cost * space.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Schedule & Phase Costs */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Phase Cost Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {projectData.schedule.phases.map((phase, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium">{phase.name}</div>
                            <div className="text-sm text-gray-600">{phase.duration}</div>
                          </div>
                          <div className="font-bold">${phase.cost.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Market Comparison Tab */}
            <TabsContent value="comparison" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Market Cost Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-sm text-gray-600 mb-2">Regional Average</div>
                        <div className="text-2xl font-bold text-gray-700">$285/sf</div>
                        <div className="text-xs text-red-600 mt-1">+12% above</div>
                      </div>
                      <div className="text-center p-4 border-2 border-blue-200 bg-blue-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-2">Your Project</div>
                        <div className="text-2xl font-bold text-blue-700">${costPerSquareFoot}/sf</div>
                        <div className="text-xs text-blue-600 mt-1">Target Range</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-sm text-gray-600 mb-2">State Average</div>
                        <div className="text-2xl font-bold text-gray-700">$295/sf</div>
                        <div className="text-xs text-red-600 mt-1">+16% above</div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Cost Analysis</h4>
                      <p className="text-sm text-gray-700">
                        Your project cost of ${costPerSquareFoot}/sf is competitive within the current market range for 
                        elementary school construction in Central Texas. The inclusion of specialized spaces like 
                        competition gym and full commercial kitchen contributes to the higher-than-average cost per 
                        square foot, but provides significant long-term value for the district.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Project Review Tab */}
            <TabsContent value="review" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Project Overview Review */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Project Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Project Name:</span>
                        <span className="font-medium">{projectData.overview.projectName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Project Type:</span>
                        <span className="font-medium">{projectData.overview.projectType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Building Type:</span>
                        <span className="font-medium">{projectData.overview.buildingType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Target Capacity:</span>
                        <span className="font-medium">{projectData.overview.targetCapacity} students</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Priority Level:</span>
                        <Badge variant="outline" className="text-red-600 border-red-200">
                          {projectData.overview.projectPriority}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Location Review */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Location & Site
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-600 text-sm">Site Location:</span>
                        <div className="font-medium">{projectData.location.siteName}</div>
                        <div className="text-sm text-gray-600">{projectData.location.address}</div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Site Area:</span>
                        <span className="font-medium">{projectData.location.siteArea}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Soil Conditions:</span>
                        <span className="font-medium">{projectData.location.soilConditions}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Available Utilities:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {projectData.location.utilities.map((utility, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {utility}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Sidebar - Actions & Next Steps */}
      <div className="w-80 bg-white border-l border-gray-200 p-6">
        <div className="sticky top-0 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Cost Summary</h3>
            <div className="space-y-3">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm text-green-700 mb-1">Total Project Cost</div>
                <div className="text-2xl font-bold text-green-800">
                  ${totalProjectCost.toLocaleString()}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Construction Cost:</span>
                  <span className="font-medium">${baseCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Site Development:</span>
                  <span className="font-medium">${siteCosts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Design Services:</span>
                  <span className="font-medium">${designCosts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Contingency:</span>
                  <span className="font-medium">${contingency.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Escalation:</span>
                  <span className="font-medium">${escalation.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">Next Steps</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Cost estimation complete</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                <span>Final project review</span>
              </div>
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-400" />
                <span>Generate project documentation</span>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  )
}