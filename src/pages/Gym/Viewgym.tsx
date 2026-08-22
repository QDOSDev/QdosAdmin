"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  X,
  Plus,
  Edit2,
  Save,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Mail,
  FileText,
  Percent,
  CheckCircle2,
  History,
  User,
  Clock,
  Calendar,
  Building2,
  Landmark,
  DollarSign,
} from "lucide-react"
import { useLocation } from "react-router-dom"
import { message } from "antd"
import axios from "axios"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

function ResizeMapOnLoad() {
  const map = useMap()
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize()
    }, 100)
  }, [map])
  return null
}

export default function CustomGymForm() {
  const [isEditing, setIsEditing] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>("basic")
  const [showHistory, setShowHistory] = useState(false)
  const [cloudinaryIds, setCloudinaryIds] = useState<string[]>([])

  const endpoint = import.meta.env.VITE_API_LIVEHOST

  const defaultData = {
    name: "",
    manager: "",
    lat: 0,
    lon: 0,
    address: "",
    building: "",
    area: "",
    landmark: "",
    phone: "",
    email: "",
    pan: "",
    gst: "",
    license_no: "",
    owner: { _id: "", name: "", email: "" },
    earnings: 0,
    commissionPercentage: 0,
    gymtype: "",
    isPendingApproval: "",
    capacity: 0,
    price: 0,
    operationHours: { open: "06:00", close: "22:00" },
    nonworkingDays: [] as string[],
    consent1: false,
    consent2: false,
    consent3: false,
    signature: "",
    isActive: true,
  }

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const businessAddressRef = useRef<HTMLInputElement | null>(null)
  const businessRegistrationRef = useRef<HTMLInputElement | null>(null)
  const validIdproofRef = useRef<HTMLInputElement | null>(null)

  const removeSelectedImage = (index: number) => {
    const updatedFiles = [...newFiles]
    const updatedPreviews = [...filePreviews]

    updatedFiles.splice(index, 1)
    URL.revokeObjectURL(updatedPreviews[index])
    updatedPreviews.splice(index, 1)

    setNewFiles(updatedFiles)
    setFilePreviews(updatedPreviews)

    if (updatedFiles.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const [formData, setFormData] = useState(defaultData)
  const [amenities, setAmenities] = useState<string[]>([])
  const [standardEquipments, setStandardEquipments] = useState<string[]>([])
  const [cleanliness, setCleanliness] = useState<string[]>([])
  const [amenityInput, setAmenityInput] = useState("")
  const [equipmentInput, setEquipmentInput] = useState("")
  const [cleanlinessInput, setCleanlinessInput] = useState("")
  const [photos, setPhotos] = useState<string[]>([])
  const [businessAddressDocs, setBusinessAddressDocs] = useState<string[]>([])
  const [businessRegistrationDocs, setBusinessRegistrationDocs] = useState<string[]>([])
  const [validIdproofDocs, setValidIdproofDocs] = useState<string[]>([])

  const location = useLocation()
  const { gymData } = location.state || {}

  useEffect(() => {
    if (gymData) {
      setFormData({
        name: gymData.name || "",
        manager: gymData.manager || "",
        lat: gymData?.location?.coordinates?.[1] || 0,
        lon: gymData?.location?.coordinates?.[0] || 0,
        address: gymData.address || "",
        building: gymData.building || "",
        area: gymData.area || "",
        landmark: gymData.landmark || "",
        phone: gymData.phone || "",
        email: gymData.email || "",
        pan: gymData.pan || "",
        gst: gymData.gst || "",
        license_no: gymData.license_no || "",
        owner: gymData.owner || { _id: "", name: "", email: "" },
        earnings: gymData.earnings || 0,
        commissionPercentage: gymData.commissionPercentage || 20,
        gymtype: gymData.gymtype || "gym",
        isPendingApproval: gymData.isPendingApproval || "pending",
        capacity: gymData.capacity || 0,
        price: gymData.price || 0,
        operationHours: gymData.operationHours || { open: "06:00", close: "22:00" },
        nonworkingDays: gymData.nonworkingDays || [],
        consent1: gymData.consent1 || false,
        consent2: gymData.consent2 || false,
        consent3: gymData.consent3 || false,
        signature: gymData.signature || "",
        isActive: gymData.isActive !== undefined ? gymData.isActive : true,
      })

      setPhotos(gymData.gymphotos || [])
      setAmenities(gymData.amenities || [])
      setStandardEquipments(gymData.standardEquipments || [])
      setCleanliness(gymData.cleanliness || [])
      setBusinessAddressDocs(gymData.businessAddress || [])
      setBusinessRegistrationDocs(gymData.businessRegistration || [])
      setValidIdproofDocs(gymData.validIdproof || [])
      setCloudinaryIds(gymData.cloudinary_public_id || [])
    }
  }, [gymData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else if (name === "lat" || name === "lon") {
      const numValue = Number.parseFloat(value)
      if (!isNaN(numValue)) {
        setFormData((prev) => ({ ...prev, [name]: numValue }))
      }
    } else if (name === "capacity" || name === "price" || name === "earnings" || name === "commissionPercentage") {
      const numValue = Number.parseFloat(value)
      setFormData((prev) => ({ ...prev, [name]: isNaN(numValue) ? 0 : numValue }))
    } else if (name.startsWith("operationHours.")) {
      const field = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        operationHours: { ...prev.operationHours, [field]: value },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const [newFiles, setNewFiles] = useState<File[]>([])
  const [filePreviews, setFilePreviews] = useState<string[]>([])
  const [newBusinessAddressFiles, setNewBusinessAddressFiles] = useState<File[]>([])
  const [newBusinessRegistrationFiles, setNewBusinessRegistrationFiles] = useState<File[]>([])
  const [newValidIdproofFiles, setNewValidIdproofFiles] = useState<File[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const selected = Array.from(files)
    const maxAllowed = 5 - photos.length - newFiles.length
    const filtered = selected.slice(0, maxAllowed)

    const newPreviews = filtered.map((file) => URL.createObjectURL(file))

    setNewFiles((prev) => [...prev, ...filtered])
    setFilePreviews((prev) => [...prev, ...newPreviews])

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDocumentChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "businessAddress" | "businessRegistration" | "validIdproof",
  ) => {
    const files = e.target.files
    if (!files) return

    const selected = Array.from(files)

    if (type === "businessAddress") {
      setNewBusinessAddressFiles((prev) => [...prev, ...selected])
    } else if (type === "businessRegistration") {
      setNewBusinessRegistrationFiles((prev) => [...prev, ...selected])
    } else if (type === "validIdproof") {
      setNewValidIdproofFiles((prev) => [...prev, ...selected])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const form = new FormData()
      form.append("gymId", gymData?._id)
      form.append("name", formData.name)
      form.append("manager", formData.manager)
      form.append("lat", formData.lat.toString())
      form.append("lon", formData.lon.toString())
      form.append("address", formData.address)
      form.append("building", formData.building)
      form.append("area", formData.area)
      form.append("landmark", formData.landmark)
      form.append("phone", formData.phone)
      form.append("email", formData.email)
      form.append("pan", formData.pan)
      form.append("gst", formData.gst)
      form.append("license_no", formData.license_no)
      form.append("gymtype", formData.gymtype)
      form.append("isPendingApproval", formData.isPendingApproval)
      form.append("capacity", formData.capacity.toString())
      form.append("price", formData.price.toString())
      form.append("consent1", formData.consent1.toString())
      form.append("consent2", formData.consent2.toString())
      form.append("consent3", formData.consent3.toString())
      form.append("signature", formData.signature)
      form.append("isActive", formData.isActive.toString())

      // Operation hours
      form.append("operationHours[open]", formData.operationHours.open)
      form.append("operationHours[close]", formData.operationHours.close)

      // Arrays
      if (amenities.length > 0) {
        amenities.forEach((amenity) => {
          form.append("amenities", amenity)
        })
      }

      if (standardEquipments.length > 0) {
        standardEquipments.forEach((equipment) => {
          form.append("standardEquipments", equipment)
        })
      }

      if (cleanliness.length > 0) {
        cleanliness.forEach((item) => {
          form.append("cleanliness", item)
        })
      }

      if (formData.nonworkingDays.length > 0) {
        formData.nonworkingDays.forEach((day) => {
          form.append("nonworkingDays", day)
        })
      }

      // Files
      newFiles.forEach((file) => {
        form.append("gymphotos", file)
      })

      newBusinessAddressFiles.forEach((file) => {
        form.append("businessAddress", file)
      })

      newBusinessRegistrationFiles.forEach((file) => {
        form.append("businessRegistration", file)
      })

      newValidIdproofFiles.forEach((file) => {
        form.append("validIdproof", file)
      })

      const { data } = await axios.post(`${endpoint}/v1/admin/edit/editGym`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (data.success) {
        message.success("Gym updated successfully.")
        setIsEditing(false)
        // Clear new files
        setNewFiles([])
        setFilePreviews([])
        setNewBusinessAddressFiles([])
        setNewBusinessRegistrationFiles([])
        setNewValidIdproofFiles([])
      } else {
        message.error(data.message || "Failed to update gym.")
      }
    } catch (err) {
      console.error(err)
      message.error("Something went wrong while updating the gym.")
    }
  }

  const addAmenity = () => {
    if (amenityInput.trim() !== "" && !amenities.includes(amenityInput.trim())) {
      setAmenities([...amenities, amenityInput.trim()])
      setAmenityInput("")
    }
  }

  const removeAmenity = (amenity: string) => {
    setAmenities(amenities.filter((a) => a !== amenity))
  }

  const addEquipment = () => {
    if (equipmentInput.trim() !== "" && !standardEquipments.includes(equipmentInput.trim())) {
      setStandardEquipments([...standardEquipments, equipmentInput.trim()])
      setEquipmentInput("")
    }
  }

  const removeEquipment = (equipment: string) => {
    setStandardEquipments(standardEquipments.filter((e) => e !== equipment))
  }

  const addCleanliness = () => {
    if (cleanlinessInput.trim() !== "" && !cleanliness.includes(cleanlinessInput.trim())) {
      setCleanliness([...cleanliness, cleanlinessInput.trim()])
      setCleanlinessInput("")
    }
  }

  const removeCleanliness = (item: string) => {
    setCleanliness(cleanliness.filter((c) => c !== item))
  }

  const toggleNonworkingDay = (day: string) => {
    setFormData((prev) => {
      const days = prev.nonworkingDays.includes(day)
        ? prev.nonworkingDays.filter((d) => d !== day)
        : [...prev.nonworkingDays, day]
      return { ...prev, nonworkingDays: days }
    })
  }

  const removePhoto = async (photo: string) => {
    const index = photos.findIndex((p) => p === photo)
    if (index === -1) return

    const imageIds = [cloudinaryIds[index]]
    const gymId = gymData?._id

    const body = {
      imageIds,
      gymId,
    }

    if (isEditing && gymId && imageIds) {
      try {
        const { data } = await axios.delete(`${endpoint}/v1/admin/edit/gymPic`, { data: body })

        if (data.success) {
          message.success("Image deleted successfully")
          setPhotos((prev) => prev.filter((_, i) => i !== index))
          setCloudinaryIds((prev) => prev.filter((_, i) => i !== index))
        } else {
          message.error(data.message || "Failed to delete image")
        }
      } catch (err) {
        message.error("Something went wrong while deleting image")
      }
    }
  }

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const gymTypeOptions = {
    gym: "Fitness Gym",
    yoga: "Yoga Studio",
    crossfit: "CrossFit Box",
    pilates: "Pilates Studio",
    dance: "Dance Studio",
    "martial arts": "Martial Arts",
    other: "Other",
  }

  const approvalStatusOptions = {
    pending: "Pending Approval",
    approved: "Approved",
    rejected: "Rejected",
  }

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-[#071d3f] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">{formData.name}</h1>
              <p className="mt-2 text-blue-100 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {formData.address}
              </p>
              {formData.owner && formData.owner.name && (
                <p className="mt-2 text-blue-200 flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Owner: {formData.owner.name}
                </p>
              )}
            </div>
            <div className="mt-4 md:mt-0 flex gap-2">
              {gymData?.previousNames && gymData.previousNames.length > 0 && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="px-5 py-2.5 rounded-lg font-medium flex items-center transition-all bg-blue-800 text-white hover:bg-blue-700"
                >
                  <History className="h-4 w-4 mr-2" /> History
                </button>
              )}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-5 py-2.5 rounded-lg font-medium flex items-center transition-all ${
                  isEditing ? "bg-white text-blue-700 hover:bg-gray-100" : "bg-blue-600 text-white hover:bg-blue-500"
                }`}
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4 mr-2" /> Cancel
                  </>
                ) : (
                  <>
                    <Edit2 className="h-4 w-4 mr-2" /> Edit Gym
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white shadow-md">
          <span
            className={`inline-block w-3 h-3 rounded-full mr-2 ${
              formData.isPendingApproval === "approved"
                ? "bg-green-500"
                : formData.isPendingApproval === "rejected"
                  ? "bg-red-500"
                  : "bg-yellow-500"
            }`}
          ></span>
          <span className="text-sm font-medium text-gray-700">
            {approvalStatusOptions[formData.isPendingApproval as keyof typeof approvalStatusOptions]}
          </span>
          <span className="ml-3 text-gray-300">|</span>
          <span className={`ml-3 text-sm font-medium ${formData.isActive ? "text-green-600" : "text-red-600"}`}>
            {formData.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* History Modal */}
      {showHistory && gymData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Gym History</h2>
                <button onClick={() => setShowHistory(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {gymData.previousNames && gymData.previousNames.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Previous Names</h3>
                  <div className="space-y-3">
                    {gymData.previousNames.map((item: any) => (
                      <div key={item._id} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-800 font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">Changed on {formatDate(item.changedAt)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {gymData.previousAddresses && gymData.previousAddresses.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Previous Addresses</h3>
                  <div className="space-y-3">
                    {gymData.previousAddresses.map((item: any) => (
                      <div key={item._id} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-800 font-medium">{item.address}</p>
                        <p className="text-sm text-gray-500">Changed on {formatDate(item.changedAt)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!gymData.previousNames || gymData.previousNames.length === 0) &&
                (!gymData.previousAddresses || gymData.previousAddresses.length === 0) && (
                  <p className="text-gray-500 italic">No history records available.</p>
                )}
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowHistory(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          <div className="mb-8">
            <div
              className="flex items-center justify-between bg-white rounded-t-xl px-6 py-4 cursor-pointer"
              onClick={() => toggleSection("basic")}
            >
              <h2 className="text-xl font-bold text-gray-800">Basic Information</h2>
              <button type="button" className="text-gray-500">
                {activeSection === "basic" ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>

            {activeSection === "basic" && (
              <div className="bg-white rounded-b-xl shadow-sm p-6 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Gym Name</label>
                      {isEditing && <span className="text-xs text-blue-600">Required</span>}
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    ) : (
                      <p className="text-gray-900 py-2.5">{formData.name}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Manager Name</label>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="manager"
                        value={formData.manager}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    ) : (
                      <p className="text-gray-900 py-2.5 flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        {formData.manager || "Not specified"}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Gym Type</label>
                    </div>
                    {isEditing ? (
                      <select
                        name="gymtype"
                        value={formData.gymtype}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none bg-white"
                      >
                        <option value="gym">Fitness Gym</option>
                        <option value="yoga">Yoga Studio</option>
                        <option value="crossfit">CrossFit Box</option>
                        <option value="pilates">Pilates Studio</option>
                        <option value="dance">Dance Studio</option>
                        <option value="martial arts">Martial Arts</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 py-2.5">
                        {gymTypeOptions[formData.gymtype as keyof typeof gymTypeOptions] || formData.gymtype}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                    </div>
                    {isEditing ? (
                      <label className="flex items-center cursor-pointer py-2.5">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleChange}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-700">Active</span>
                      </label>
                    ) : (
                      <p className={`py-2.5 font-medium ${formData.isActive ? "text-green-600" : "text-red-600"}`}>
                        {formData.isActive ? "Active" : "Inactive"}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Building</label>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="building"
                        value={formData.building}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    ) : (
                      <p className="text-gray-900 py-2.5 flex items-center">
                        <Building2 className="h-4 w-4 mr-2 text-gray-500" />
                        {formData.building || "Not specified"}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Area</label>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="area"
                        value={formData.area}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    ) : (
                      <p className="text-gray-900 py-2.5">{formData.area || "Not specified"}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Landmark</label>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="landmark"
                        value={formData.landmark}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    ) : (
                      <p className="text-gray-900 py-2.5 flex items-center">
                        <Landmark className="h-4 w-4 mr-2 text-gray-500" />
                        {formData.landmark || "Not specified"}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2 mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Map Location</h3>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const coords = `${formData.lat}, ${formData.lon}`
                            navigator.clipboard.writeText(coords)
                            message.success("Coordinates copied to clipboard!")
                          }}
                          className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                        >
                          Copy Coordinates
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            window.open(`https://www.google.com/maps?q=${formData.lat},${formData.lon}`, "_blank")
                          }
                          className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                        >
                          Open in Google Maps
                        </button>
                      </div>
                    </div>

                    <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Exact Coordinates</label>
                          <p className="text-sm font-mono text-gray-900">
                            {formData.lat.toFixed(6)}, {formData.lon.toFixed(6)}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">DMS Format</label>
                          <p className="text-sm text-gray-900">
                            {Math.abs(formData.lat).toFixed(4)}° {formData.lat >= 0 ? "N" : "S"},{" "}
                            {Math.abs(formData.lon).toFixed(4)}° {formData.lon >= 0 ? "E" : "W"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {formData.lat !== 0 && formData.lon !== 0 && (
                      <div className="h-64 rounded-lg overflow-hidden border border-gray-200">
                        <MapContainer
                          center={[formData.lat, formData.lon]}
                          zoom={15}
                          style={{ height: "100%", width: "100%" }}
                        >
                          <ResizeMapOnLoad />
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          />
                          <Marker position={[formData.lat, formData.lon]}>
                            <Popup>{formData.name}</Popup>
                          </Marker>
                        </MapContainer>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    ) : (
                      <p className="text-gray-900 py-2.5">{formData.address}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Latitude</label>
                    </div>
                    {isEditing ? (
                      <input
                        type="number"
                        step="any"
                        name="lat"
                        value={formData.lat}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    ) : (
                      <p className="text-gray-900 py-2.5">{formData.lat}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Longitude</label>
                    </div>
                    {isEditing ? (
                      <input
                        type="number"
                        step="any"
                        name="lon"
                        value={formData.lon}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    ) : (
                      <p className="text-gray-900 py-2.5">{formData.lon}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    ) : (
                      <p className="text-gray-900 py-2.5 flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        {formData.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    </div>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    ) : (
                      <p className="text-gray-900 py-2.5 flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        {formData.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Owner Information Section */}
          <div className="mb-8">
            <div
              className="flex items-center justify-between bg-white rounded-t-xl px-6 py-4 cursor-pointer"
              onClick={() => toggleSection("owner")}
            >
              <h2 className="text-xl font-bold text-gray-800">Owner Information</h2>
              <button type="button" className="text-gray-500">
                {activeSection === "owner" ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>

            {activeSection === "owner" && (
              <div className="bg-white rounded-b-xl shadow-sm p-6 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Owner Name</label>
                    </div>
                    <p className="text-gray-900 py-2.5 flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      {formData.owner?.name || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Owner Email</label>
                    </div>
                    <p className="text-gray-900 py-2.5 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      {formData.owner?.email || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Owner ID</label>
                    </div>
                    <p className="text-gray-900 py-2.5 font-mono text-sm">{formData.owner?._id || "Not specified"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Business Details Section */}
          <div className="mb-8">
            <div
              className="flex items-center justify-between bg-white rounded-t-xl px-6 py-4 cursor-pointer"
              onClick={() => toggleSection("business")}
            >
              <h2 className="text-xl font-bold text-gray-800">Business Details</h2>
              <button type="button" className="text-gray-500">
                {activeSection === "business" ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>

            {activeSection === "business" && (
              <div className="bg-white rounded-b-xl shadow-sm p-6 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">PAN Number</label>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="pan"
                        value={formData.pan}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    ) : (
                      <p className="text-gray-900 py-2.5 flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                        {formData.pan}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">GST Number</label>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="gst"
                        value={formData.gst}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    ) : (
                      <p className="text-gray-900 py-2.5 flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                        {formData.gst}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">License Number</label>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="license_no"
                        value={formData.license_no}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    ) : (
                      <p className="text-gray-900 py-2.5 flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                        {formData.license_no}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Earnings</label>
                    </div>
                    <p className="text-gray-900 py-2.5 flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-500" />₹{formData.earnings.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Commission Percentage</label>
                    </div>
                    {isEditing ? (
                      <input
                        type="number"
                        name="commissionPercentage"
                        value={formData.commissionPercentage}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    ) : (
                      <p className="text-gray-900 py-2.5 flex items-center">
                        <Percent className="h-4 w-4 mr-2 text-gray-500" />
                        {formData.commissionPercentage}%
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Approval Status</label>
                    </div>
                    {isEditing ? (
                      <select
                        name="isPendingApproval"
                        value={formData.isPendingApproval}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none bg-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 py-2.5">
                        {approvalStatusOptions[formData.isPendingApproval as keyof typeof approvalStatusOptions]}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Capacity</label>
                    </div>
                    {isEditing ? (
                      <input
                        type="number"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    ) : (
                      <p className="text-gray-900 py-2.5">{formData.capacity} people</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Price (Monthly)</label>
                    </div>
                    {isEditing ? (
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    ) : (
                      <p className="text-gray-900 py-2.5 flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-gray-500" />₹{formData.price.toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Signature</label>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="signature"
                        value={formData.signature}
                        onChange={handleChange}
                        placeholder="Digital signature or authorized person name"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    ) : (
                      <p className="text-gray-900 py-2.5 italic">{formData.signature || "Not provided"}</p>
                    )}
                  </div>

                  <div className="md:col-span-2 mt-4">
                    <h3 className="text-md font-medium text-gray-800 mb-3">Consents & Agreements</h3>
                    <div className="space-y-3">
                      <label className="flex items-start cursor-pointer">
                        <input
                          type="checkbox"
                          name="consent1"
                          checked={formData.consent1}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                        />
                        <span className="ml-3 text-sm text-gray-700">
                          I agree to the terms and conditions of the platform
                        </span>
                      </label>
                      <label className="flex items-start cursor-pointer">
                        <input
                          type="checkbox"
                          name="consent2"
                          checked={formData.consent2}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                        />
                        <span className="ml-3 text-sm text-gray-700">
                          I confirm that all information provided is accurate and up-to-date
                        </span>
                      </label>
                      <label className="flex items-start cursor-pointer">
                        <input
                          type="checkbox"
                          name="consent3"
                          checked={formData.consent3}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                        />
                        <span className="ml-3 text-sm text-gray-700">
                          I authorize the platform to process payments and handle member data
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-8">
            <div
              className="flex items-center justify-between bg-white rounded-t-xl px-6 py-4 cursor-pointer"
              onClick={() => toggleSection("schedule")}
            >
              <h2 className="text-xl font-bold text-gray-800">Operation Hours & Schedule</h2>
              <button type="button" className="text-gray-500">
                {activeSection === "schedule" ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>

            {activeSection === "schedule" && (
              <div className="bg-white rounded-b-xl shadow-sm p-6 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Opening Time</label>
                    </div>
                    {isEditing ? (
                      <input
                        type="time"
                        name="operationHours.open"
                        value={formData.operationHours.open}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    ) : (
                      <p className="text-gray-900 py-2.5 flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        {formData.operationHours.open}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Closing Time</label>
                    </div>
                    {isEditing ? (
                      <input
                        type="time"
                        name="operationHours.close"
                        value={formData.operationHours.close}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    ) : (
                      <p className="text-gray-900 py-2.5 flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        {formData.operationHours.close}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">Non-Working Days</label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {weekDays.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => isEditing && toggleNonworkingDay(day)}
                          disabled={!isEditing}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            formData.nonworkingDays.includes(day)
                              ? "bg-red-100 text-red-700 border-2 border-red-300"
                              : "bg-green-100 text-green-700 border-2 border-green-300"
                          } ${isEditing ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
                        >
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {day}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {isEditing ? "Click to toggle working/non-working days" : "Green = Working, Red = Non-working"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Features & Media Section */}
          <div className="mb-8">
            <div
              className="flex items-center justify-between bg-white rounded-t-xl px-6 py-4 cursor-pointer"
              onClick={() => toggleSection("features")}
            >
              <h2 className="text-xl font-bold text-gray-800">Features & Media</h2>
              <button type="button" className="text-gray-500">
                {activeSection === "features" ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>

            {activeSection === "features" && (
              <div className="bg-white rounded-b-xl shadow-sm p-6 border-t border-gray-100">
                {/* Amenities */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-800">Amenities</h3>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {amenities.map((amenity, index) => (
                      <div
                        key={index}
                        className={`px-3 py-1.5 rounded-full flex items-center ${isEditing ? "bg-blue-100" : "bg-gray-100"}`}
                      >
                        <CheckCircle2 className={`h-4 w-4 mr-1.5 ${isEditing ? "text-blue-600" : "text-gray-500"}`} />
                        <span className={`text-sm ${isEditing ? "text-blue-800" : "text-gray-700"}`}>{amenity}</span>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => removeAmenity(amenity)}
                            className="ml-1.5 text-blue-500 hover:text-blue-700"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    {amenities.length === 0 && <p className="text-gray-500 text-sm italic">No amenities added yet.</p>}
                  </div>

                  {isEditing && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={amenityInput}
                        onChange={(e) => setAmenityInput(e.target.value)}
                        placeholder="Add an amenity (e.g., WiFi, Parking, Locker)"
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAmenity())}
                      />
                      <button
                        type="button"
                        onClick={addAmenity}
                        className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1.5" /> Add
                      </button>
                    </div>
                  )}
                </div>

                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-800">Standard Equipments</h3>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {standardEquipments.map((equipment, index) => (
                      <div
                        key={index}
                        className={`px-3 py-1.5 rounded-full flex items-center ${isEditing ? "bg-green-100" : "bg-gray-100"}`}
                      >
                        <CheckCircle2 className={`h-4 w-4 mr-1.5 ${isEditing ? "text-green-600" : "text-gray-500"}`} />
                        <span className={`text-sm ${isEditing ? "text-green-800" : "text-gray-700"}`}>{equipment}</span>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => removeEquipment(equipment)}
                            className="ml-1.5 text-green-500 hover:text-green-700"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    {standardEquipments.length === 0 && (
                      <p className="text-gray-500 text-sm italic">No equipment added yet.</p>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={equipmentInput}
                        onChange={(e) => setEquipmentInput(e.target.value)}
                        placeholder="Add equipment (e.g., Treadmill, Dumbbells, Bench Press)"
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addEquipment())}
                      />
                      <button
                        type="button"
                        onClick={addEquipment}
                        className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1.5" /> Add
                      </button>
                    </div>
                  )}
                </div>

                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-800">Cleanliness Standards</h3>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {cleanliness.map((item, index) => (
                      <div
                        key={index}
                        className={`px-3 py-1.5 rounded-full flex items-center ${isEditing ? "bg-purple-100" : "bg-gray-100"}`}
                      >
                        <CheckCircle2 className={`h-4 w-4 mr-1.5 ${isEditing ? "text-purple-600" : "text-gray-500"}`} />
                        <span className={`text-sm ${isEditing ? "text-purple-800" : "text-gray-700"}`}>{item}</span>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => removeCleanliness(item)}
                            className="ml-1.5 text-purple-500 hover:text-purple-700"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    {cleanliness.length === 0 && (
                      <p className="text-gray-500 text-sm italic">No cleanliness standards added yet.</p>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={cleanlinessInput}
                        onChange={(e) => setCleanlinessInput(e.target.value)}
                        placeholder="Add cleanliness standard (e.g., Daily sanitization, Deep cleaning weekly)"
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCleanliness())}
                      />
                      <button
                        type="button"
                        onClick={addCleanliness}
                        className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1.5" /> Add
                      </button>
                    </div>
                  )}
                </div>

                {/* Photos */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-800">Gym Photos</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative group overflow-hidden rounded-lg border border-gray-200">
                        <div className="aspect-video bg-gray-100">
                          <img
                            src={photo || "/placeholder.svg"}
                            alt={`Gym Photo ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src =
                                "https://via.placeholder.com/300x200?text=Image+Not+Found"
                            }}
                          />
                        </div>
                        {isEditing && (
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => removePhoto(photo)}
                              className="opacity-0 group-hover:opacity-100 bg-white rounded-full p-1.5 shadow-lg hover:bg-red-50 transition-all duration-300"
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {isEditing && (
                    <>
                      <div className="mb-4">
                        <label htmlFor="photoUpload" className="block text-sm font-medium text-gray-700 mb-2">
                          Upload gym photos (max 5 total)
                        </label>

                        {photos.length + newFiles.length < 5 && (
                          <input
                            type="file"
                            id="photoUpload"
                            accept="image/*"
                            ref={fileInputRef}
                            multiple
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700
                   hover:file:bg-blue-100"
                          />
                        )}
                      </div>

                      {filePreviews.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {filePreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              <img
                                src={preview || "/placeholder.svg"}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-md"
                              />
                              <button
                                type="button"
                                onClick={() => removeSelectedImage(index)}
                                className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-1 shadow hover:bg-red-50"
                                title="Remove"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-800">Business Documents</h3>
                  </div>

                  <div className="space-y-6">
                    {/* Business Address Proof */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Address Proof</label>
                      {businessAddressDocs.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-2">
                          {businessAddressDocs.map((doc, index) => (
                            <a
                              key={index}
                              href={doc}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline flex items-center"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Document {index + 1}
                            </a>
                          ))}
                        </div>
                      )}
                      {isEditing && (
                        <input
                          type="file"
                          ref={businessAddressRef}
                          accept="image/*,.pdf"
                          multiple
                          onChange={(e) => handleDocumentChange(e, "businessAddress")}
                          className="block w-full text-sm text-gray-500
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-gray-50 file:text-gray-700
                     hover:file:bg-gray-100"
                        />
                      )}
                      {newBusinessAddressFiles.length > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          {newBusinessAddressFiles.length} new file(s) selected
                        </p>
                      )}
                    </div>

                    {/* Business Registration */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Registration</label>
                      {businessRegistrationDocs.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-2">
                          {businessRegistrationDocs.map((doc, index) => (
                            <a
                              key={index}
                              href={doc}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline flex items-center"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Document {index + 1}
                            </a>
                          ))}
                        </div>
                      )}
                      {isEditing && (
                        <input
                          type="file"
                          ref={businessRegistrationRef}
                          accept="image/*,.pdf"
                          multiple
                          onChange={(e) => handleDocumentChange(e, "businessRegistration")}
                          className="block w-full text-sm text-gray-500
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-gray-50 file:text-gray-700
                     hover:file:bg-gray-100"
                        />
                      )}
                      {newBusinessRegistrationFiles.length > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          {newBusinessRegistrationFiles.length} new file(s) selected
                        </p>
                      )}
                    </div>

                    {/* Valid ID Proof */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Valid ID Proof</label>
                      {validIdproofDocs.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-2">
                          {validIdproofDocs.map((doc, index) => (
                            <a
                              key={index}
                              href={doc}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline flex items-center"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Document {index + 1}
                            </a>
                          ))}
                        </div>
                      )}
                      {isEditing && (
                        <input
                          type="file"
                          ref={validIdproofRef}
                          accept="image/*,.pdf"
                          multiple
                          onChange={(e) => handleDocumentChange(e, "validIdproof")}
                          className="block w-full text-sm text-gray-500
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-gray-50 file:text-gray-700
                     hover:file:bg-gray-100"
                        />
                      )}
                      {newValidIdproofFiles.length > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          {newValidIdproofFiles.length} new file(s) selected
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          {isEditing && (
            <div className="flex justify-end mt-8 gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  setNewFiles([])
                  setFilePreviews([])
                  setNewBusinessAddressFiles([])
                  setNewBusinessRegistrationFiles([])
                  setNewValidIdproofFiles([])
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition flex items-center shadow-lg"
              >
                <Save className="h-5 w-5 mr-2" /> Save All Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
