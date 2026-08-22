"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { X, Search, MapPin } from "lucide-react"
import { Button, Input } from "antd"

const Modal = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {children}
      </div>
    </div>
  )
}

interface Location {
  lat: number
  lon: number
  address: string
}

interface MapModalProps {
  isOpen: boolean
  onClose: () => void
  onLocationSelect: (location: Location) => void
  initialLat?: number
  initialLon?: number
}

export default function MapModal({ isOpen, onClose, onLocationSelect, initialLat, initialLon }: MapModalProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const currentMarkerRef = useRef<any>(null)

  // Clear any existing marker
  const clearMarker = () => {
    if (currentMarkerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(currentMarkerRef.current)
      currentMarkerRef.current = null
    }
  }

  // Add a single marker
  const addMarker = (lat: number, lng: number, L: any) => {
    // First clear any existing marker
    clearMarker()

    // Create and add new marker
    const newMarker = L.marker([lat, lng]).addTo(mapInstanceRef.current)
    currentMarkerRef.current = newMarker

    return newMarker
  }

  useEffect(() => {
    if (!isOpen || !mapRef.current) return

    const initMap = async () => {
      // Clear any existing map first
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        currentMarkerRef.current = null
      }

      const L = (await import("leaflet")).default

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      })

      const mapInstance = L.map(mapRef.current!, {
        zoomAnimation: false,
        fadeAnimation: false,
        markerZoomAnimation: false,
      }).setView([20.5937, 78.9629], 5)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance)

      mapInstance.on("click", async (e: any) => {
        const { lat, lng } = e.latlng
        await handleMapClick(lat, lng, L)
      })

      mapInstanceRef.current = mapInstance

      // Add initial marker if coordinates provided
      if (initialLat && initialLon) {
        addMarker(initialLat, initialLon, L)
        mapInstance.setView([initialLat, initialLon], 13, { animate: false })
      }
    }

    initMap()

    return () => {
      // Cleanup on unmount
      clearMarker()
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [isOpen])

  const handleMapClick = async (lat: number, lng: number, L: any) => {
    // Add single marker at clicked location
    addMarker(lat, lng, L)

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      )
      const data = await response.json()

      const location: Location = {
        lat,
        lon: lng,
        address: data.display_name || `${lat}, ${lng}`,
      }

      setSelectedLocation(location)
    } catch (error) {
      console.error("Error getting address:", error)
      setSelectedLocation({
        lat,
        lon: lng,
        address: `${lat}, ${lng}`,
      })
    }
  }

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation)
      onClose()
    }
  }

  const searchLocation = async () => {
    if (!searchQuery.trim() || !mapInstanceRef.current) return

    setIsLoading(true)

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=in`,
      )
      const data = await response.json()

      if (data.length > 0) {
        const result = data[0]
        const lat = Number.parseFloat(result.lat)
        const lng = Number.parseFloat(result.lon)

        // Set view without animation for instant positioning
        mapInstanceRef.current.setView([lat, lng], 13, { animate: false })

        const L = (await import("leaflet")).default
        addMarker(lat, lng, L)

        setSelectedLocation({
          lat,
          lon: lng,
          address: result.display_name,
        })
      } else {
        alert("Location not found. Please try a different search term.")
      }
    } catch (error) {
      console.error("Error searching location:", error)
      alert("Error searching location. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchLocation()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Select Location</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e: any) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search location..."
              className="flex-1"
            />
            <Button onClick={searchLocation} disabled={isLoading}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="w-full h-full" />
          {isLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
              <div className="bg-white p-4 rounded-lg">Loading...</div>
            </div>
          )}
        </div>

        {/* Selected Location Info */}
        {selectedLocation && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-blue-600 mt-1" />
              <div className="flex-1">
                <p className="font-medium">Selected Location:</p>
                <p className="text-sm text-gray-600">{selectedLocation.address}</p>
                <p className="text-xs text-gray-500">
                  Lat: {selectedLocation.lat.toFixed(6)}, Lon: {selectedLocation.lon.toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t flex justify-between">
          <p className="text-sm text-gray-600">Click on the map to select a location</p>
          <div className="flex gap-2">
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirmLocation} disabled={!selectedLocation}>
              Confirm Location
            </Button>
          </div>
        </div>
      </div>

      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
        integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
        crossOrigin=""
      />
    </Modal>
  )
}
