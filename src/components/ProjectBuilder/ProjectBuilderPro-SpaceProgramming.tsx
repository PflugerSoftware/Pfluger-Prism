import { useState, useEffect } from 'react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { Input } from '../ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import {
  Building2,
  Plus,
  Minus,
  Search,
  X,
  Trash2,
  ChevronDown,
  BookOpen,
  FlaskConical,
  Users,
  Monitor,
  Hammer,
  TreeDeciduous,
  Dumbbell,
  Weight,
  ShowerHead,
  Cross,
  Presentation,
  DoorOpen,
  Printer,
  Library,
  BookMarked,
  UtensilsCrossed,
  ChefHat,
  Package,
  Bath as BathIcon,
  Settings,
  Theater,
  Music,
  Piano,
  Shirt,
  Palette,
  Sparkles,
  Camera,
  Video,
  Clapperboard,
  Wrench,
  ParkingCircle,
  Sprout,
  Zap,
  Droplet,
  Footprints,
  Construction,
  LucideIcon
} from 'lucide-react'
import { useTheme, getSpaceCategoryColor, FINANCIAL_COLORS } from "../System/ThemeManager"
import { ProjectBuilderTempProject } from './ProjectBuilderPro'
import { loadPods, loadAvailableSpaces, type Pod, type AvailableSpace } from '../../data/loadPods'

interface ProjectBuilderProSpaceProgrammingProps {
  tempProject: ProjectBuilderTempProject
  setTempProject: React.Dispatch<React.SetStateAction<ProjectBuilderTempProject>>
}

// Icon mapping for space types
const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  Flask: FlaskConical,
  Users,
  Monitor,
  Hammer,
  TreeDeciduous,
  Dumbbell,
  Weight,
  ShowerHead,
  Cross,
  Building2,
  Presentation,
  DoorOpen,
  Printer,
  Library,
  BookMarked,
  UtensilsCrossed,
  ChefHat,
  Package,
  BathIcon,
  Settings,
  Theater,
  Music,
  Piano,
  Shirt,
  Palette,
  Sparkles,
  Camera,
  Video,
  Clapperboard,
  Wrench,
  ParkingCircle,
  Sprout,
  Zap,
  Droplet,
  Footprints,
  Construction
}

// Helper component to render icon
const SpaceIcon = ({ iconName, className = "w-8 h-8" }: { iconName: string, className?: string }) => {
  const IconComponent = iconMap[iconName] || Building2 // fallback to Building2
  return <IconComponent className={className} />
}

// Space item component - mirrors map location design
const SpaceItem = ({ space, spaceTypes, theme }: { space: any, spaceTypes?: any[], theme?: any }) => {
  const themeContext = useTheme()
  const { colors, currentTheme } = themeContext

  // Use passed theme or generate default
  const themeStyles = theme || {
    text: {
      primary: currentTheme === 'dark' ? colors.primary.white : colors.primary.black,
      secondary: currentTheme === 'dark' ? colors.primary.lightGray : colors.primary.mediumGray,
    }
  }

  // Try to find the icon and category from space types if available
  const spaceType = spaceTypes?.find(st => st.id === space.id || st.name === space.name)
  const iconName = spaceType?.icon || space.icon || 'Building2'
  let category = spaceType?.category || space.category || 'support'

  // Get category color
  const categoryColor = getSpaceCategoryColor(category)

  return (
    <div className="flex items-center gap-3 py-1">
      {/* Circle with icon */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: categoryColor.color }}
      >
        <SpaceIcon iconName={iconName} className="w-5 h-5" style={{ color: colors.primary.white }} />
      </div>

      {/* VStack: name and SF */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate" style={{ color: themeStyles.text.primary }}>
          {space.name} {space.quantity > 1 ? `(${space.quantity})` : ''}
        </div>
        <div className="text-xs" style={{ color: themeStyles.text.secondary }}>
          {(space.sf || 0).toLocaleString()} SF
        </div>
      </div>
    </div>
  )
}

export function ProjectBuilderProSpaceProgramming({ tempProject, setTempProject }: ProjectBuilderProSpaceProgrammingProps) {
  const { colors, currentTheme } = useTheme()
  const financialColors = FINANCIAL_COLORS

  // Helper to get theme-aware styles
  const getThemeStyles = () => {
    const isDark = currentTheme === 'dark'
    return {
      text: {
        primary: isDark ? colors.primary.white : colors.primary.black,
        secondary: isDark ? colors.primary.lightGray : colors.primary.mediumGray,
        tertiary: isDark ? colors.primary.mediumGray : colors.primary.lightGray,
      },
      background: {
        primary: isDark ? '#1f2937' : colors.primary.white,
        secondary: isDark ? '#374151' : `${colors.primary.lightGray}20`,
        card: isDark ? '#374151' : colors.primary.white,
        hover: isDark ? '#4b5563' : '#f9fafb',
      },
      border: {
        primary: isDark ? '#4b5563' : colors.primary.lightGray,
        secondary: isDark ? '#6b7280' : colors.primary.lightGray,
      }
    }
  }

  const theme = getThemeStyles()

  // State for Space Programming - initialize from tempProject
  const [projectPods, setProjectPods] = useState<any[]>(tempProject.projectPods || [])
  const [customPods, setCustomPods] = useState<any[]>(tempProject.customPods || [])
  const [isSpaceDialogOpen, setIsSpaceDialogOpen] = useState(false)
  const [currentPodIndex, setCurrentPodIndex] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Store the initial SF from overview step (only once when component mounts)
  const [baseSF] = useState(tempProject.totalSquareFootage || 0)

  // Load pods and spaces from API
  const [preBuiltPods, setPreBuiltPods] = useState<Pod[]>([])
  const [availableSpaces, setAvailableSpaces] = useState<AvailableSpace[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const [pods, spaces] = await Promise.all([
          loadPods(),
          loadAvailableSpaces()
        ])
        setPreBuiltPods(pods)
        setAvailableSpaces(spaces)
      } catch (error) {
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Pre-built pod configurations and available spaces are now loaded from API via useEffect above

  const spaceCategories = [
    { id: 'all', name: 'All Spaces' },
    { id: 'instructional', name: 'Instructional' },
    { id: 'athletics', name: 'Athletics & Performance' },
    { id: 'support', name: 'Support Services' }
  ]

  // Space Programming handlers
  const addPreBuiltPod = (pod: any) => {
    setProjectPods([...projectPods, { ...pod, id: `${pod.id}-${Date.now()}` }])
  }

  const createNewCustomPod = () => {
    const newPod = {
      id: `custom-${Date.now()}`,
      name: '',
      spaces: [],
      isCustom: true
    }
    setCustomPods([...customPods, newPod])
  }

  const updateCustomPodName = (podIndex: number, name: string) => {
    const updatedPods = [...customPods]
    updatedPods[podIndex].name = name
    setCustomPods(updatedPods)
  }

  const addSpaceToCustomPod = (podIndex: number, space: any) => {
    const updatedPods = [...customPods]
    const existingSpace = updatedPods[podIndex].spaces.find((s: any) => s.id === space.id)
    
    if (existingSpace) {
      existingSpace.quantity = (existingSpace.quantity || 1) + 1
    } else {
      updatedPods[podIndex].spaces.push({ ...space, quantity: 1 })
    }
    
    setCustomPods(updatedPods)
  }

  const updateSpaceQuantity = (podIndex: number, spaceId: string, newQuantity: number) => {
    const updatedPods = [...customPods]
    const space = updatedPods[podIndex].spaces.find((s: any) => s.id === spaceId)
    if (space && newQuantity > 0) {
      space.quantity = newQuantity
    }
    setCustomPods(updatedPods)
  }

  const removeSpaceFromPod = (podIndex: number, spaceId: string) => {
    const updatedPods = [...customPods]
    updatedPods[podIndex].spaces = updatedPods[podIndex].spaces.filter((s: any) => s.id !== spaceId)
    setCustomPods(updatedPods)
  }

  const deleteCustomPod = (podIndex: number) => {
    const updatedPods = customPods.filter((_, index) => index !== podIndex)
    setCustomPods(updatedPods)
  }

  const calculatePodCost = (pod: any) => {
    if (pod.estimatedCost) return pod.estimatedCost
    
    return pod.spaces.reduce((total: number, space: any) => {
      return total + (space.cost * (space.quantity || 1))
    }, 0)
  }

  const calculateTotalCost = () => {
    const preBuiltTotal = projectPods.reduce((total, pod) => total + pod.estimatedCost, 0)
    const customTotal = customPods.reduce((total, pod) => total + calculatePodCost(pod), 0)
    return preBuiltTotal + customTotal
  }

  // Update tempProject when space costs change
  useEffect(() => {
    const totalSpaceCosts = calculateTotalCost()
    const totalPods = projectPods.length + customPods.length

    // Calculate total square footage from all pods
    const preBuiltSF = projectPods.reduce((total, pod) => {
      const podSF = pod.totalSF || 0
      return total + podSF
    }, 0)

    const customSF = customPods.reduce((total, pod) => {
      const podSpacesSF = pod.spaces.reduce((sf: number, space: any) =>
        sf + (space.sf * (space.quantity || 1)), 0)
      return total + podSpacesSF
    }, 0)

    const calculatedSquareFootage = preBuiltSF + customSF

    // Add pod SF to the base SF from overview, instead of replacing it
    const newSquareFootage = baseSF + calculatedSquareFootage

    setTempProject(prev => ({
      ...prev,
      spaceCosts: totalSpaceCosts,
      numberOfPods: totalPods,
      totalSquareFootage: newSquareFootage,
      projectPods: projectPods,
      customPods: customPods
    }))
  }, [projectPods, customPods, setTempProject])

  const getFilteredSpaces = () => {
    let filtered = availableSpaces

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(space => space.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(space =>
        space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        space.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }

  // Group spaces by category
  const getSpacesByCategory = () => {
    const filtered = getFilteredSpaces()
    const grouped: Record<string, AvailableSpace[]> = {}

    filtered.forEach(space => {
      const category = space.category || 'support'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(space)
    })

    return grouped
  }

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 mx-auto mb-4" style={{ borderBottom: `2px solid ${colors.secondary.skyBlue}` }}></div>
          <p style={{ color: theme.text.secondary }}>Loading pod library...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex">
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto pr-6">
        <div className="space-y-8">
          
          {/* Pre-built Pod Cards */}
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2" style={{ color: theme.text.primary }}>Pick Pod</h2>
              <p style={{ color: theme.text.secondary }}>Complete, tested configurations ready to add to your project</p>
            </div>

            <div className="space-y-4">
              {preBuiltPods.map((pod) => (
                <div key={pod.id} className="relative p-6 rounded-lg border"
                     style={{
                       borderColor: theme.border.primary,
                       backgroundColor: theme.background.card,
                       boxShadow: currentTheme === 'dark' ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                     }}>
                  <div className="flex min-h-[260px] gap-6">
                      {/* Left side: VStack(VStack(icon, title, subtitle), VStack(total size, cost, buttons)) */}
                      <div className="flex-1 flex flex-col justify-between">
                        {/* Top VStack: Icon, title, subtitle */}
                        <div className="text-center">
                          <div className="flex justify-center mb-2">
                            <SpaceIcon iconName={pod.icon} className="w-12 h-12" style={{ color: theme.text.secondary }} />
                          </div>
                          <h3 className="text-lg font-semibold mb-1" style={{ color: theme.text.primary }}>{pod.name}</h3>
                          <p className="text-sm" style={{ color: theme.text.secondary }}>{pod.description}</p>
                        </div>

                        {/* Bottom VStack: Total Size, Cost Range, Buttons */}
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center py-1" style={{ borderBottom: `1px solid ${theme.border.primary}` }}>
                              <span className="text-sm" style={{ color: theme.text.secondary }}>Total Size:</span>
                              <span className="font-medium text-sm" style={{ color: theme.text.primary }}>{pod.totalSF.toLocaleString()} SF</span>
                            </div>
                            <div className="flex justify-between items-center py-1" style={{ borderBottom: `1px solid ${theme.border.primary}` }}>
                              <span className="text-sm" style={{ color: theme.text.secondary }}>Cost Range:</span>
                              <span className="font-medium text-sm" style={{ color: financialColors.positive.color }}>
                                ${(pod.costRange.low / 1000000).toFixed(1)}M - ${(pod.costRange.high / 1000000).toFixed(1)}M
                              </span>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="space-y-2">
                            <Button
                              className="w-full h-8"
                              style={{
                                backgroundColor: colors.secondary.skyBlue,
                                color: colors.primary.white,
                                border: 'none'
                              }}
                              onClick={() => addPreBuiltPod(pod)}
                              size="sm"
                            >
                              Add to Project
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Right side: What's Included */}
                      <div className="flex-1 flex flex-col">
                        <div className="text-lg font-medium mb-3" style={{ color: theme.text.primary }}>What's Included:</div>
                        <div className="flex-1 space-y-2 overflow-y-auto pr-2">
                          {pod.spaces.map((space: any, index: number) => (
                            <SpaceItem key={index} space={space} spaceTypes={availableSpaces} theme={theme} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Custom Pod Builder */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-2" style={{ color: theme.text.primary }}>Build Pod</h2>
                <p style={{ color: theme.text.secondary }}>Group related spaces together for better organization and costing</p>
              </div>
              <Button
                onClick={createNewCustomPod}
                style={{ backgroundColor: colors.secondary.skyBlue, color: colors.primary.white, border: 'none' }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Start New Pod
              </Button>
            </div>

            {/* Build Pod Containers */}
            <div className="space-y-6">
              {customPods.map((pod, podIndex) => (
                <Card key={pod.id} className="border-2 border-dashed" style={{
                  borderColor: theme.border.primary,
                  backgroundColor: theme.background.card
                }}>
                  <CardContent className="p-6">
                    {/* Pod Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <Input
                          placeholder="Enter pod name, e.g., 'Innovation Wing'"
                          value={pod.name}
                          onChange={(e) => updateCustomPodName(podIndex, e.target.value)}
                          className="text-lg font-medium"
                          style={{
                            color: theme.text.primary,
                            backgroundColor: theme.background.primary,
                            borderColor: theme.border.primary
                          }}
                        />
                        <div className="text-sm mt-1" style={{ color: theme.text.secondary }}>
                          {pod.spaces.length} spaces | {pod.spaces.reduce((total: number, space: any) => total + (space.sf * (space.quantity || 1)), 0).toLocaleString()} SF | ${calculatePodCost(pod).toLocaleString()}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCustomPod(podIndex)}
                        style={{ color: financialColors.negative.color }}
                        className="hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Pod Contents */}
                    {pod.spaces.length === 0 ? (
                      <div className="border-2 border-dashed rounded-lg p-8 text-center" style={{ borderColor: theme.border.primary }}>
                        <Building2 className="h-12 w-12 mx-auto mb-4" style={{ color: theme.text.secondary }} />
                        <p className="mb-4" style={{ color: theme.text.secondary }}>Add spaces to this pod</p>
                        <Button
                          onClick={() => {
                            setCurrentPodIndex(podIndex)
                            setIsSpaceDialogOpen(true)
                          }}
                          variant="outline"
                          className="flex items-center gap-2"
                          style={{ borderColor: theme.border.primary, color: theme.text.primary }}
                        >
                          <Plus className="h-4 w-4" />
                          Choose Spaces
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pod.spaces.map((space: any, spaceIndex: number) => (
                          <div key={space.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: theme.background.secondary }}>
                            <div className="flex items-center gap-3">
                              <SpaceIcon iconName={space.icon} className="w-6 h-6" style={{ color: theme.text.secondary }} />
                              <div>
                                <div className="font-medium" style={{ color: theme.text.primary }}>{space.name} × {space.quantity || 1}</div>
                                <div className="text-sm" style={{ color: theme.text.secondary }}>
                                  {(space.sf || 0).toLocaleString()} SF each | ${(space.cost || 0).toLocaleString()} each
                                </div>
                                <div className="text-sm font-medium" style={{ color: financialColors.positive.color }}>
                                  Subtotal: ${((space.cost || 0) * (space.quantity || 1)).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center border rounded" style={{ borderColor: theme.border.primary }}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateSpaceQuantity(podIndex, space.id, (space.quantity || 1) - 1)}
                                  disabled={(space.quantity || 1) <= 1}
                                  style={{ color: theme.text.primary }}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center" style={{ color: theme.text.primary }}>
                                  {space.quantity || 1}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateSpaceQuantity(podIndex, space.id, (space.quantity || 1) + 1)}
                                  style={{ color: theme.text.primary }}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSpaceFromPod(podIndex, space.id)}
                                style={{ color: financialColors.negative.color }}
                                className="hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        
                        <div className="flex justify-between items-center pt-3" style={{ borderTop: `1px solid ${theme.border.primary}` }}>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setCurrentPodIndex(podIndex)
                              setIsSpaceDialogOpen(true)
                            }}
                            style={{ color: colors.secondary.skyBlue }}
                            className="hover:bg-blue-50 dark:hover:bg-blue-900"
                          >
                            Add More Spaces
                          </Button>
                          <div className="text-lg font-semibold" style={{ color: theme.text.primary }}>
                            Pod Total: <span style={{ color: financialColors.positive.color }}>${calculatePodCost(pod).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {customPods.length === 0 && projectPods.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 mx-auto mb-4" style={{ color: theme.text.tertiary }} />
                <p style={{ color: theme.text.secondary }}>Start by picking a pod or build your own custom configuration.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar Summary */}
      <div className="w-80 p-6" style={{ backgroundColor: theme.background.primary, borderLeft: `1px solid ${theme.border.primary}` }}>
        <div className="sticky top-0">
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>Project Summary</h3>

          <div className="space-y-4">
            {/* Total Cost */}
            <div className="p-4 rounded-lg border" style={{
              backgroundColor: currentTheme === 'dark' ? `${colors.secondary.skyBlue}20` : `${colors.secondary.skyBlue}10`,
              borderColor: currentTheme === 'dark' ? `${colors.secondary.skyBlue}40` : `${colors.secondary.skyBlue}30`
            }}>
              <div className="text-sm mb-1" style={{ color: currentTheme === 'dark' ? colors.secondary.skyBlue : colors.secondary.darkBlue }}>Total Project Cost</div>
              <div className="text-2xl font-bold" style={{ color: currentTheme === 'dark' ? colors.secondary.skyBlue : colors.secondary.darkBlue }}>
                ${calculateTotalCost().toLocaleString()}
              </div>
            </div>

            {/* Pods Breakdown */}
            <div>
              <h4 className="font-medium mb-3" style={{ color: theme.text.primary }}>Pods & Spaces</h4>
              <div className="space-y-2">
                {projectPods.map((pod, index) => (
                  <div key={`${pod.id}-${index}`} className="p-3 rounded border" style={{
                    backgroundColor: theme.background.secondary,
                    borderColor: theme.border.primary
                  }}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium" style={{ color: theme.text.primary }}>{pod.name}</span>
                      <span className="font-medium" style={{ color: financialColors.positive.color }}>
                        ${pod.estimatedCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}

                {customPods.map((pod, index) => (
                  <div key={pod.id} className="p-3 rounded border" style={{
                    backgroundColor: theme.background.secondary,
                    borderColor: theme.border.primary
                  }}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium" style={{ color: theme.text.primary }}>{pod.name || 'Build Pod'}</span>
                      <span className="font-medium" style={{ color: financialColors.positive.color }}>
                        ${calculatePodCost(pod).toLocaleString()}
                      </span>
                    </div>
                    <div className="ml-2 space-y-1">
                      {pod.spaces.map((space: any) => (
                        <SpaceItem key={space.id} space={space} spaceTypes={availableSpaces} theme={theme} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Totals */}
            <div className="pt-4 space-y-2" style={{ borderTop: `1px solid ${theme.border.primary}` }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: theme.text.secondary }}>Total Spaces:</span>
                <span style={{ color: theme.text.primary }}>{projectPods.reduce((total, pod) => total + pod.spaces.length, 0) + customPods.reduce((total, pod) => total + pod.spaces.length, 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: theme.text.secondary }}>Total Square Footage:</span>
                <span style={{ color: theme.text.primary }}>{(projectPods.reduce((total, pod) => total + pod.totalSF, 0) + customPods.reduce((total, pod) => total + pod.spaces.reduce((sf: number, space: any) => sf + (space.sf * (space.quantity || 1)), 0), 0)).toLocaleString()} SF</span>
              </div>
            </div>

            {/* Save Draft Button */}
            <div className="pt-4">
              <Button
                variant="outline"
                className="w-full"
                style={{
                  borderColor: theme.border.primary,
                  color: theme.text.primary,
                  backgroundColor: 'transparent'
                }}
              >
                Save Draft
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Space Selection Dialog */}
      <Dialog open={isSpaceDialogOpen} onOpenChange={setIsSpaceDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>Choose Spaces</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col flex-1 overflow-hidden px-6">
            {/* Search and Filter */}
            <div className="flex gap-1 mb-4 flex-shrink-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: theme.text.secondary }} />
                <Input
                  placeholder="Search spaces..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  style={{
                    borderColor: theme.border.primary,
                    color: theme.text.primary,
                    backgroundColor: theme.background.primary
                  }}
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-md"
                style={{
                  border: `1px solid ${theme.border.primary}`,
                  color: theme.text.primary,
                  backgroundColor: theme.background.primary
                }}
              >
                {spaceCategories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            {/* Space Cards - Scrollable Area */}
            <div className="flex-1 overflow-y-auto pb-6 -mx-6 px-6">
              {Object.keys(getSpacesByCategory()).length > 0 ? (
                <div className="space-y-1">
                  {Object.entries(getSpacesByCategory()).map(([category, spaces]) => {
                    const categoryInfo = spaceCategories.find(c => c.id === category)
                    return (
                      <div key={category}>
                        {/* Category Header */}
                        <div className="sticky top-0 z-10 pb-2 mb-3" style={{ backgroundColor: theme.background.primary }}>
                          <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: theme.text.secondary }}>
                            {categoryInfo?.name || category}
                          </h3>
                          <div className="h-px mt-2" style={{ backgroundColor: theme.border.primary }}></div>
                        </div>

                        {/* Spaces in Category */}
                        <div className="space-y-1">
                          {spaces.map((space) => (
                            <div key={space.id} className={`flex items-start gap-4 py-3 px-3 -mx-3 rounded ${currentTheme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`} style={{ borderBottom: `1px solid ${theme.border.primary}` }}>
                              {/* Space Item */}
                              <div className="flex-1">
                                <SpaceItem space={space} spaceTypes={availableSpaces} theme={theme} />
                                <p className="text-xs mt-1 ml-[52px]" style={{ color: theme.text.secondary }}>{space.description}</p>
                              </div>

                              {/* Cost and Add Button */}
                              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                <div className="text-right">
                                  <div className="text-xs" style={{ color: theme.text.secondary }}>Cost</div>
                                  <div className="font-medium" style={{ color: financialColors.positive.color }}>~${(space.cost || 0).toLocaleString()}</div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    if (currentPodIndex !== null) {
                                      addSpaceToCustomPod(currentPodIndex, space)
                                    }
                                  }}
                                  style={{
                                    backgroundColor: colors.secondary.skyBlue,
                                    color: colors.primary.white,
                                    border: 'none'
                                  }}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 mx-auto mb-4" style={{ color: theme.text.tertiary }} />
                  <p style={{ color: theme.text.secondary }}>No spaces found. Try different keywords or browse by category.</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}