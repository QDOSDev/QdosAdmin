"use client"

import type React from "react"
import { useState } from "react"
import { MapPin, Upload, Building2, FileText, Camera, ChevronDown, X, Eye } from 'lucide-react'
import MapModal from "./map-modal"
import { message } from "antd"
import axios from "axios"
import Cookies from "js-cookie"

const Button = ({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  type = "button",
  className = "",
  ...props
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: "primary" | "secondary" | "outline" | "ghost"
  type?: "button" | "submit"
  className?: string
}) => {
  const baseClasses =
    "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"

  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-gray-300",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabled ? "cursor-not-allowed" : "cursor-pointer"} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>{children}</div>
)

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4 border-b border-gray-200">{children}</div>
)

const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h2 className={`text-xl font-semibold text-gray-900 ${className}`}>{children}</h2>
)

const CardDescription = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm text-gray-600 mt-1 ${className}`}>{children}</p>
)

const CardContent = ({ children }: { children: React.ReactNode }) => <div className="px-6 py-4">{children}</div>

const Input = ({
  id,
  value,
  onChange,
  placeholder = "",
  type = "text",
  required = false,
  maxLength,
  className = "",
  readOnly = false,
  ...props
}: {
  id?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  type?: string
  required?: boolean
  maxLength?: number
  className?: string
  readOnly?: boolean
}) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    maxLength={maxLength}
    readOnly={readOnly}
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${readOnly ? "bg-gray-50" : ""} ${className}`}
    {...props}
  />
)

const Label = ({
  htmlFor,
  children,
  className = "",
  ...props
}: {
  htmlFor?: string
  children: React.ReactNode
  className?: string
}) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 mb-1 ${className}`} {...props}>
    {children}
  </label>
)

const Textarea = ({
  id,
  value,
  onChange,
  placeholder = "",
  required = false,
  className = "",
  ...props
}: {
  id?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  required?: boolean
  className?: string
}) => (
  <textarea
    id={id}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical ${className}`}
    {...props}
  />
)

const Select = ({
  value,
  onValueChange,
  children,
  placeholder = "Select an option",
}: {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  placeholder?: string
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
      >
        <span className={value ? "text-gray-900" : "text-gray-500"}>{value || placeholder}</span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {children}
        </div>
      )}
    </div>
  )
}

const SelectItem = ({
  value,
  children,
  onSelect,
}: {
  value: string
  children: React.ReactNode
  onSelect: (value: string) => void
}) => (
  <button
    type="button"
    onClick={() => onSelect(value)}
    className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
  >
    {children}
  </button>
)

const Checkbox = ({
  id,
  checked,
  onCheckedChange,
}: {
  id: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) => (
  <input
    id={id}
    type="checkbox"
    checked={checked}
    onChange={(e) => onCheckedChange(e.target.checked)}
    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
  />
)

const Badge = ({
  children,
  variant = "default",
}: {
  children: React.ReactNode
  variant?: "default" | "secondary"
}) => {
  const variantClasses = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800",
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]}`}
    >
      {children}
    </span>
  )
}

// Image Preview Modal Component
const ImagePreviewModal = ({
  isOpen,
  onClose,
  imageUrl,
  imageName,
}: {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  imageName: string
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative max-w-4xl max-h-[90vh] p-4">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>
        <img src={imageUrl || "/placeholder.svg"} alt={imageName} className="max-w-full max-h-full object-contain rounded-lg" />
        <p className="text-white text-center mt-2">{imageName}</p>
      </div>
    </div>
  )
}

const gymTypes = [
  "Commercial Gym",
  "Boutique Fitness",
  "CrossFit Box",
  "Yoga Studio",
  "Martial Arts",
  "Dance Studio",
  "Personal Training",
  "Sports Complex",
]

const amenitiesList = [
  "Cardio Equipment",
  "Weight Training",
  "Group Classes",
  "Personal Training",
  "Locker Rooms",
  "Showers",
  "Parking",
  "Air Conditioning",
  "WiFi",
  "Towel Service",
  "Nutritional Supplements",
  "Juice Bar",
  "Sauna",
  "Steam Room",
  "Swimming Pool",
  "Basketball Court",
  "Yoga Studio",
  "Spinning Room",
]

export default function GymRegistration() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    lat: "",
    lon: "",
    pan: "",
    gst: "",
    license_no: "",
    gymtype: "",
    amenities: [] as string[],
  })

  const endpoint = import.meta.env.VITE_API_LIVEHOST
  const token = Cookies.get("token")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean
    imageUrl: string
    imageName: string
  }>({
    isOpen: false,
    imageUrl: "",
    imageName: "",
  })

  const MAX_IMAGES = 5

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      amenities: checked ? [...prev.amenities, amenity] : prev.amenities.filter((a) => a !== amenity),
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      
      // Check if adding these files would exceed the limit
      if (selectedFiles.length + files.length > MAX_IMAGES) {
        message.error(`You can only upload a maximum of ${MAX_IMAGES} images`)
        return
      }

      // Validate file types and sizes
      const validFiles = files.filter((file) => {
        if (!file.type.startsWith("image/")) {
          message.error(`${file.name} is not a valid image file`)
          return false
        }
        if (file.size > 10 * 1024 * 1024) {
          // 10MB limit
          message.error(`${file.name} is too large. Maximum size is 10MB`)
          return false
        }
        return true
      })

      if (validFiles.length > 0) {
        setSelectedFiles((prev) => [...prev, ...validFiles])

        // Create preview URLs
        const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file))
        setPreviewUrls((prev) => [...prev, ...newPreviewUrls])
      }
    }
  }

  const removeFile = (index: number) => {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(previewUrls[index])

    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const openPreview = (imageUrl: string, imageName: string) => {
    setPreviewModal({
      isOpen: true,
      imageUrl,
      imageName,
    })
  }

  const closePreview = () => {
    setPreviewModal({
      isOpen: false,
      imageUrl: "",
      imageName: "",
    })
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            lat: position.coords.latitude.toString(),
            lon: position.coords.longitude.toString(),
          }))
          message.success("Location detected successfully!")
        },
        (error) => {
          console.error("Error getting location:", error)
          message.error("Unable to get your location. Please enter coordinates manually.")
        },
      )
    } else {
      message.error("Geolocation is not supported by this browser.")
    }
  }

  const handleLocationSelect = (location: { lat: number; lon: number; address: string }) => {
    setFormData((prev) => ({
      ...prev,
      lat: location.lat.toString(),
      lon: location.lon.toString(),
      address: location.address,
    }))
    message.success("Location selected successfully!")
  }

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.name && formData.phone && formData.address
      case 2:
        return formData.lat && formData.lon
      case 3:
        return formData.pan && formData.gst && formData.license_no
      case 4:
        return formData.gymtype
      default:
        return true
    }
  }

  const handleSubmit = async () => {
    if (!token) {
      message.error("Authentication token not found. Please login again.")
      return
    }

    setIsSubmitting(true)

    try {

      const submitData = new FormData()

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "amenities" && Array.isArray(value)) {
        value.forEach((amenity) => {
          submitData.append("amenities", amenity);
        });
      } else {
        submitData.append(key, typeof value === "string" ? value : String(value));
      }
    });


      selectedFiles.forEach((file) => {
        submitData.append("gymphotos", file)
      })

      const response = await axios.post(`${endpoint}/v1/gym/registerGym`, submitData, {
        headers: {
          token: token,
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.success === 1) {
        message.success(response.data.message || "Gym registered successfully!")
        
        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
          lat: "",
          lon: "",
          pan: "",
          gst: "",
          license_no: "",
          gymtype: "",
          amenities: [],
        })
        setSelectedFiles([])
        setPreviewUrls([])
        setCurrentStep(1)
      } else {
        message.error(response.data.message || "Registration failed")
      }
    } catch (error: any) {
      console.error("Registration error:", error)
      if (error.response?.data?.message) {
        message.error(error.response.data.message)
      } else {
        message.error("Something went wrong. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5))
    } else {
      message.warning("Please fill in all required fields before proceeding.")
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSelectChange = (value: string) => {
    handleInputChange("gymtype", value)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Basic Information</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Gym Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter gym name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="gym@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter complete address"
                className="min-h-[100px]"
                required
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Location Coordinates</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lat">Latitude *</Label>
                <Input
                  id="lat"
                  value={formData.lat}
                  onChange={(e) => handleInputChange("lat", e.target.value)}
                  placeholder="40.7128"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lon">Longitude *</Label>
                <Input
                  id="lon"
                  value={formData.lon}
                  onChange={(e) => handleInputChange("lon", e.target.value)}
                  placeholder="-74.0060"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Button variant="outline" onClick={() => setIsMapModalOpen(true)} className="w-full">
                <MapPin className="h-4 w-4 mr-2" />
                Select Location on Map
              </Button>
            </div>

            <div className="space-y-2">
              <Button variant="outline" onClick={getCurrentLocation} className="w-full">
                <MapPin className="h-4 w-4 mr-2" />
                Get Current Location
              </Button>
            </div>

            <p className="text-sm text-gray-500">
              You can select location on map, get your current location automatically, or enter coordinates manually.
            </p>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Legal Information</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pan">PAN Number *</Label>
              <Input
                id="pan"
                value={formData.pan}
                onChange={(e) => handleInputChange("pan", e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                maxLength={10}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gst">GST Number *</Label>
              <Input
                id="gst"
                value={formData.gst}
                onChange={(e) => handleInputChange("gst", e.target.value.toUpperCase())}
                placeholder="22AAAAA0000A1Z5"
                maxLength={15}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_no">License Number *</Label>
              <Input
                id="license_no"
                value={formData.license_no}
                onChange={(e) => handleInputChange("license_no", e.target.value)}
                placeholder="Enter business license number"
                required
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Gym Type & Amenities</h3>
            </div>

            <div className="space-y-2">
              <Label>Gym Type *</Label>
              <Select value={formData.gymtype} onValueChange={handleSelectChange} placeholder="Select gym type">
                {gymTypes.map((type) => (
                  <SelectItem key={type} value={type} onSelect={handleSelectChange}>
                    {type}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Amenities</Label>
              <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {amenitiesList.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onCheckedChange={(checked) => handleAmenityChange(amenity, checked)}
                    />
                    <Label htmlFor={amenity} className="text-sm">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {formData.amenities.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Amenities:</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map((amenity) => (
                    <Badge key={amenity} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Gym Photos</h3>
              <span className="text-sm text-gray-500">
                ({selectedFiles.length}/{MAX_IMAGES} images)
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photos">Upload Gym Photos (Max {MAX_IMAGES})</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  id="photos"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={selectedFiles.length >= MAX_IMAGES}
                />
                <Label htmlFor="photos" className={`cursor-pointer ${selectedFiles.length >= MAX_IMAGES ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {selectedFiles.length >= MAX_IMAGES 
                      ? `Maximum ${MAX_IMAGES} images reached`
                      : "Click to upload gym photos or drag and drop"
                    }
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB each</p>
                </Label>
              </div>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-4">
                <Label>Selected Photos:</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={previewUrls[index] || "/placeholder.svg"}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => openPreview(previewUrls[index], file.name)}
                          className="text-white hover:bg-white hover:bg-opacity-20"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => removeFile(index)}
                          className="text-white hover:bg-white hover:bg-opacity-20"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Gym Registration</CardTitle>
            <CardDescription className="text-center">
              Step {currentStep} of 5: Complete all steps to register your gym
            </CardDescription>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              />
            </div>
          </CardHeader>

          <CardContent>
            {renderStep()}

            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                Previous
              </Button>

              {currentStep < 5 ? (
                <Button onClick={nextStep} disabled={!validateStep(currentStep)}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Registering..." : "Register Gym"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map Modal */}
      <MapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onLocationSelect={handleLocationSelect}
        initialLat={formData.lat ? Number.parseFloat(formData.lat) : undefined}
        initialLon={formData.lon ? Number.parseFloat(formData.lon) : undefined}
      />

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={previewModal.isOpen}
        onClose={closePreview}
        imageUrl={previewModal.imageUrl}
        imageName={previewModal.imageName}
      />
    </div>
  )
}
