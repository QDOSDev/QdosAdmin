"use client"

import { useState, useEffect } from "react"
import { X, MapPin } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })

interface LocationChangeModalProps {
  isOpen: boolean
  onClose: () => void
  currentLat: number
  currentLon: number
  currentAddress: string
  gymId: string
  onSubmit: (data: any) => Promise<void>
}

export function LocationChangeModal({
  isOpen,
  onClose,
  currentLat,
  currentLon,
  currentAddress,
  gymId,
  onSubmit,
}: LocationChangeModalProps) {
  const [locationChangeRequest, setLocationChangeRequest] = useState({
    lat: currentLat,
    lon: currentLon,
    description: "",
    address: "",
  })

  const [isMapReady, setIsMapReady] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setLocationChangeRequest({
        lat: currentLat,
        lon: currentLon,
        description: "",
        address: "",
      })
      // Delay map rendering to ensure proper initialization
      const timer = setTimeout(() => setIsMapReady(true), 100)
      return () => clearTimeout(timer)
    } else {
      setIsMapReady(false)
    }
  }, [isOpen, currentLat, currentLon])

  if (!isOpen) return null

  const handleSubmit = async () => {
    try {
      const requestData = {
        gymId,
        currentLat,
        currentLon,
        requestedLat: locationChangeRequest.lat,
        requestedLon: locationChangeRequest.lon,
        description: locationChangeRequest.description,
        currentAddress,
        newAddress: locationChangeRequest.address,
      }

      await onSubmit(requestData)
      onClose()
    } catch (error) {
      console.error("Failed to submit location change request:", error)
    }
  }

  const MapClickHandler = ({ onLocationSelect }: { onLocationSelect: (lat: number, lon: number) => void }) => {
    const { useMapEvents } = require("react-leaflet")

    useMapEvents({
      click: (e: any) => {
        const { lat, lng } = e.latlng
        onLocationSelect(lat, lng)
      },
    })

    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Request Location Change</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Current Location Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Current Location</h3>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Address:</strong> {currentAddress}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Coordinates:</strong> {currentLat.toFixed(6)}, {currentLon.toFixed(6)}
            </p>
          </div>

          {/* New Location Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Select New Location</h3>

            {/* Coordinate Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={locationChangeRequest.lat}
                  onChange={(e) =>
                    setLocationChangeRequest((prev) => ({
                      ...prev,
                      lat: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Enter latitude"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={locationChangeRequest.lon}
                  onChange={(e) =>
                    setLocationChangeRequest((prev) => ({
                      ...prev,
                      lon: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Enter longitude"
                />
              </div>
            </div>

            {/* Interactive Map */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Click on the map to select new coordinates
              </label>
              <div className="w-full h-96 border rounded-lg overflow-hidden relative">
                {isMapReady && typeof window !== "undefined" && (
                  <MapContainer
                    center={[locationChangeRequest.lat || currentLat, locationChangeRequest.lon || currentLon]}
                    zoom={16}
                    scrollWheelZoom={true}
                    style={{ height: "100%", width: "100%", borderRadius: "8px" }}
                    key={`${locationChangeRequest.lat}-${locationChangeRequest.lon}`}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap contributors"
                    />
                    <Marker
                      position={[locationChangeRequest.lat || currentLat, locationChangeRequest.lon || currentLon]}
                      draggable={true}
                      eventHandlers={{
                        dragend: (e:any) => {
                          const marker = e.target
                          const position = marker.getLatLng()
                          setLocationChangeRequest((prev) => ({
                            ...prev,
                            lat: position.lat,
                            lon: position.lng,
                          }))
                        },
                      }}
                    >
                      <Popup>
                        <div className="text-center">
                          <strong>Selected Location</strong>
                          <br />
                          Lat: {locationChangeRequest.lat.toFixed(6)}
                          <br />
                          Lon: {locationChangeRequest.lon.toFixed(6)}
                          <br />
                          <small className="text-gray-600">Click map or drag marker to change</small>
                        </div>
                      </Popup>
                    </Marker>
                    <MapClickHandler
                      onLocationSelect={(lat, lng) => {
                        setLocationChangeRequest((prev) => ({
                          ...prev,
                          lat: lat,
                          lon: lng,
                        }))
                      }}
                    />
                  </MapContainer>
                )}

                {/* Coordinate Overlay */}
                <div className="absolute top-3 left-3 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg p-3 shadow-lg border z-10">
                  <div className="text-xs font-semibold text-gray-700 mb-1">
                    <MapPin className="inline w-3 h-3 mr-1" />
                    Selected Location
                  </div>
                  <div className="text-sm font-mono text-gray-900">Lat: {locationChangeRequest.lat.toFixed(6)}</div>
                  <div className="text-sm font-mono text-gray-900">Lon: {locationChangeRequest.lon.toFixed(6)}</div>
                  <div className="text-xs text-gray-500 mt-1">Click map or drag marker</div>
                </div>
              </div>
            </div>

            {/* Quick Location Actions */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  const coords = `${locationChangeRequest.lat}, ${locationChangeRequest.lon}`
                  navigator.clipboard.writeText(coords)
                }}
                className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
              >
                Copy Coordinates
              </button>
              <button
                type="button"
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps?q=${locationChangeRequest.lat},${locationChangeRequest.lon}`,
                    "_blank",
                  )
                }
                className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
              >
                View in Google Maps
              </button>
              <button
                type="button"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        setLocationChangeRequest((prev) => ({
                          ...prev,
                          lat: position.coords.latitude,
                          lon: position.coords.longitude,
                        }))
                      },
                      () => {
                        console.error("Unable to detect current location")
                      },
                    )
                  }
                }}
                className="px-3 py-1.5 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
              >
                Use Current Location
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">New Address</label>
            <input
              value={locationChangeRequest.address}
              onChange={(e) =>
                setLocationChangeRequest((prev) => ({
                  ...prev,
                  address: e.target.value,
                }))
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter the new address..."
            />
          </div>

          {/* Description Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description/Reason for Location Change
            </label>
            <textarea
              value={locationChangeRequest.description}
              onChange={(e) =>
                setLocationChangeRequest((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              placeholder="Please provide a reason for requesting this location change..."
            />
            <p className="text-xs text-gray-500 mt-1">{locationChangeRequest.description.length}/500 characters</p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!locationChangeRequest.description.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              Submit Request
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
