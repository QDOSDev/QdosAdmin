"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Camera,
  Edit3,
  Save,
  X,
  User,
  Mail,
  Shield,
  Wallet,
  Calendar,
  Phone,
  CheckCircle,
  XCircle,
  ChevronDown,
} from "lucide-react"
import { message } from "antd"
import axios from "axios"
import Cookies from "js-cookie"
import { useSelector, useDispatch } from "react-redux"
import type { IRootState, AppDispatch } from "../store"
import {profile as fetchProfile} from "../store/customerConfigSlice"


const Card = ({ children, className = "" }: any) => (
  <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 ${className}`}>{children}</div>
)


const CardHeader = ({ children, className = "" }: any) => (
  <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>{children}</div>
)

const CardTitle = ({ children, className = "" }: any) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>
)

const CardContent = ({ children, className = "" }: any) => <div className={`px-6 py-4 ${className}`}>{children}</div>

const Input = ({ className = "", type = "text", ...props }) => (
  <input
    type={type}
    className={`w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500 ${className}`}
    {...props}
  />
)

const Label = ({ children, className = "", htmlFor, ...props }: any) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 mb-1 ${className}`} {...props}>
    {children}
  </label>
)


const Badge = ({ children, className = "" }: any) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${className}`}>{children}</span>
)

const PrimaryButton = ({ children, onClick, disabled = false, className = "" }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${className}`}
  >
    {children}
  </button>
)

const SecondaryButton = ({ children, onClick, className = "" }: any) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 ${className}`}
  >
    {children}
  </button>
)

const IconButton = ({ children, onClick, className = "" }: any) => (
  <button
    onClick={onClick}
    className={`p-3 bg-white text-gray-600 rounded-full shadow-md hover:shadow-lg hover:text-blue-600 transition-all duration-200 ${className}`}
  >
    {children}
  </button>
)

const ReadOnlyField = ({ label, value, icon: Icon }: any) => (
  <div className="space-y-2">
    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </Label>
    <div className="p-3 bg-gray-50 rounded-xl border-2 border-gray-100 text-gray-600">{value || "Not provided"}</div>
  </div>
)

const CustomSelect = ({ value, onValueChange, placeholder, options, className = "" }: any) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectedOption = options.find((opt: any) => opt.value === value)

  const handleSelect = (optionValue: any) => {
    onValueChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 text-left bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 flex items-center justify-between ${className}`}
      >
        <span className="text-gray-900">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
            <div className="py-1">
              {options.map((option: any) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className="w-full px-4 py-2 text-left text-gray-900 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors duration-150"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  interface Profile {
    name?: string
    phone?: string
    gender?: string
    dob?: string
    profileImage?: string
    avatar?: string
    email?: string
    role?: string
    emailVerified?: boolean
    wallet?: number
    createdAt?: string
    updatedAt?: string
  }

  const profile = useSelector((state: IRootState) => state.customerConfig.profileData) as Profile
  const dispatch: AppDispatch = useDispatch()

  console.log("Profile from Redux:", profile)

  // Initialize form data with actual profile data
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    phone: profile?.phone || "",
    gender: profile?.gender || "",
    dob: profile?.dob || "",
  })

  // Add this useEffect to update formData when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        gender: profile.gender || "",
        dob: profile.dob || "",
      })
    }
  }, [profile])

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Transgender", label: "Transgender" },
  ]

  const handleInputChange = (field: any, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const endpoint = import.meta.env.VITE_API_LIVEHOST
  const token = Cookies.get("token")

  const updateProfile = async () => {
    try {
      setIsLoading(true)

      // Create FormData for file upload
      const formDataToSend = new FormData()
      formDataToSend.append("name", formData.name)
      formDataToSend.append("phone", formData.phone || "")
      formDataToSend.append("gender", formData.gender || "")
      formDataToSend.append("dob", formData.dob || "")

      // Add profile image if selected
      if (selectedFile) {
        formDataToSend.append("profileImage", selectedFile)
      }

      const { data } = await axios.put(`${endpoint}/v1/auth/update`, formDataToSend, {
        headers: {
          token: token,
          "Content-Type": "multipart/form-data",
        },
      })

      if (data.success === 1) {
        message.success(data.message || "Profile updated successfully")
        dispatch(fetchProfile())

        // Update Redux state with new data
        // You might need to fetch the updated profile or update the Redux state here
        // dispatch(updateProfileData(updatedData));

        setIsEditing(false)
        setImagePreview(null)
        setSelectedFile(null)

        // Optionally refresh the profile data
        // await fetchUpdatedProfile();
      } else {
        message.error(data.message || "Failed to update profile")
      }
    } catch (error: any) {
      console.error("Update profile error:", error)
      message.error(error.response?.data?.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0]
    if (file) {
      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        message.error("File size should be less than 5MB")
        return
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        message.error("Please select a valid image file")
        return
      }

      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target) {
          setImagePreview(typeof event.target.result === "string" ? event.target.result : null)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    // Validate required fields
    if (!formData.name.trim()) {
      message.error("Name is required")
      return
    }

    updateProfile()
  }

  const handleCancel = () => {
    // Reset form data to current profile data
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        gender: profile.gender || "",
        dob: profile.dob || "",
      })
    }
    setIsEditing(false)
    setImagePreview(null)
    setSelectedFile(null)
  }

  const getRoleBadgeColor = (role: any) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "gym_owner":
        return "bg-purple-100 text-purple-800"
      case "user":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Not provided"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return "Invalid date"
    }
  }

  // Add this function before the return statement
  const handleEditClick = () => {
    // Ensure form data is populated with current profile data when entering edit mode
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        gender: profile.gender || "",
        dob: profile.dob || "",
      })
    }
    setIsEditing(true)
  }

  // Show loading or error state if profile is not available
  if (!profile) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Profile Card */}
        <div className="lg:col-span-2">
          <Card className="shadow-2xl border-0 overflow-hidden">
            {/* Profile Header */}
            <div className="bg-[#071d3f] p-8 text-white relative">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Profile Image */}
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    {imagePreview ? (
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : profile.profileImage ? (
                      <img
                        src={profile.profileImage || "/placeholder.svg"}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : profile.avatar ? (
                      <img
                        src={profile.avatar || "/placeholder.svg"}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <User className="w-16 h-16 text-gray-500" />
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <label htmlFor="profile-image" className="cursor-pointer">
                        <div className="w-32 h-32 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Camera className="w-8 h-8 text-white" />
                        </div>
                        <input
                          id="profile-image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-bold mb-2">{profile.name}</h2>
                  <p className="text-blue-100 text-lg mb-4">{profile.email}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={`${getRoleBadgeColor(profile.role)} border-0`}>
                      {(profile.role ? profile.role.replace("_", " ").toUpperCase() : "Not provided")}
                    </Badge>
                    {profile.emailVerified && <Badge className="bg-green-100 text-green-800 border-0">VERIFIED</Badge>}
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <div className="absolute top-6 right-6">
                {!isEditing ? (
                  <IconButton onClick={handleEditClick}>
                    <Edit3 className="w-5 h-5" />
                  </IconButton>
                ) : (
                  <div className="flex gap-2">
                    <IconButton onClick={handleCancel}>
                      <X className="w-5 h-5" />
                    </IconButton>
                  </div>
                )}
              </div>
            </div>

            {/* Editable Fields Section */}
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                Editable Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e: any) => handleInputChange("name", e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-xl border-2 border-transparent">{profile.name}</div>
                  )}
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e: any) => handleInputChange("phone", e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-xl border-2 border-transparent">
                      {profile.phone || "Not provided"}
                    </div>
                  )}
                </div>

                {/* Gender Field */}
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Gender
                  </Label>
                  {isEditing ? (
                    <CustomSelect
                      value={formData.gender}
                      onValueChange={(value: any) => handleInputChange("gender", value)}
                      placeholder="Select gender"
                      options={genderOptions}
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-xl border-2 border-transparent">
                      {profile.gender || "Not provided"}
                    </div>
                  )}
                </div>

                {/* Date of Birth Field */}
                <div className="space-y-2">
                  <Label htmlFor="dob" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date of Birth
                  </Label>
                  {isEditing ? (
                    <Input
                      id="dob"
                      type="date"
                      value={formData.dob}
                      onChange={(e: any) => handleInputChange("dob", e.target.value)}
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-xl border-2 border-transparent">
                      {formatDate(profile.dob)}
                    </div>
                  )}
                </div>
              </div>

              {/* Image Preview Section */}
              {isEditing && imagePreview && (
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <h3 className="text-sm font-semibold text-blue-800 mb-3">Image Preview</h3>
                  <div className="flex items-center gap-4">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-blue-300"
                    />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">New profile image selected</p>
                      <p className="text-blue-600">This will be your new profile picture</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
                  <PrimaryButton
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {isLoading ? "Saving..." : "Save Changes"}
                  </PrimaryButton>
                  <SecondaryButton onClick={handleCancel} disabled={isLoading}>
                    Cancel
                  </SecondaryButton>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Read-Only Information Sidebar */}
        <div className="space-y-6">
          {/* Account Information */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ReadOnlyField label="Email Address" value={profile.email} icon={Mail} />
              <ReadOnlyField label="Account Role" value={(profile.role ? profile.role.replace("_", " ").toUpperCase() : "Not provided")} icon={Shield} />
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  {profile.emailVerified ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  Email Status
                </Label>
                <div
                  className={`p-3 rounded-xl border-2 ${profile.emailVerified ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-700"}`}
                >
                  {profile.emailVerified ? "Verified" : "Not Verified"}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Information */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wallet className="w-5 h-5" />
                Wallet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  ${typeof profile.wallet === "number" ? profile.wallet.toFixed(2) : "0.00"}
                </div>
                <p className="text-green-700 text-sm">Available Balance</p>
              </div>
            </CardContent>
          </Card>

          {/* Account Timestamps */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5" />
                Account Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ReadOnlyField label="Member Since" value={formatDate(profile.createdAt)} icon={Calendar} />
              <ReadOnlyField label="Last Updated" value={formatDate(profile.updatedAt)} icon={Calendar} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
