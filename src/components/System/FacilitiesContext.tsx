import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { API_CONFIG } from '../../config/apiConfig'

export interface Facility {
  id: number
  name: string
  facility_type: 'Elementary' | 'Middle' | 'High School' | 'Specialty' | 'Administration' | 'District'
  address?: string
  latitude?: number
  longitude?: number
  site_area?: string
  year_built?: number
  current_enrollment: number
  capacity: number
  status: 'Existing' | 'Under Construction' | 'Planned'
  project_count?: number
  total_project_cost?: number
  created_at?: string
  updated_at?: string
}

interface FacilitiesContextType {
  facilities: Facility[]
  addFacility: (facility: Omit<Facility, 'id'>) => Promise<void>
  updateFacility: (id: number, updates: Partial<Facility>) => Promise<void>
  deleteFacility: (id: number) => Promise<void>
  refreshFacilities: () => Promise<void>
  getFacilityById: (id: number) => Facility | undefined
}

const FacilitiesContext = createContext<FacilitiesContextType | undefined>(undefined)

export function FacilitiesProvider({ children }: { children: ReactNode }) {
  const [facilities, setFacilities] = useState<Facility[]>([])

  // Load facilities from API
  const loadFacilities = async () => {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/facilities.php`)
      if (!response.ok) {
        throw new Error('Failed to fetch facilities')
      }
      const data = await response.json()
      // Convert string coordinates to numbers if needed
      const processedData = data.map((facility: any) => ({
        ...facility,
        latitude: facility.latitude ? parseFloat(facility.latitude) : undefined,
        longitude: facility.longitude ? parseFloat(facility.longitude) : undefined,
        year_built: facility.year_built ? parseInt(facility.year_built) : undefined,
        current_enrollment: parseInt(facility.current_enrollment) || 0,
        capacity: parseInt(facility.capacity) || 0
      }))
      setFacilities(processedData)
    } catch (error) {
    }
  }

  // Load initial facilities
  useEffect(() => {
    loadFacilities()
  }, [])

  const addFacility = async (facility: Omit<Facility, 'id'>) => {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/facilities.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(facility)
      })

      if (!response.ok) {
        throw new Error('Failed to create facility')
      }

      const newFacility = await response.json()
      // Process the response to ensure correct types
      const processedFacility = {
        ...newFacility,
        latitude: newFacility.latitude ? parseFloat(newFacility.latitude) : undefined,
        longitude: newFacility.longitude ? parseFloat(newFacility.longitude) : undefined,
        year_built: newFacility.year_built ? parseInt(newFacility.year_built) : undefined,
        current_enrollment: parseInt(newFacility.current_enrollment) || 0,
        capacity: parseInt(newFacility.capacity) || 0
      }
      setFacilities(prev => [...prev, processedFacility])
      return newFacility
    } catch (error) {
      throw error
    }
  }

  const updateFacility = async (id: number, updates: Partial<Facility>) => {
    try {
      const fullFacility = facilities.find(f => f.id === id)
      if (!fullFacility) {
        throw new Error('Facility not found')
      }

      const updatedFacility = { ...fullFacility, ...updates }

      const response = await fetch(`${API_CONFIG.baseUrl}/facilities.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFacility)
      })

      if (!response.ok) {
        throw new Error('Failed to update facility')
      }

      const result = await response.json()
      // Process the response to ensure correct types
      const processedResult = {
        ...result,
        latitude: result.latitude ? parseFloat(result.latitude) : undefined,
        longitude: result.longitude ? parseFloat(result.longitude) : undefined,
        year_built: result.year_built ? parseInt(result.year_built) : undefined,
        current_enrollment: parseInt(result.current_enrollment) || 0,
        capacity: parseInt(result.capacity) || 0
      }
      setFacilities(prev => prev.map(f => (f.id === id ? processedResult : f)))
    } catch (error) {
      throw error
    }
  }

  const deleteFacility = async (id: number) => {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/facilities.php?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete facility')
      }

      setFacilities(prev => prev.filter(f => f.id !== id))
    } catch (error) {
      throw error
    }
  }

  const refreshFacilities = async () => {
    await loadFacilities()
  }

  const getFacilityById = (id: number) => {
    return facilities.find(f => f.id === id)
  }

  return (
    <FacilitiesContext.Provider
      value={{
        facilities,
        addFacility,
        updateFacility,
        deleteFacility,
        refreshFacilities,
        getFacilityById
      }}
    >
      {children}
    </FacilitiesContext.Provider>
  )
}

export function useFacilities() {
  const context = useContext(FacilitiesContext)
  if (context === undefined) {
    throw new Error('useFacilities must be used within a FacilitiesProvider')
  }
  return context
}
