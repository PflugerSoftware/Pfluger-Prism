import { useEffect, useRef, useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { MapPin, Search, Loader2 } from 'lucide-react'
import mapboxgl from 'mapbox-gl'
import { MAPBOX_TOKEN, MAPBOX_STYLES } from '../../config/mapbox'
import { loadLibertyHillDistrict } from '../../data/loadDistricts'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = MAPBOX_TOKEN

interface MapPickerProps {
  selectedAddress: string
  selectedLatitude?: number
  selectedLongitude?: number
  onLocationSelect: (address: string, latitude: number, longitude: number) => void
}

export function InteractiveMapPickerWithDistrict({
  selectedAddress,
  selectedLatitude,
  selectedLongitude,
  onLocationSelect
}: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)

  const [addressInput, setAddressInput] = useState(selectedAddress || '')
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geocodeError, setGeocodeError] = useState('')

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Center on Liberty Hill, TX by default
    const defaultLat = selectedLatitude || 30.6620
    const defaultLng = selectedLongitude || -97.9252

    // Initialize Mapbox map with 3D standard day view
    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: MAPBOX_STYLES.standardDay,
      center: [defaultLng, defaultLat],
      zoom: 13,
      pitch: 45,
      bearing: 0,
      projection: 'mercator' as any,
      antialias: true
    })

    mapInstanceRef.current = map

    // Configure map for day view when style loads
    map.on('style.load', () => {
      // Set to day preset (standard day view)
      map.setConfigProperty('basemap', 'lightPreset', 'day')

      // Show POI and road labels for context
      try {
        map.setConfigProperty('basemap', 'showPointOfInterestLabels', true)
        map.setConfigProperty('basemap', 'showRoadLabels', true)
      } catch (e) {
        // Config not available
      }

      // Load and display Liberty Hill ISD district boundary
      loadDistrictBoundary(map)
    })

    // Add initial marker if coordinates exist
    if (selectedLatitude && selectedLongitude) {
      markerRef.current = new mapboxgl.Marker({
        draggable: true,
        color: '#3b82f6'
      })
        .setLngLat([selectedLongitude, selectedLatitude])
        .addTo(map)

      // Handle marker drag
      markerRef.current.on('dragend', () => {
        const lngLat = markerRef.current!.getLngLat()
        reverseGeocode(lngLat.lat, lngLat.lng)
      })
    }

    // Handle map clicks
    map.on('click', (e) => {
      const { lng, lat } = e.lngLat

      // Remove existing marker if any
      if (markerRef.current) {
        markerRef.current.remove()
      }

      // Add new draggable marker
      markerRef.current = new mapboxgl.Marker({
        draggable: true,
        color: '#3b82f6'
      })
        .setLngLat([lng, lat])
        .addTo(map)

      // Handle marker drag
      markerRef.current.on('dragend', () => {
        const lngLat = markerRef.current!.getLngLat()
        reverseGeocode(lngLat.lat, lngLat.lng)
      })

      // Reverse geocode to get address
      reverseGeocode(lat, lng)
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
    }
  }, []) // Only run once on mount

  // Load Liberty Hill ISD district boundary
  const loadDistrictBoundary = async (map: mapboxgl.Map) => {
    try {
      // Load Liberty Hill ISD from CSV data (same source as MapView)
      const districtData = await loadLibertyHillDistrict()

      if (!districtData || !districtData.shape) {
        return
      }

      // Convert CSV shape data to GeoJSON format
      const libertyHillGeoJSON = {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: districtData.attributes,
          geometry: {
            type: districtData.shape.geometry_type,
            coordinates: districtData.shape.coordinates
          }
        }]
      }

      // Add source
      map.addSource('district-boundary', {
        type: 'geojson',
        data: libertyHillGeoJSON as any
      })

      // Add fill layer (semi-transparent) - matches MapView styling
      map.addLayer({
        id: 'district-fill',
        type: 'fill',
        source: 'district-boundary',
        paint: {
          'fill-color': '#c084fc',  // Light purple fill
          'fill-opacity': 0.2
        }
      })

      // Add outline layer - matches MapView styling
      map.addLayer({
        id: 'district-outline',
        type: 'line',
        source: 'district-boundary',
        paint: {
          'line-color': '#9333ea',  // Purple border
          'line-width': 2
        }
      })

    } catch (error) {
      // Continue without district boundary - not critical
    }
  }

  // Reverse geocode: lat/lng → address
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsGeocoding(true)
    setGeocodeError('')

    try {
      // Using Nominatim (OpenStreetMap) - free, no API key required
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ProjectPrism/1.0' // Nominatim requires a user agent
          }
        }
      )

      if (!response.ok) {
        throw new Error('Geocoding failed')
      }

      const data = await response.json()
      const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`

      setAddressInput(address)
      onLocationSelect(address, lat, lng)
    } catch (error) {
      setGeocodeError('Could not find address for this location')
      // Still save the coordinates
      onLocationSelect(`${lat.toFixed(6)}, ${lng.toFixed(6)}`, lat, lng)
    } finally {
      setIsGeocoding(false)
    }
  }

  // Forward geocode: address → lat/lng
  const forwardGeocode = async (address: string) => {
    if (!address.trim()) {
      setGeocodeError('Please enter an address')
      return
    }

    setIsGeocoding(true)
    setGeocodeError('')

    try {
      // Using Nominatim (OpenStreetMap) - free, no API key required
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ProjectPrism/1.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Geocoding failed')
      }

      const data = await response.json()

      if (!data || data.length === 0) {
        setGeocodeError('Address not found. Please try a different address.')
        return
      }

      const result = data[0]
      const lat = parseFloat(result.lat)
      const lng = parseFloat(result.lon)

      // Update map view and marker
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo({
          center: [lng, lat],
          zoom: 15,
          pitch: 45,
          duration: 2000
        })

        // Remove existing marker
        if (markerRef.current) {
          markerRef.current.remove()
        }

        // Add new marker
        markerRef.current = new mapboxgl.Marker({
          draggable: true,
          color: '#3b82f6'
        })
          .setLngLat([lng, lat])
          .addTo(mapInstanceRef.current)

        // Handle marker drag
        markerRef.current.on('dragend', () => {
          const lngLat = markerRef.current!.getLngLat()
          reverseGeocode(lngLat.lat, lngLat.lng)
        })
      }

      // Use the formatted address from geocoding result
      const formattedAddress = result.display_name
      setAddressInput(formattedAddress)
      onLocationSelect(formattedAddress, lat, lng)
    } catch (error) {
      setGeocodeError('Could not find this address. Please try again.')
    } finally {
      setIsGeocoding(false)
    }
  }

  const handleAddressSearch = (e: React.FormEvent) => {
    e.preventDefault()
    forwardGeocode(addressInput)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Address Search Input */}
      <div className="p-4 border-b bg-white">
        <form onSubmit={handleAddressSearch} className="space-y-3">
          <div>
            <Label className="text-sm mb-2 block">Search by Address</Label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Enter street address, city, state..."
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                type="submit"
                disabled={isGeocoding}
                className="px-4"
              >
                {isGeocoding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {geocodeError && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {geocodeError}
            </div>
          )}

          <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
            <strong>Tip:</strong> Click anywhere on the map to select a location, or search for an address above.
            You can also drag the marker to fine-tune the position.
          </div>

          {selectedLatitude && selectedLongitude && (
            <div className="text-xs text-gray-600 bg-green-50 p-2 rounded border border-green-200">
              <div className="font-medium text-green-900 mb-1">Selected Location:</div>
              <div>Address: {selectedAddress || 'Loading...'}</div>
              <div>Coordinates: {selectedLatitude.toFixed(6)}, {selectedLongitude.toFixed(6)}</div>
            </div>
          )}

          <div className="text-xs text-gray-600 bg-purple-50 p-2 rounded border border-purple-200">
            <div className="font-medium text-purple-900 mb-1">Liberty Hill ISD District</div>
            <div>The purple shaded area shows the Liberty Hill ISD district boundary</div>
          </div>
        </form>
      </div>

      {/* Map Container */}
      <div
        ref={mapRef}
        className="flex-1 bg-gray-100"
        style={{ minHeight: '400px' }}
      />
    </div>
  )
}
