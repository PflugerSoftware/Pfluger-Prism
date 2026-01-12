import Papa from 'papaparse'

export interface DistrictShape {
  GEOID20: string
  geometry_type: string
  coordinates: number[][][] | number[][][][]  // Polygon or MultiPolygon
}

export interface DistrictAttributes {
  GEOID20: string
  NAME20: string
  NAME: string
  NAME2: string
  NCES_DISTR: string
  District_Valuation: number
  District_Tax_rate: number
  Office_Controller: string
  Client_Perspective: string
  Pfluger_Tier_Rank: string
  COLOR: number
  [key: string]: any
}

async function loadCSV<T>(url: string): Promise<T[]> {
  const response = await fetch(url)
  const csvText = await response.text()

  return new Promise((resolve, reject) => {
    Papa.parse<T>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data)
      },
      error: (error) => {
        reject(error)
      }
    })
  })
}

export async function loadDistrictShapes(): Promise<DistrictShape[]> {
  try {
    const shapesData = await loadCSV<any>('/data/district_shapes.csv')

    const shapes: DistrictShape[] = shapesData.map((row: any) => {
      return {
        GEOID20: row.GEOID20,
        geometry_type: row.geometry_type,
        coordinates: JSON.parse(row.coordinates)
      }
    })

    return shapes
  } catch (error) {
    return []
  }
}

export async function loadDistrictAttributes(): Promise<DistrictAttributes[]> {
  try {
    const attributesData = await loadCSV<any>('/data/district_attributes.csv')

    const attributes: DistrictAttributes[] = attributesData.map((row: any) => {
      return {
        GEOID20: row.GEOID20,
        NAME20: row.NAME20,
        NAME: row.NAME,
        NAME2: row.NAME2,
        NCES_DISTR: row.NCES_DISTR,
        District_Valuation: parseFloat(row.District_Valuation) || 0,
        District_Tax_rate: parseFloat(row.District_Tax_rate) || 0,
        Office_Controller: row.Office_Controller,
        Client_Perspective: row.Client_Perspective,
        Pfluger_Tier_Rank: row.Pfluger_Tier_Rank,
        COLOR: parseInt(row.COLOR) || 0,
        ...row
      }
    })

    return attributes
  } catch (error) {
    return []
  }
}

export async function loadLibertyHillDistrict() {
  const LIBERTY_HILL_GEOID = '4827420'

  try {
    const [shapes, attributes] = await Promise.all([
      loadDistrictShapes(),
      loadDistrictAttributes()
    ])

    const shape = shapes.find(s => s.GEOID20 === LIBERTY_HILL_GEOID)
    const attrs = attributes.find(a => a.GEOID20 === LIBERTY_HILL_GEOID)

    if (!shape || !attrs) {
      return null
    }

    return {
      shape,
      attributes: attrs
    }
  } catch (error) {
    return null
  }
}
