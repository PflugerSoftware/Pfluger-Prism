import { useRef, useEffect, useState } from 'react'
import { sankey, sankeyLinkHorizontal, SankeyNode, SankeyLink } from 'd3-sankey'
import { select } from 'd3-selection'
import { Project, loadProjects } from '../../data/loadProjects'
import { Bond, loadBonds } from '../../data/loadBonds'
import { useTheme } from '../System/ThemeManager'

interface ProjectFlowSankeyProps {
  onNavigate?: (view: string) => void
  height?: number
}

interface SankeyNodeData {
  id: string
  name: string
  color?: string
  value?: number
}

interface SankeyLinkData {
  source: string
  target: string
  value: number
  color?: string
  projectCount?: number
}

// Transform projects into Sankey data structure by matching IDs
function prepareSankeyData(projects: Project[], bonds: Bond[]) {
  const nodes: SankeyNodeData[] = []
  const links: SankeyLinkData[] = []

  // Bond colors
  const bondColors = ['#003C71', '#67823A', '#9333EA', '#EC4899', '#DC2626', '#7C3AED']

  // Project type colors
  const projectTypeColors: Record<string, string> = {
    'New Construction': '#00A9E0',
    'Renovations': '#67823A',
    'Additions': '#9333EA',
    'Equity': '#EC4899',
    'Specialty': '#F2A900'
  }

  // Create a map of project ID -> bond names
  // This is built from bond.projectIds array
  const projectToBonds = new Map<number, string[]>()
  bonds.forEach(bond => {
    bond.projectIds.forEach(projectId => {
      const existing = projectToBonds.get(projectId) || []
      projectToBonds.set(projectId, [...existing, bond.name])
    })
  })

  // Level 1 (LEFT): Project Types
  const projectTypeMap = new Map<string, number>()
  projects.forEach(project => {
    const currentValue = projectTypeMap.get(project.projectType) || 0
    projectTypeMap.set(project.projectType, currentValue + project.costEstimate / 1_000_000)
  })

  projectTypeMap.forEach((value, type) => {
    nodes.push({
      id: `type-${type}`,
      name: type,
      color: projectTypeColors[type] || '#999999',
      value: value
    })
  })

  // Level 2 (MIDDLE): Individual projects sorted by budget
  const sortedProjects = [...projects].sort((a, b) => b.costEstimate - a.costEstimate)

  sortedProjects.forEach(project => {
    const projectBudget = project.costEstimate / 1_000_000
    const projectBonds = projectToBonds.get(Number(project.id)) || []
    const hasBonds = projectBonds.length > 0

    nodes.push({
      id: `project-${project.id}`,
      name: project.name,
      color: hasBonds ? '#00A9E0' : '#F2A900',
      value: projectBudget
    })

    // Link from project type to project
    links.push({
      source: `type-${project.projectType}`,
      target: `project-${project.id}`,
      value: projectBudget,
      color: projectTypeColors[project.projectType] || '#999999',
      projectCount: 1
    })
  })

  // Level 3 (RIGHT): Unassigned bucket
  const unassignedProjects = projects.filter(p => {
    const projectBonds = projectToBonds.get(Number(p.id)) || []
    return projectBonds.length === 0
  })
  const unassignedBudget = unassignedProjects.reduce((sum, p) => sum + p.costEstimate, 0) / 1_000_000

  if (unassignedBudget > 0) {
    nodes.push({
      id: 'unassigned',
      name: 'Unassigned',
      color: '#F2A900',
      value: unassignedBudget
    })

    // Links from unassigned projects to Unassigned bucket
    unassignedProjects.forEach(project => {
      const projectBudget = project.costEstimate / 1_000_000
      links.push({
        source: `project-${project.id}`,
        target: 'unassigned',
        value: projectBudget,
        color: '#F2A900',
        projectCount: 1
      })
    })
  }

  // Level 3 (RIGHT): Individual bond nodes
  bonds.forEach((bond, index) => {
    const bondColor = bondColors[index % bondColors.length]

    // Get projects in this bond using projectIds - ensure type consistency
    const bondProjects = projects.filter(p => bond.projectIds.includes(Number(p.id)))
    const bondBudget = bondProjects.reduce((sum, p) => sum + p.costEstimate, 0) / 1_000_000

    if (bondBudget > 0) {
      nodes.push({
        id: `bond-${bond.id}`,
        name: bond.name,
        color: bondColor,
        value: bondBudget
      })

      // Links from projects to this bond
      bondProjects.forEach(project => {
        const projectBudget = project.costEstimate / 1_000_000
        links.push({
          source: `project-${project.id}`,
          target: `bond-${bond.id}`,
          value: projectBudget,
          color: bondColor,
          projectCount: 1
        })
      })
    }
  })

  return { nodes, links }
}

export function ProjectFlowSankey({ height = 600 }: ProjectFlowSankeyProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { themeColors } = useTheme()

  // Fetch data directly from APIs
  const [projects, setProjects] = useState<Project[]>([])
  const [bonds, setBonds] = useState<Bond[]>([])
  const [loading, setLoading] = useState(true)

  // Load data on mount and periodically refresh
  useEffect(() => {
    async function fetchData() {
      try {
        const [loadedProjects, loadedBonds] = await Promise.all([
          loadProjects(),
          loadBonds()
        ])
        setProjects(loadedProjects)
        setBonds(loadedBonds)
      } catch (error) {
        // Silent fail
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Refresh every 5 seconds to catch bond updates
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  // Render the Sankey diagram
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || projects.length === 0) return

    const { nodes, links } = prepareSankeyData(projects, bonds)

    // Get container width for responsive design
    const width = containerRef.current.offsetWidth
    const margin = { top: 20, right: 140, bottom: 20, left: 250 }

    // Create node ID to index mapping
    const nodeMap = new Map(nodes.map((node, index) => [node.id, index]))

    // Create Sankey generator
    const sankeyGenerator = sankey<SankeyNodeData, SankeyLinkData>()
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])

    // Convert string IDs to numeric indices for sankey
    const sankeyLinks = links.map(link => ({
      ...link,
      source: nodeMap.get(link.source) as number,
      target: nodeMap.get(link.target) as number
    }))

    // Generate layout
    const graph = sankeyGenerator({
      nodes: nodes.map(d => ({ ...d })),
      links: sankeyLinks
    })

    // Clear previous render
    const svg = select(svgRef.current)
    svg.selectAll('*').remove()

    // Create gradient definitions for each link
    const defs = svg.append('defs')

    graph.links.forEach((link, index) => {
      const sourceColor = (link.source as any).color || '#999'
      const targetColor = (link.target as any).color || '#999'
      const gradientId = `gradient-${index}`

      const gradient = defs.append('linearGradient')
        .attr('id', gradientId)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', (link.source as any).x1)
        .attr('x2', (link.target as any).x0)

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', sourceColor)
        .attr('stop-opacity', 0.6)

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', targetColor)
        .attr('stop-opacity', 0.6)
    })

    // Draw links (flows)
    const linkGroup = svg.append('g')
      .attr('class', 'links')
      .selectAll('path')
      .data(graph.links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', (d, i) => `url(#gradient-${i})`)
      .attr('stroke-width', d => Math.max(1, d.width || 0))
      .attr('fill', 'none')
      .attr('opacity', 0.7)
      .style('cursor', 'pointer')
      .on('mouseenter', function() {
        select(this).attr('opacity', 1)
      })
      .on('mouseleave', function() {
        select(this).attr('opacity', 0.7)
      })

    // Add tooltips to links
    linkGroup.append('title')
      .text(d => {
        const source = (d.source as any).name
        const target = (d.target as any).name
        const value = d.value.toFixed(1)
        const count = (d as any).projectCount || 0
        return `${source} → ${target}\n$${value}M\n${count} project${count !== 1 ? 's' : ''}`
      })

    // Draw nodes
    const nodeGroup = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(graph.nodes)
      .join('g')

    nodeGroup.append('rect')
      .attr('x', d => d.x0 || 0)
      .attr('y', d => d.y0 || 0)
      .attr('height', d => (d.y1 || 0) - (d.y0 || 0))
      .attr('width', d => (d.x1 || 0) - (d.x0 || 0))
      .attr('fill', d => (d as any).color || '#999')
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .on('mouseenter', function() {
        select(this).attr('opacity', 0.8)
      })
      .on('mouseleave', function() {
        select(this).attr('opacity', 1)
      })

    // Add tooltips to nodes
    nodeGroup.append('title')
      .text(d => `${(d as any).name}\n$${(d as any).value.toFixed(1)}M`)

    // Add node labels (names)
    nodeGroup.append('text')
      .attr('x', d => {
        const x0 = d.x0 || 0
        const x1 = d.x1 || 0
        const nodeId = (d as any).id as string

        // Determine position based on node type
        if (nodeId.startsWith('type-')) {
          // Project types: text to the left
          return x0 - 6
        } else if (nodeId.startsWith('project-')) {
          // Projects: check position to determine if text should be inside or outside
          // If in the first third of width, text to left; if in last third, text to right
          const position = (x0 + x1) / 2
          if (position < width * 0.4) {
            return x0 - 6  // Text to the left for leftmost projects
          } else if (position > width * 0.6) {
            return x1 + 6  // Text to the right for rightmost projects
          } else {
            // Middle projects - place text based on available space
            return x0 - 6
          }
        } else {
          // Bonds and Unassigned: text to the right
          return x1 + 6
        }
      })
      .attr('y', d => {
        const y0 = d.y0 || 0
        const y1 = d.y1 || 0
        return (y1 + y0) / 2
      })
      .attr('dy', '0.35em')
      .attr('text-anchor', d => {
        const x0 = d.x0 || 0
        const x1 = d.x1 || 0
        const nodeId = (d as any).id as string

        if (nodeId.startsWith('type-')) {
          // Project types: right-aligned
          return 'end'
        } else if (nodeId.startsWith('project-')) {
          // Projects: check position
          const position = (x0 + x1) / 2
          if (position < width * 0.4) {
            return 'end'  // Right-aligned for leftmost
          } else if (position > width * 0.6) {
            return 'start'  // Left-aligned for rightmost
          } else {
            return 'end'  // Middle projects
          }
        } else {
          // Bonds and Unassigned: left-aligned
          return 'start'
        }
      })
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .attr('fill', themeColors.textPrimary)
      .text(d => (d as any).name)

    // Add value labels below node names
    nodeGroup.append('text')
      .attr('x', d => {
        const x0 = d.x0 || 0
        const x1 = d.x1 || 0
        const nodeId = (d as any).id as string

        // Match the positioning of the name labels
        if (nodeId.startsWith('type-')) {
          return x0 - 6
        } else if (nodeId.startsWith('project-')) {
          const position = (x0 + x1) / 2
          if (position < width * 0.4) {
            return x0 - 6
          } else if (position > width * 0.6) {
            return x1 + 6
          } else {
            return x0 - 6
          }
        } else {
          return x1 + 6
        }
      })
      .attr('y', d => {
        const y0 = d.y0 || 0
        const y1 = d.y1 || 0
        return (y1 + y0) / 2 + 18
      })
      .attr('dy', '0.35em')
      .attr('text-anchor', d => {
        const nodeId = (d as any).id as string
        const x0 = d.x0 || 0
        const x1 = d.x1 || 0

        if (nodeId.startsWith('type-')) {
          return 'end'
        } else if (nodeId.startsWith('project-')) {
          const position = (x0 + x1) / 2
          if (position < width * 0.4) {
            return 'end'
          } else if (position > width * 0.6) {
            return 'start'
          } else {
            return 'end'
          }
        } else {
          return 'start'
        }
      })
      .attr('font-size', '11px')
      .attr('fill', themeColors.textSecondary)
      .text(d => `$${(d as any).value.toFixed(1)}M`)

  }, [projects, bonds, height, themeColors])

  // Handle resize
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver(() => {
      // Trigger re-render on resize
      if (svgRef.current && containerRef.current) {
        const event = new Event('resize')
        window.dispatchEvent(event)
      }
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        Loading project flow data...
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No project data available
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} width="100%" height={height} />
    </div>
  )
}
