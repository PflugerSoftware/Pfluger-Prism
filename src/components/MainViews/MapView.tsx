import { useEffect, useRef, useState } from 'react'
import { Card, CardContent } from "../ui/card"
import { Users, MapPin, DollarSign, TreePine, Share, Search, Layers, House, ChevronLeft, ChevronRight, Building2, Hammer, Lightbulb } from "lucide-react"
import type { Project } from '../../data/loadProjects'
import { loadLibertyHillDistrict } from '../../data/loadDistricts'
import { MapSearchPanel } from '../SideBars/MapSearchPanel'
import { FacilityDetailedContent } from '../SideBars/FacilityDetailedContent'
import { ProjectDetailContent } from '../SideBars/ProjectDetailContent'
import { useFacilities, type Facility } from '../System/FacilitiesContext'
import { useProjects } from '../System/ProjectsContext'
import { getProjectTypeColor, getProjectTypeIcon, getFacilityStatusColor, useTheme, PROJECT_TYPE_COLORS } from '../System/ThemeManager'
import mapboxgl from 'mapbox-gl'
import { MAPBOX_TOKEN, MAPBOX_STYLES, MAP_CONFIG } from '../../config/mapbox'
import { motion, AnimatePresence } from 'framer-motion'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = MAPBOX_TOKEN

// SVG path for Building2 icon
function getBuildingIconSVG(): string {
  return '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path><path d="M10 6h4"></path><path d="M10 10h4"></path><path d="M10 14h4"></path><path d="M10 18h4"></path>'
}

interface MapViewProps {
  isSidebarExpanded?: boolean
  onOpenProjectSidebar?: (project: Project) => void
  onSearchPanelCollapsedChange?: (isCollapsed: boolean) => void
  isProjectDetailOpen?: boolean
}

export function MapView({ isSidebarExpanded = false, onOpenProjectSidebar, onSearchPanelCollapsedChange, isProjectDetailOpen = false }: MapViewProps = {}) {
  const { componentThemes, currentTheme, facilityStatusColors } = useTheme()
  const sidebarTheme = componentThemes.sidebar[currentTheme === 'dark' ? 'dark' : 'light']
  const { facilities } = useFacilities()
  const { projects } = useProjects() // Use projects from context instead of local state

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [districtData, setDistrictData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSearchPanelCollapsed, setIsSearchPanelCollapsed] = useState(false)
  // Sidebar state now managed at App level
  const initialized = useRef(false)

  // Project bubble state
  const [expandedFacilityId, setExpandedFacilityId] = useState<number | null>(null)
  const [hoveredFacilityId, setHoveredFacilityId] = useState<number | null>(null)
  const [projectBubbles, setProjectBubbles] = useState<Array<{ project: Project, x: number, y: number }>>([])
  const [hoverCircleCenter, setHoverCircleCenter] = useState<{ x: number, y: number } | null>(null)

  // Panel management for multiple detail views
  interface DetailPanel {
    id: string
    type: 'facility' | 'project'
    data: Facility | Project
    position: number
  }

  const [openPanels, setOpenPanels] = useState<DetailPanel[]>([])

  // Notify parent when search panel collapse state changes
  useEffect(() => {
    if (onSearchPanelCollapsedChange) {
      onSearchPanelCollapsedChange(isSearchPanelCollapsed)
    }
  }, [isSearchPanelCollapsed, onSearchPanelCollapsedChange])

  // Expand search panel when project detail closes (but not on initial mount)
  const prevDetailOpenRef = useRef(isProjectDetailOpen)
  useEffect(() => {
    // Only expand if the detail panel was open and is now closed
    if (prevDetailOpenRef.current === true && isProjectDetailOpen === false) {
      setIsSearchPanelCollapsed(false)
    }
    prevDetailOpenRef.current = isProjectDetailOpen
  }, [isProjectDetailOpen])

  // Update map style when theme changes
  useEffect(() => {
    if (!mapInstanceRef.current) return

    const map = mapInstanceRef.current

    // Update the light preset based on theme
    try {
      map.setConfigProperty('basemap', 'lightPreset', currentTheme === 'dark' ? 'dusk' : 'day')
    } catch (e) {
      // Config might not be available yet
      console.log('Could not update map theme:', e)
    }
  }, [currentTheme])

  // Frame All - zoom to district overview
  const handleFrameAll = () => {
    if (mapInstanceRef.current && projects.length > 0) {
      const map = mapInstanceRef.current

      // Calculate center point from all projects with coordinates
      const projectsWithCoords = projects.filter(p => p.latitude && p.longitude)
      const centerLat = projectsWithCoords.length > 0
        ? projectsWithCoords.reduce((sum, p) => sum + (p.latitude || 0), 0) / projectsWithCoords.length
        : MAP_CONFIG.center[1]
      const centerLng = projectsWithCoords.length > 0
        ? projectsWithCoords.reduce((sum, p) => sum + (p.longitude || 0), 0) / projectsWithCoords.length
        : MAP_CONFIG.center[0]

      // Fly to district overview at zoom level 11
      map.flyTo({
        center: [centerLng, centerLat],
        zoom: 11,
        pitch: MAP_CONFIG.pitch,
        duration: 2000
      })
    }
  }

  const handleProjectSelect = (project: Project) => {
    // Collapse search panel when opening project details
    setIsSearchPanelCollapsed(true)

    // Check if project has coordinates and map is initialized
    if (project.latitude && project.longitude && mapInstanceRef.current) {
      const map = mapInstanceRef.current

      // Fly to project location with smooth animation - zoom in closer
      // Apply left padding to shift the visual center right, accounting for left sidebars
      map.flyTo({
        center: [project.longitude, project.latitude],
        zoom: 14,
        pitch: 45,
        duration: 2000,
        padding: { left: 300, top: 0, right: 0, bottom: 0 }
      })
    }

    // Add project panel to the stack (max 3 panels)
    const existingPanel = openPanels.find(p => p.type === 'project' && p.data.id === project.id)
    if (!existingPanel) {
      setOpenPanels(prev => {
        let newPanels = [...prev]

        // Remove project if we're at limit (keep facilities on left)
        if (newPanels.length >= 3) {
          // Find the rightmost project panel to remove
          const projectPanels = newPanels.filter(p => p.type === 'project')
          if (projectPanels.length > 0) {
            // Remove the oldest project panel
            const oldestProject = projectPanels[0]
            newPanels = newPanels.filter(p => p.id !== oldestProject.id)
          } else {
            // If all panels are facilities, remove the oldest one
            newPanels.shift()
          }
        }

        // Add new project panel (projects always go after facilities)
        const newPanel = {
          id: `project-${project.id}`,
          type: 'project' as const,
          data: project,
          position: newPanels.length
        }

        // Sort panels: facilities first, then projects
        return [...newPanels, newPanel].sort((a, b) => {
          if (a.type === 'facility' && b.type === 'project') return -1
          if (a.type === 'project' && b.type === 'facility') return 1
          return 0
        }).map((panel, index) => ({ ...panel, position: index }))
      })
    }

    // Don't notify parent - we're handling panels internally now
  }

  const handleFacilityHover = (facilityId: number | null, isEntering: boolean) => {
    if (!mapInstanceRef.current || facilityId === null) return

    if (!isEntering) {
      // Mouse left the marker - but don't clear immediately
      // The invisible hover circle will handle clearing when mouse fully leaves
      return
    }

    // Mouse entered - show bubbles
    setHoveredFacilityId(facilityId)

    // Find all projects at this facility
    const facilityProjects = projects.filter(p => p.facility_id === facilityId && p.latitude && p.longitude)
    if (facilityProjects.length === 0) return

    const map = mapInstanceRef.current

    // Calculate center point from all projects at this facility
    const centerLat = facilityProjects.reduce((sum, p) => sum + (p.latitude || 0), 0) / facilityProjects.length
    const centerLng = facilityProjects.reduce((sum, p) => sum + (p.longitude || 0), 0) / facilityProjects.length

    // Convert facility center to screen coordinates
    const screenPos = map.project([centerLng, centerLat])

    // Get the bubbles overlay container position (viewport-relative)
    const bubblesOverlay = mapRef.current?.parentElement?.querySelector('[style*="z-index: 999"]')
    const overlayRect = bubblesOverlay?.getBoundingClientRect() || { left: 0, top: 0 }

    // Get the actual marker DOM element position to use as reference
    const markers = Array.from(document.querySelectorAll('.custom-mapbox-marker'))
    const markerElements = markers.map(m => m.getBoundingClientRect())

    // Find the marker closest to our calculated screen position
    let markerCenterX = screenPos.x
    let markerCenterY = screenPos.y + 16 // Default: use screenPos with marker offset

    if (markerElements.length > 0) {
      // Use the actual marker position from the DOM (viewport-relative)
      const closestMarker = markerElements.reduce((closest, current) => {
        const currentCenterX = current.left + current.width / 2
        const currentCenterY = current.top + current.height / 2
        const currentDist = Math.sqrt(
          Math.pow(currentCenterX - screenPos.x, 2) +
          Math.pow(currentCenterY - screenPos.y, 2)
        )
        const closestDist = Math.sqrt(
          Math.pow(closest.left + closest.width / 2 - screenPos.x, 2) +
          Math.pow(closest.top + closest.height / 2 - screenPos.y, 2)
        )
        return currentDist < closestDist ? current : closest
      })

      // Convert from viewport-relative to container-relative coordinates
      markerCenterX = (closestMarker.left + closestMarker.width / 2) - overlayRect.left
      markerCenterY = (closestMarker.top + closestMarker.height / 2) - overlayRect.top
    }

    const bubbles = facilityProjects.map((project, index) => {
      // Arrange in a circle around the facility marker
      const radius = 80 // Distance from center
      const angle = (index * 2 * Math.PI / facilityProjects.length) - (Math.PI / 2) // Start at top

      return {
        project,
        x: markerCenterX + radius * Math.cos(angle) - 20, // -20 to center the 40px bubble
        y: markerCenterY + radius * Math.sin(angle) - 20
      }
    })

    setProjectBubbles(bubbles)
    setHoverCircleCenter({ x: markerCenterX, y: markerCenterY })
  }

  const handleFacilitySelect = (facilityId: number | null) => {
    if (facilityId === null) return

    // Find the facility
    const facility = facilities.find(f => f.id === facilityId)
    if (facility) {
      // Add facility panel to the stack (max 3 panels)
      const existingPanel = openPanels.find(p => p.type === 'facility' && p.data.id === facilityId)
      if (!existingPanel) {
        setOpenPanels(prev => {
          let newPanels = [...prev]

          // If at limit, remove rightmost panel (prefer removing projects over facilities)
          if (newPanels.length >= 3) {
            const projectPanels = newPanels.filter(p => p.type === 'project')
            if (projectPanels.length > 0) {
              // Remove the rightmost (last) project panel
              const lastProject = projectPanels[projectPanels.length - 1]
              newPanels = newPanels.filter(p => p.id !== lastProject.id)
            } else {
              // If no projects, remove the rightmost facility
              newPanels.pop()
            }
          }

          // Add new facility panel
          const newPanel = {
            id: `facility-${facilityId}`,
            type: 'facility' as const,
            data: facility,
            position: 0 // Facilities always start at position 0
          }

          // Sort panels: facilities first, then projects
          return [newPanel, ...newPanels].sort((a, b) => {
            if (a.type === 'facility' && b.type === 'project') return -1
            if (a.type === 'project' && b.type === 'facility') return 1
            return 0
          }).map((panel, index) => ({ ...panel, position: index }))
        })
      }
      setIsSearchPanelCollapsed(true) // Collapse search panel when showing facility details
    }

    // Toggle expansion for project bubbles
    if (expandedFacilityId === facilityId) {
      setExpandedFacilityId(null)
      return
    }

    // Find all projects at this facility
    const facilityProjects = projects.filter(p => p.facility_id === facilityId && p.latitude && p.longitude)
    if (facilityProjects.length === 0) return

    const map = mapInstanceRef.current
    if (!map || !facility) return

    // Calculate center point from all projects at this facility
    const centerLat = facilityProjects.reduce((sum, p) => sum + (p.latitude || 0), 0) / facilityProjects.length
    const centerLng = facilityProjects.reduce((sum, p) => sum + (p.longitude || 0), 0) / facilityProjects.length

    // Set expanded facility
    setExpandedFacilityId(facilityId)

    // Fly to facility location
    map.flyTo({
      center: [centerLng, centerLat],
      zoom: 14,
      duration: 1500,
      padding: { left: 300, top: 0, right: 0, bottom: 0 }
    })
  }


  // Update bubble positions when map moves
  useEffect(() => {
    if (!mapInstanceRef.current) return
    const activeFacilityId = hoveredFacilityId || expandedFacilityId
    if (!activeFacilityId) return

    const map = mapInstanceRef.current

    const updateBubblePositions = () => {
      const currentFacilityId = hoveredFacilityId || expandedFacilityId
      if (!currentFacilityId) return

      // Find facility center
      const facilityProjects = projects.filter(p => p.facility_id === currentFacilityId && p.latitude && p.longitude)
      if (facilityProjects.length === 0) return

      const centerLat = facilityProjects.reduce((sum, p) => sum + (p.latitude || 0), 0) / facilityProjects.length
      const centerLng = facilityProjects.reduce((sum, p) => sum + (p.longitude || 0), 0) / facilityProjects.length

      // Get new screen position
      const screenPos = map.project([centerLng, centerLat])

      // Get the bubbles overlay container position (viewport-relative)
      const bubblesOverlay = mapRef.current?.parentElement?.querySelector('[style*="z-index: 999"]')
      const overlayRect = bubblesOverlay?.getBoundingClientRect() || { left: 0, top: 0 }

      // Get the actual marker DOM element position to use as reference
      const markers = Array.from(document.querySelectorAll('.custom-mapbox-marker'))
      const markerElements = markers.map(m => m.getBoundingClientRect())

      // Find the marker closest to our calculated screen position
      let markerCenterX = screenPos.x
      let markerCenterY = screenPos.y + 16 // Default: use screenPos with marker offset

      if (markerElements.length > 0) {
        const closestMarker = markerElements.reduce((closest, current) => {
          const currentCenterX = current.left + current.width / 2
          const currentCenterY = current.top + current.height / 2
          const currentDist = Math.sqrt(
            Math.pow(currentCenterX - screenPos.x, 2) +
            Math.pow(currentCenterY - screenPos.y, 2)
          )
          const closestDist = Math.sqrt(
            Math.pow(closest.left + closest.width / 2 - screenPos.x, 2) +
            Math.pow(closest.top + closest.height / 2 - screenPos.y, 2)
          )
          return currentDist < closestDist ? current : closest
        })

        // Convert from viewport-relative to container-relative coordinates
        markerCenterX = (closestMarker.left + closestMarker.width / 2) - overlayRect.left
        markerCenterY = (closestMarker.top + closestMarker.height / 2) - overlayRect.top
      }

      // Recalculate bubble positions
      const bubbles = facilityProjects.map((project, index) => {
        // Arrange in a circle around the facility marker
        const radius = 80 // Distance from center
        const angle = (index * 2 * Math.PI / facilityProjects.length) - (Math.PI / 2) // Start at top

        return {
          project,
          x: markerCenterX + radius * Math.cos(angle) - 20, // -20 to center the 40px bubble
          y: markerCenterY + radius * Math.sin(angle) - 20
        }
      })

      setProjectBubbles(bubbles)
      setHoverCircleCenter({ x: markerCenterX, y: markerCenterY })
    }

    map.on('move', updateBubblePositions)
    map.on('zoom', updateBubblePositions)

    return () => {
      map.off('move', updateBubblePositions)
      map.off('zoom', updateBubblePositions)
    }
  }, [hoveredFacilityId, expandedFacilityId, projects])

  // Load district data (projects come from ProjectsContext)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const libertyHillData = await loadLibertyHillDistrict()
        setDistrictData(libertyHillData)
      } catch (error) {
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])


  useEffect(() => {
    if (!mapRef.current || initialized.current || isLoading || projects.length === 0) return

    initialized.current = true

    // Calculate center point from all projects with coordinates
    const projectsWithCoords = projects.filter(p => p.latitude && p.longitude)
    const centerLat = projectsWithCoords.length > 0
      ? projectsWithCoords.reduce((sum, p) => sum + (p.latitude || 0), 0) / projectsWithCoords.length
      : MAP_CONFIG.center[1]
    const centerLng = projectsWithCoords.length > 0
      ? projectsWithCoords.reduce((sum, p) => sum + (p.longitude || 0), 0) / projectsWithCoords.length
      : MAP_CONFIG.center[0]

    // Initialize Mapbox map with 3D standard day view
    mapInstanceRef.current = new mapboxgl.Map({
      container: mapRef.current,
      style: MAPBOX_STYLES.standardDay,
      center: [centerLng, centerLat],
      zoom: MAP_CONFIG.zoom,
      pitch: MAP_CONFIG.pitch,
      bearing: MAP_CONFIG.bearing,
      projection: 'mercator' as any,
      antialias: true
    })

    const map = mapInstanceRef.current

    // Add navigation controls (zoom buttons) to top right
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Click on map background to hide bubbles
    map.on('click', () => {
      setProjectBubbles([])
      setHoveredFacilityId(null)
      setExpandedFacilityId(null)
      setHoverCircleCenter(null)
    })

    // Trigger resize after map container is fully rendered
    map.on('load', () => {
      map.resize()
    })

    // Configure map for day view when style loads
    map.on('style.load', () => {
      if (!map) return

      // Set initial light preset based on current theme
      map.setConfigProperty('basemap', 'lightPreset', currentTheme === 'dark' ? 'dusk' : 'day')

      // Show POI and road labels for context
      try {
        map.setConfigProperty('basemap', 'showPointOfInterestLabels', true)
        map.setConfigProperty('basemap', 'showRoadLabels', true)
      } catch (e) {
        // Config not available
      }

      // Add Liberty Hill ISD district boundary
      if (districtData && districtData.shape) {
        map.addSource('district-boundary', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {
              name: 'Liberty Hill ISD'
            },
            geometry: {
              type: districtData.shape.geometry_type,
              coordinates: districtData.shape.coordinates
            }
          }
        })

        map.addLayer({
          id: 'district-fill',
          type: 'fill',
          source: 'district-boundary',
          paint: {
            'fill-color': '#c084fc',  // Light purple fill
            'fill-opacity': 0.2,
            'fill-emissive-strength': 1
          }
        })

        map.addLayer({
          id: 'district-outline',
          type: 'line',
          source: 'district-boundary',
          paint: {
            'line-color': '#9333ea',  // Purple border
            'line-width': 2,
            'line-emissive-strength': 1
          }
        })
      }
    })

    // Group projects by facility and calculate center coordinates
    const facilityGroups = new Map<number | null, { projects: Project[], centerLat: number, centerLng: number, facility?: Facility }>()

    // First, add all facilities with their actual coordinates
    facilities.forEach((facility) => {
      if (facility.latitude && facility.longitude) {
        facilityGroups.set(facility.id, {
          projects: [],
          centerLat: facility.latitude,
          centerLng: facility.longitude,
          facility: facility
        })
      }
    })

    // Then add projects to their facilities
    projectsWithCoords.forEach((project) => {
      const facilityId = project.facility_id || null

      if (facilityId && facilityGroups.has(facilityId)) {
        // Add project to existing facility
        const group = facilityGroups.get(facilityId)!
        group.projects.push(project)
      } else if (!facilityId) {
        // District-wide project without facility
        if (!facilityGroups.has(null)) {
          facilityGroups.set(null, { projects: [], centerLat: 0, centerLng: 0 })
        }
        const group = facilityGroups.get(null)!
        group.projects.push(project)
      }
    })

    // Recalculate coordinates for facilities with projects and district-wide projects
    facilityGroups.forEach((group, facilityId) => {
      // Only recalculate for district-wide projects (null facility)
      // Facilities should use their actual coordinates from the database
      if (facilityId === null && group.projects.length > 0) {
        const avgLat = group.projects.reduce((sum, p) => sum + (p.latitude || 0), 0) / group.projects.length
        const avgLng = group.projects.reduce((sum, p) => sum + (p.longitude || 0), 0) / group.projects.length
        group.centerLat = avgLat
        group.centerLng = avgLng
      }
    })

    // Add markers for each facility
    facilityGroups.forEach((group, facilityId) => {
      const facilityName = group.facility?.name || 'District-Wide'
      const projectCount = group.projects.length

      // Determine marker color based on facility status using ThemeManager
      const facilityStatus = group.facility?.status || 'Planned'
      const statusColorObj = getFacilityStatusColor(facilityStatus)
      const markerColor = statusColorObj.color

      // Create container for marker + label
      const markerContainer = document.createElement('div')
      markerContainer.style.display = 'flex'
      markerContainer.style.flexDirection = 'column'
      markerContainer.style.alignItems = 'center'
      markerContainer.style.cursor = 'pointer'
      markerContainer.style.transition = 'opacity 0.2s ease'

      // Create custom marker element
      const markerDiv = document.createElement('div')
      markerDiv.className = 'custom-mapbox-marker'
      markerDiv.style.width = '32px'
      markerDiv.style.height = '32px'
      markerDiv.style.borderRadius = '50%'
      markerDiv.style.backgroundColor = markerColor
      markerDiv.style.display = 'flex'
      markerDiv.style.alignItems = 'center'
      markerDiv.style.justifyContent = 'center'
      markerDiv.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)'
      markerDiv.style.border = '2px solid white'

      // Add Building2 icon
      const iconPath = getBuildingIconSVG()
      markerDiv.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${iconPath}</svg>`

      // Create label below marker
      const labelDiv = document.createElement('div')
      labelDiv.className = 'marker-label'
      labelDiv.style.marginTop = '4px'
      labelDiv.style.fontSize = '11px'
      labelDiv.style.fontWeight = '600'
      labelDiv.style.color = markerColor
      labelDiv.style.textShadow = '-1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white'
      labelDiv.style.whiteSpace = 'nowrap'
      labelDiv.style.textAlign = 'center'
      labelDiv.style.transition = 'opacity 0.2s ease'
      labelDiv.textContent = facilityName

      // Append marker and label to container
      markerContainer.appendChild(markerDiv)
      markerContainer.appendChild(labelDiv)

      // Create Mapbox marker with custom element
      const marker = new mapboxgl.Marker({
        element: markerContainer,
        anchor: 'top'
      })
        .setLngLat([group.centerLng, group.centerLat])
        .addTo(map)

      // Hover and click handlers (skip null facilities)
      if (facilityId !== null) {
        markerContainer.addEventListener('mouseenter', () => {
          handleFacilityHover(facilityId, true)
        })
        markerContainer.addEventListener('mouseleave', () => {
          handleFacilityHover(facilityId, false)
        })
        markerContainer.addEventListener('click', () => {
          handleFacilitySelect(facilityId)
        })
        markerContainer.style.cursor = 'pointer'
      }

      markersRef.current.push(marker)
    })

    // Handle zoom-based label visibility
    const updateMarkerLabels = () => {
      const zoom = map.getZoom()
      const labels = document.querySelectorAll('.marker-label')

      // Show labels only when zoomed in (zoom > 12)
      labels.forEach((label) => {
        if (label instanceof HTMLElement) {
          label.style.opacity = zoom > 12 ? '1' : '0'
        }
      })
    }

    // Update labels on zoom
    map.on('zoom', updateMarkerLabels)

    // Initial update
    updateMarkerLabels()

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        markersRef.current.forEach(marker => marker.remove())
        markersRef.current = []
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      initialized.current = false
    }
  }, [projects, districtData, isLoading])



  // Calculate project statistics from real data
  const totalInvestment = projects.reduce((sum, p) => sum + p.costEstimate, 0)
  const totalStudents = projects.reduce((sum, p) => sum + p.capacity, 0)
  const totalAcres = projects.reduce((sum, p) => {
    const acres = parseFloat(p.siteArea.replace(' acres', ''))
    return sum + (isNaN(acres) ? 0 : acres)
  }, 0)

  const districtStats = [
    {
      title: "Active Projects",
      value: projects.length.toString(),
      icon: MapPin,
      description: "Across district"
    },
    {
      title: "Total Investment",
      value: `$${(totalInvestment / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      description: "Bond program"
    },
    {
      title: "Students Served",
      value: totalStudents.toLocaleString(),
      icon: Users,
      description: "District capacity"
    },
    {
      title: "Campus Sites",
      value: totalAcres.toFixed(1),
      icon: TreePine,
      description: "Total acres"
    }
  ]

  // Get facility statuses for legend with counts using ThemeManager colors
  const facilityStatusGroups = [
    {
      status: facilityStatusColors.existing.label,
      color: facilityStatusColors.existing.color,
      count: facilities.filter(f => f.status === 'Existing').length
    },
    {
      status: facilityStatusColors['under-construction'].label,
      color: facilityStatusColors['under-construction'].color,
      count: facilities.filter(f => f.status === 'Under Construction').length
    },
    {
      status: facilityStatusColors.planned.label,
      color: facilityStatusColors.planned.color,
      count: facilities.filter(f => f.status === 'Planned').length
    }
  ].filter(group => group.count > 0)

  return (
    <div className="h-full relative">
      {/* Map Container */}
      <div
        ref={mapRef}
        className="absolute inset-0 w-full h-full bg-gray-50"
      />

      {/* Project Bubbles Overlay (Screen Space) */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 999 }}>
        <AnimatePresence>
          {projectBubbles.map((bubble, index) => {
            const projectTypeColorObj = getProjectTypeColor(bubble.project.projectType)
            const ProjectIcon = getProjectTypeIcon(bubble.project.projectType)

            return (
              <motion.div
                key={bubble.project.id}
                initial={{
                  scale: 0,
                  opacity: 0,
                  x: bubble.x,
                  y: bubble.y
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  x: bubble.x,
                  y: bubble.y
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: index * 0.05
                }}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  pointerEvents: 'auto',
                  cursor: 'pointer'
                }}
                onClick={() => handleProjectSelect(bubble.project)}
                onMouseEnter={() => {
                  // Keep hover state when over a bubble
                }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Circular bubble with icon */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                  style={{ backgroundColor: projectTypeColorObj.color }}
                >
                  <ProjectIcon className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>

                {/* Project info positioned below */}
                <div
                  className="absolute flex flex-col items-center"
                  style={{
                    top: '44px', // Below the 40px icon + 4px gap
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }}
                >
                  {/* Project name */}
                  <div
                    className="text-xs font-semibold whitespace-nowrap"
                    style={{
                      color: projectTypeColorObj.color,
                      textShadow: '-1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white, -1px 0 0 white, 1px 0 0 white, 0 -1px 0 white, 0 1px 0 white'
                    }}
                  >
                    {bubble.project.name}
                  </div>
                  {/* SF and Cost */}
                  <div
                    className="text-[10px] whitespace-nowrap"
                    style={{
                      color: 'var(--theme-text-secondary)',
                      textShadow: '-1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white'
                    }}
                  >
                    {(bubble.project.squareFootage / 1000).toFixed(1)}K SF • ${(bubble.project.costEstimate / 1000000).toFixed(1)}M
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Frame All Button - Top right, below Mapbox controls */}
      <button
        onClick={handleFrameAll}
        className={`absolute top-[100px] right-[10px] z-[1000] ${sidebarTheme.button.bg} ${sidebarTheme.button.hover} text-gray-700 w-[29px] h-[29px] rounded border ${sidebarTheme.button.border} shadow-sm flex items-center justify-center transition-all`}
        title="Frame all projects"
      >
        <House className="w-[18px] h-[18px]" />
      </button>

      {/* Left Sidebar - Floating with Offset, moves with main sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{
          opacity: 1,
          x: 0,
          left: isSidebarExpanded ? '312px' : '112px', // Main sidebar (280px/80px) + margin (16px) + gap (16px)
          width: isSearchPanelCollapsed ? '60px' : '288px' // 384px * 0.75 = 288px, collapsed = 60px
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`absolute top-4 bottom-4 z-[1000] ${sidebarTheme.container.bg} ${sidebarTheme.container.backdropBlur} border ${sidebarTheme.container.border} shadow-2xl flex flex-col rounded-2xl overflow-hidden`}
      >
        {/* Collapse/Expand Button */}
        <button
          onClick={() => setIsSearchPanelCollapsed(!isSearchPanelCollapsed)}
          className={`absolute top-4 ${isSearchPanelCollapsed ? 'left-1/2 -translate-x-1/2' : 'right-4'} z-10 h-8 w-8 rounded-lg ${sidebarTheme.button.bg} ${sidebarTheme.button.hover} flex items-center justify-center transition-all border ${sidebarTheme.button.border} shadow-md`}
          title={isSearchPanelCollapsed ? "Expand search panel" : "Collapse search panel"}
        >
          {isSearchPanelCollapsed ? <ChevronRight className="h-4 w-4 text-gray-700" /> : <ChevronLeft className="h-4 w-4 text-gray-700" />}
        </button>

        {/* MapSearchPanel Component */}
        {!isSearchPanelCollapsed && (
          <div className="flex-1 overflow-hidden pt-14">
            <MapSearchPanel
              projects={projects}
              onProjectSelect={handleProjectSelect}
              onFacilitySelect={(facility) => handleFacilitySelect(facility.id)}
            />
          </div>
        )}

        {/* Legend - Bottom */}
        {!isSearchPanelCollapsed && (
          <div className={`border-t ${sidebarTheme.divider} p-4 rounded-b-2xl`}>
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--theme-text-primary)' }}>
              <Layers className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
              Map Legend
            </h3>

            {/* Facility Status */}
            <div className="space-y-2 mb-4">
              <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--theme-text-tertiary)' }}>Facility Status</p>
              {facilityStatusGroups.map((group) => {
                // Determine icon for facility status
                const StatusIcon = group.status === 'Existing' ? Building2 :
                                   group.status === 'Under Construction' ? Hammer : Lightbulb

                return (
                  <div key={group.status} className="flex items-center gap-2 text-xs" style={{ color: 'var(--theme-text-primary)' }}>
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: group.color }}
                    >
                      <StatusIcon className="w-2 h-2 text-white" strokeWidth={2.5} />
                    </div>
                    <span>{group.status}</span>
                    <span style={{ color: 'var(--theme-text-secondary)' }}>({group.count})</span>
                  </div>
                )
              })}
            </div>

            {/* Project Types */}
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--theme-text-tertiary)' }}>Project Types</p>
              {Object.entries(PROJECT_TYPE_COLORS)
                .filter(([key]) => !['equity', 'specialty'].includes(key))
                .map(([key, value]) => {
                  const Icon = getProjectTypeIcon(key)
                  return (
                    <div key={key} className="flex items-center gap-2 text-xs" style={{ color: 'var(--theme-text-primary)' }}>
                      <div
                        className="w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: value.color }}
                      >
                        <Icon className="w-2 h-2 text-white" strokeWidth={2.5} />
                      </div>
                      <span>{value.label}</span>
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </motion.div>

      {/* Render all open detail panels */}
      {openPanels.map((panel, index) => {
        if (panel.type === 'facility') {
          const facility = panel.data as Facility
          return (
            <FacilityDetailedContent
              key={panel.id}
              facility={facility}
              isOpen={true}
              isMainSidebarExpanded={isSidebarExpanded}
              onClose={() => {
                setOpenPanels(prev => prev.filter(p => p.id !== panel.id))
              }}
              isMapView={true}
              isMapSearchPanelCollapsed={isSearchPanelCollapsed}
              panelIndex={index} // Add panel index for positioning
              onNavigateToProject={(project) => {
                // Add project panel next to this facility panel
                handleProjectSelect(project)
              }}
            />
          )
        } else {
          // Render project panel
          const project = panel.data as Project
          return (
            <ProjectDetailContent
              key={panel.id}
              project={project}
              isOpen={true}
              isMainSidebarExpanded={isSidebarExpanded}
              onClose={() => {
                setOpenPanels(prev => prev.filter(p => p.id !== panel.id))
              }}
              isMapView={true}
              isMapSearchPanelCollapsed={isSearchPanelCollapsed}
              panelIndex={index} // Add panel index for positioning
            />
          )
        }
      })}

    </div>
  )
}