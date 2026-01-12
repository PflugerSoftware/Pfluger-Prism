import type { CostRateData } from './types'
import type { Project } from '../../../data/loadProjects'

export const getProcurementMultiplierKey = (method: string): keyof CostRateData => {
  switch (method?.toLowerCase()) {
    case 'cmar': return 'mult_procurement_cmar';
    case 'hard bid': return 'mult_procurement_hard_bid';
    case 'design build': case 'design-build': return 'mult_procurement_design_build';
    case 'csp': case 'competitive sealed proposal': return 'mult_procurement_csp';
    default: return 'mult_procurement_design_build';
  }
};

export const getConstructionMultiplierKey = (type: string): keyof CostRateData => {
  switch (type?.toLowerCase()) {
    case 'concrete': return 'mult_construction_concrete';
    case 'steel': return 'mult_construction_steel';
    case 'mass timber': return 'mult_construction_mass_timber';
    case 'wood frame': return 'mult_construction_wood_frame';
    default: return 'mult_construction_steel';
  }
};

export const getStoriesMultiplierKey = (stories: number): keyof CostRateData => {
  if (stories <= 1) return 'mult_stories_1';
  if (stories === 2) return 'mult_stories_2';
  if (stories === 3) return 'mult_stories_3';
  return 'mult_stories_4';
};

export const calculateElementCost = (
  rate: CostRateData,
  sliderPos: number,
  squareFootage: number,
  procurementMethod: string,
  constructionType: string,
  stories: number
): { costPerSF: number; cost: number } => {
  const t = sliderPos / 100
  const baseCostPerSF = rate.cost_per_sf_low + (rate.cost_per_sf_high - rate.cost_per_sf_low) * t

  const procKey = getProcurementMultiplierKey(procurementMethod)
  const constKey = getConstructionMultiplierKey(constructionType)
  const storiesKey = getStoriesMultiplierKey(stories)

  const procMult = (rate[procKey] as number) || 1
  const constMult = (rate[constKey] as number) || 1
  const storiesMult = (rate[storiesKey] as number) || 1

  const finalCostPerSF = baseCostPerSF * procMult * constMult * storiesMult
  const totalCost = finalCostPerSF * squareFootage

  return { costPerSF: finalCostPerSF, cost: totalCost }
}

export const parsePauseDurations = (projectPauses?: string): number => {
  if (!projectPauses) return 0
  try {
    const pausePhases = JSON.parse(projectPauses)
    return pausePhases.reduce((sum: number, pause: { duration?: number }) => sum + (pause.duration || 0), 0)
  } catch {
    return 0
  }
}

export const formatToMonthYear = (date: Date): string => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December']
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}

export const parseMonthYear = (dateStr: string): Date | null => {
  try {
    let date = new Date(dateStr)

    if (isNaN(date.getTime())) {
      const [month, year] = dateStr.split(' ')
      const monthIndex = new Date(Date.parse(month + " 1, 2000")).getMonth()
      date = new Date(parseInt(year), monthIndex, 1)
    }

    if (isNaN(date.getTime())) {
      return null
    }

    return date
  } catch {
    return null
  }
}

export const calculateProjectDatesFromPhases = (proj: Project): { completionDate: string; duration: string } => {
  const startDate = parseMonthYear(proj.startDate || '')
  if (!startDate) {
    return {
      completionDate: proj.completionDate || '',
      duration: proj.duration || ''
    }
  }

  const totalMonths =
    (proj.procurementPhaseDuration || 0) +
    (proj.designPhaseDuration || 0) +
    (proj.constructionPhaseDuration || 0) +
    parsePauseDurations(proj.projectPauses)

  if (totalMonths === 0) {
    return {
      completionDate: proj.completionDate || '',
      duration: proj.duration || ''
    }
  }

  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + totalMonths)

  const completionDate = formatToMonthYear(endDate)
  const duration = `${totalMonths} month${totalMonths !== 1 ? 's' : ''}`

  return {
    completionDate,
    duration
  }
}

export const getBuildingTypeColor = (buildingType: string): string => {
  const normalized = buildingType === 'Middle' ? 'Middle School' : buildingType
  switch (normalized) {
    case 'High School': return '#FF6B6B'
    case 'Middle School': return '#4ECDC4'
    case 'Elementary': return '#FFD93D'
    case 'Specialty': return '#A78BFA'
    default: return '#8E8E93'
  }
}

export const reverseEngineerSliderPosition = (
  existingCostPerSF: number,
  rate: CostRateData,
  procurementMethod: string,
  constructionType: string,
  numberOfStories: number
): number => {
  if (rate.cost_per_sf_high <= rate.cost_per_sf_low) return 50

  const procKey = getProcurementMultiplierKey(procurementMethod)
  const constKey = getConstructionMultiplierKey(constructionType)
  const storiesKey = getStoriesMultiplierKey(numberOfStories)

  const procMult = (rate[procKey] as number) || 1
  const constMult = (rate[constKey] as number) || 1
  const storiesMult = (rate[storiesKey] as number) || 1

  const baseCostPerSF = existingCostPerSF / (procMult * constMult * storiesMult)
  const range = rate.cost_per_sf_high - rate.cost_per_sf_low
  const position = ((baseCostPerSF - rate.cost_per_sf_low) / range) * 100

  return Math.max(0, Math.min(100, position))
}
