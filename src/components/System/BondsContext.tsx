import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { loadBonds, saveBond as apiSaveBond, updateBond as apiUpdateBond, deleteBond as apiDeleteBond, Bond } from '../../data/loadBonds'

interface BondsContextType {
  bonds: Bond[]
  addBond: (bond: Bond) => Promise<void>
  updateBond: (id: number, updates: Partial<Bond>) => Promise<void>
  deleteBond: (id: number) => Promise<void>
  refreshBonds: () => Promise<void>
}

const BondsContext = createContext<BondsContextType | undefined>(undefined)

export function BondsProvider({ children }: { children: ReactNode }) {
  const [bonds, setBonds] = useState<Bond[]>([])

  // Load initial bonds from API
  useEffect(() => {
    loadBonds().then(loadedBonds => {
      setBonds(loadedBonds)
    })
  }, [])

  const addBond = async (bond: Bond) => {
    // Save to API first
    const result = await apiSaveBond(bond)

    if (result.success && result.id) {
      await refreshBonds()
    } else {
      throw new Error(result.error || 'Failed to save bond')
    }
  }

  const updateBond = async (id: number, updates: Partial<Bond>) => {
    // Update API first
    const fullBond = bonds.find(b => b.id === id)
    if (!fullBond) {
      throw new Error('Bond not found')
    }

    const updatedBond = { ...fullBond, ...updates }
    const result = await apiUpdateBond(updatedBond)

    if (result.success) {
      await refreshBonds()
    } else {
      throw new Error(result.error || 'Failed to update bond')
    }
  }

  const deleteBond = async (id: number) => {
    // Delete from API first
    const result = await apiDeleteBond(id)

    if (result.success) {
      setBonds(prev => prev.filter(b => b.id !== id))
    } else {
      throw new Error(result.error || 'Failed to delete bond')
    }
  }

  const refreshBonds = async () => {
    const loadedBonds = await loadBonds()
    setBonds(loadedBonds)
  }

  return (
    <BondsContext.Provider
      value={{ bonds, addBond, updateBond, deleteBond, refreshBonds }}
    >
      {children}
    </BondsContext.Provider>
  )
}

export function useBonds() {
  const context = useContext(BondsContext)
  if (context === undefined) {
    throw new Error('useBonds must be used within a BondsProvider')
  }
  return context
}
