"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Drawer, DrawerContent } from "@nextui-org/react"
import { message, Modal } from "antd"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "../../../store"
import { ChevronUpIcon, ChevronDownIcon, X } from "lucide-react"
import Cookies from "js-cookie"
import axios from "axios"
import { format, addMonths, isAfter, isSameDay } from "date-fns"

interface Gaurds {
  ID: number
  first_name: string
  last_name: string
}

export default function Add_shift({ selectDate, isOpen, setIsOpen, gaurds, allcustomers, services, site }: any) {
  const dispatch: AppDispatch = useDispatch()
  const [searchTerm, setSearchTerm] = useState("")
  const filteredOptions = gaurds.filter((guard: any) => guard.name.toLowerCase().includes(searchTerm.toLowerCase()))
  const apiKey = import.meta.env.VITE_API_X_HEADER_KEY
  const token = Cookies.get("token")
  const [licenseExpiryCheckBasedOn, setlicenseExpiryCheckBasedOn] = useState("shiftDate")
  const [Licenceexpirde, setlicenceexpirde] = useState("")
  const [Selectopen, setselectOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    guardName: "",
    shiftDate: selectDate || "",
    startTime: "00:00",
    endTime: "12:00",
    customer: "",
    site: "",
    service: "",
    note: "",
    // Recurring shift fields
    isRecurring: false,
    repetitionType: "days", // "days" or "dates"
    repeatDays: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
    startDate: "",
    endDate: "",
    selectedDates: [] as string[], // For multi-date selection
  })

  // Calendar state
  const [calendarVisible, setCalendarVisible] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Calculate max end date (3 months from start date)
  const maxEndDate = formData.startDate ? format(addMonths(new Date(formData.startDate), 3), "yyyy-MM-dd") : ""
  /*
      API call
      */
  useEffect(() => {
    if (isOpen && selectDate) {
      setlicenseExpiryCheckBasedOn("shiftDate")
      setFormData((prev) => ({
        ...prev,
        shiftDate: selectDate,
        isRecurring: false,
      }))
    }
  }, [isOpen, selectDate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))

    // Clear error for this field when user makes a change
    if (formErrors[id]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[id]
        return newErrors
      })
    }
  }

  const handleCustomerChange = (customerId: any) => {
    setFormData((prev) => ({
      ...prev,
      customer: customerId,
    }))

    // Clear customer error
    if (formErrors.customer) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.customer
        return newErrors
      })
    }


  }

  // Recurring shift handlers
  const handleRecurringToggle = () => {
    setFormData({
      ...formData,
      isRecurring: !formData.isRecurring,
      // Reset repetition fields if toggling off
      ...(formData.isRecurring && {
        repetitionType: "days",
        repeatDays: {
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false,
          sunday: false,
        },
        startDate: "",
        endDate: "",
        selectedDates: [],
      }),
    })
  }

  const handleRepetitionTypeChange = (type: string) => {
    setFormData({
      ...formData,
      repetitionType: type,
      // Reset fields for the other repetition type
      ...(type === "days"
        ? { selectedDates: [] }
        : {
          repeatDays: {
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false,
            saturday: false,
            sunday: false,
          },
          startDate: "",
          endDate: "",
        }),
    })
  }

  const handleCheckboxChange = (day: string) => {
    setFormData({
      ...formData,
      repeatDays: {
        ...formData.repeatDays,
        [day]: !formData.repeatDays[day as keyof typeof formData.repeatDays],
      },
    })
    setlicenseExpiryCheckBasedOn("endDate")
  }

  const handleDateSelect = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")

    // Check if date is already selected
    const isSelected = formData.selectedDates.includes(dateString)

    // Toggle date selection
    setFormData({
      ...formData,
      selectedDates: isSelected
        ? formData.selectedDates.filter((d) => d !== dateString)
        : [...formData.selectedDates, dateString].sort(),
    })

    setlicenseExpiryCheckBasedOn("selectedDates")
  }

  // Calendar functions
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const firstDayOfWeek = firstDay.getDay()
    const daysInMonth = lastDay.getDate()
    const days = []
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const changeMonth = (increment: number) => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() + increment)
    setCurrentMonth(newMonth)
  }

  const isDateSelected = (date: Date | null) => {
    if (!date) return false
    const dateString = format(date, "yyyy-MM-dd")
    return formData.selectedDates.includes(dateString)
  }

  const isToday = (date: Date | null) => {
    if (!date) return false
    const today = new Date()
    return isSameDay(date, today)
  }

  const getDaysUntilExpiry = (expiryDateStr: string, referenceDateStr: string): number => {
    const [ey, em, ed] = expiryDateStr.split("-").map(Number)
    const expiryDate = new Date(ey, em - 1, ed)

    const [ry, rm, rd] = referenceDateStr.split("-").map(Number)
    const referenceDate = new Date(ry, rm - 1, rd)

    expiryDate.setHours(0, 0, 0, 0)
    referenceDate.setHours(0, 0, 0, 0)

    const diff = expiryDate.getTime() - referenceDate.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const shouldWarnAboutLicense = (): { warn: boolean; daysLeft: number } => {
    const expiry = Licenceexpirde
    const basis: string = licenseExpiryCheckBasedOn

    const datesToCheck: string[] = []

    switch (basis) {
      case "current": {
        const today = new Date()
        const todayStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
        datesToCheck.push(todayStr)
        break
      }
      case "shiftDate":
      case "startDate":
      case "endDate": {
        const dateStr = formData[basis]
        if (dateStr) datesToCheck.push(dateStr)
        break
      }
      case "selectedDates": {
        if (Array.isArray(formData.selectedDates)) {
          datesToCheck.push(...formData.selectedDates)
        }
        break
      }
    }

    for (const refDate of datesToCheck) {
      const daysLeft = getDaysUntilExpiry(expiry, refDate)
      if (daysLeft <= 30) {
        return { warn: true, daysLeft }
      }
    }

    return { warn: false, daysLeft: 999 }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validate form before proceeding
    if (!validateForm()) {
      message.error("Please fill in all required fields")
      return
    }

    const { warn, daysLeft } = shouldWarnAboutLicense()

    if (warn) {
      const modal = Modal.confirm({
        title: "License Expiry Warning",
        content: `License will expire on ${Licenceexpirde}`,
        footer: (
          <div className="flex gap-2 mt-3">
            <button className="reset-btn" onClick={() => modal.destroy()}>
              Cancel
            </button>
            <button
              className="Search-btn"
              onClick={async () => {
                modal.destroy()
                submitShift(false)
              }}
            >
              Ignore & Add
            </button>
          </div>
        ),
      })
    } else {
      submitShift(false)
    }
    return false
  }

  const submitShift = async (ignore = false) => {
    setLoading(true)
    try {
      const endpoint = `${import.meta.env.VITE_API_LIVEHOST}?route=User/Insert/Shift`
      const payload: any = { ...formData }

      // Add ignore parameter if true
      if (ignore) {
        payload.ignore = true
      }

      const { data } = await axios.post(endpoint, payload, {
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (data.status === true) {
        message.success(data.message)
        setIsOpen(false)
        setFormData({
          guardName: "",
          shiftDate: "",
          startTime: "00:00",
          endTime: "12:00",
          customer: "",
          site: "",
          service: "",
          note: "",
          isRecurring: false,
          repetitionType: "days",
          repeatDays: {
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false,
            saturday: false,
            sunday: false,
          },
          startDate: "",
          endDate: "",
          selectedDates: [],
        })
      } else if (data.status === false && data.status_code === 101) {
        // Handle status code 101 - license already exists
        const modal = Modal.confirm({
          title: "Guard Already Assigned",
          content: `This guard is already assigned for ${data.message}`,
          footer: (
            <div className="flex gap-2 mt-3">
              <button className="reset-btn" onClick={() => modal.destroy()}>
                Cancel
              </button>
              <button
                className="Search-btn"
                onClick={async () => {
                  modal.destroy()
                  // Call submitShift again with ignore=true
                  submitShift(true)
                }}
              >
                Ignore & Add
              </button>
            </div>
          ),
        })
      } else {
        message.error(data.message)
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      message.error("Submission failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const endDate = new Date(formData.endDate)
  const maxAllowedDate = new Date(maxEndDate)

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.guardName) errors.guardName = "Guard name is required"
    if (!formData.shiftDate) errors.shiftDate = "Shift date is required"
    if (!formData.startTime) errors.startTime = "Start time is required"
    if (!formData.endTime) errors.scheduleend = "End time is required"
    if (!formData.customer) errors.customer = "Customer is required"
    if (!formData.site) errors.site = "Site is required"
    if (!formData.service) errors.service = "Service is required"

    if (formData.isRecurring) {
      if (formData.repetitionType === "days") {
        if (!formData.startDate) errors.startDate = "Start date is required for recurring shifts"
        if (!formData.endDate) errors.endDate = "End date is required for recurring shifts"

        // Validate at least one day is selected
        const anyDaySelected = Object.values(formData.repeatDays).some((day) => day)
        if (!anyDaySelected) errors.repeatDays = "Select at least one day for repetition"

        // Validate end date is not more than 3 months after start date
        if (formData.startDate && formData.endDate) {
          if (isAfter(endDate, maxAllowedDate)) {
            errors.endDate = "End date cannot be more than 3 months from start date"
          }
        }
      } else if (formData.repetitionType === "dates") {
        // Validate at least one date is selected
        if (formData.selectedDates.length === 0) {
          errors.selectedDates = "Select at least one date for the shift"
        }
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Day names for the weekly pattern
  const dayNames = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

  return (
    <div>
      <Drawer isOpen={isOpen} onOpenChange={setIsOpen} size="xl" shouldBlockScroll={true}>
        <DrawerContent>
          <form onSubmit={handleSubmit} className="p-6">
            {/* Title */}
            <h2 className="uppercase text-xl font-semibold mb-4 text-gray-700">Add Shift</h2>

            <div className="flex flex-col gap-4">
              {/* Guard Name */}
              <div className="relative">
                <label htmlFor="guard_name">
                  Guard Name <span className="text-red-500">*</span>
                </label>

                <div
                  className="w-full border rounded-md p-2 flex items-center justify-between bg-white cursor-pointer"
                  onClick={() => setselectOpen(!Selectopen)}
                >
                  <span>
                    {formData.guardName
                      ? gaurds.find((option: any) => option.id === Number(formData.guardName))?.name ||
                      "Select an option"
                      : "Select an option"}
                  </span>

                  {Selectopen ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                  )}
                </div>

                {Selectopen && (
                  <div className="absolute w-full border bg-white rounded-md shadow-md mt-1 z-10">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full border-b p-2"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <div className="max-h-40 overflow-y-auto">
                      {filteredOptions.length > 0 ? (
                        filteredOptions.map((option: any) => (
                          <div
                            key={option.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, guardName: option.id.toString() }))
                              setlicenceexpirde(option.expiry_date)
                              setselectOpen(!Selectopen)
                            }}
                          >
                            {option.name}
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-gray-500">No options found</div>
                      )}
                    </div>
                  </div>
                )}
                {formErrors.guardName && <p className="text-red-500 text-xs mt-1">{formErrors.guardName}</p>}
              </div>

              {/* Shift Date */}
              <div>
                <label className="font-medium text-gray-600">
                  Shift Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="shiftDate"
                  name=""
                  className="w-full border rounded-md px-3 py-2"
                  value={formData.shiftDate}
                  onChange={handleChange}
                />
                {formErrors.shiftDate && <p className="text-red-500 text-xs mt-1">{formErrors.shiftDate}</p>}
              </div>

              {/* Scheduled Start Time */}
              <div className="flex justify-between gap-3">
                <div className="w-full">
                  <label className="font-medium text-gray-600">
                    Scheduled Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    className="w-full border rounded-md px-3 py-2"
                    value={formData.startTime || ""}
                    onChange={handleChange}
                  />
                  {formErrors.startTime && <p className="text-red-500 text-xs mt-1">{formErrors.startTime}</p>}
                </div>

                {/* Scheduled End Time */}
                <div className="w-full">
                  <label className="font-medium text-gray-600">
                    Scheduled End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    className="w-full border rounded-md px-3 py-2"
                    value={formData.endTime}
                    onChange={handleChange}
                  />
                  {formErrors.scheduleend && <p className="text-red-500 text-xs mt-1">{formErrors.scheduleend}</p>}
                </div>
              </div>
              {/* Customer */}
              <div>
                <label className="font-medium text-gray-600">
                  Customer <span className="text-red-500">*</span>
                </label>
                <select
                  id="customer"
                  className={`w-full border rounded-md p-2`}
                  value={formData.customer}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                >
                  <option value="">Select a customer</option>
                  {allcustomers?.map((customer: any) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.customer_name}
                    </option>
                  ))}
                </select>
                {formErrors.customer && <p className="text-red-500 text-xs mt-1">{formErrors.customer}</p>}
              </div>

              {/* Site */}
              <div>
                <label className="font-medium text-gray-600">
                  Site <span className="text-red-500">*</span>
                </label>

                <select
                  id="site"
                  className="w-full border rounded-md p-2"
                  value={formData.site}
                  onChange={(e) => setFormData((prev) => ({ ...prev, site: e.target.value }))} // Keep as string
                >
                  <option value="">Select a Site</option>
                  {site?.map((customer: any) => (
                    <option key={customer.ID} value={customer.ID}>
                      {customer.site_name}
                    </option>
                  ))}
                </select>
                {formErrors.site && <p className="text-red-500 text-xs mt-1">{formErrors.site}</p>}
              </div>

              {/* Service */}
              <div>
                <label className="font-medium text-gray-600">
                  Service <span className="text-red-500">*</span>
                </label>
                <select
                  id="service"
                  className={`w-full border rounded-md p-2`}
                  value={formData.service}
                  onChange={handleChange}
                >
                  <option value="">Select a Service</option>
                  {services?.map((customer: any) => (
                    <option key={customer.ID} value={customer.ID}>
                      {customer.Service_name}
                    </option>
                  ))}
                </select>
                {formErrors.service && <p className="text-red-500 text-xs mt-1">{formErrors.service}</p>}
              </div>

              {/* Note */}
              <div>
                <label className="font-medium text-gray-600">Note</label>
                <textarea
                  id="note"
                  className="w-full border rounded-md p-2 h-24"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Enter a note..."
                />
                {formErrors.note && <p className="text-red-500 text-xs mt-1">{formErrors.note}</p>}
              </div>

              {/* Recurring Shift Toggle */}
              <div className="mt-2">
                <div className="flex items-center mb-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isRecurring}
                      onChange={handleRecurringToggle}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      This is a recurring shift
                    </span>
                  </label>
                </div>
              </div>

              {/* Recurring Shift Options */}
              {formData.isRecurring === true ? (
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-2">
                  <h4 className="font-medium text-gray-700 mb-3">Repetition Pattern</h4>

                  {/* Repetition Type Selector */}
                  <div className="mb-4">
                    <div className="flex space-x-2 mb-4">
                      <button
                        type="button"
                        onClick={() => handleRepetitionTypeChange("days")}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${formData.repetitionType === "days" ? "bg-[#071d3f] text-white" : "bg-gray-200 text-gray-700"
                          }`}
                      >
                        Weekly Pattern
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRepetitionTypeChange("dates")}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${formData.repetitionType === "dates" ? "bg-[#071d3f] text-white" : "bg-gray-200 text-gray-700"
                          }`}
                      >
                        Specific Dates
                      </button>
                    </div>
                  </div>

                  {/* Days-based repetition */}
                  {formData.repetitionType === "days" && (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Repeat on days:</label>
                        <div className="flex flex-wrap gap-2">
                          {dayNames.map((day) => (
                            <button
                              key={day}
                              type="button"
                              onClick={() => handleCheckboxChange(day)}
                              className={`px-3 py-1 rounded-full text-sm ${formData.repeatDays[day as keyof typeof formData.repeatDays]
                                  ? "bg-[#e2ad17] text-white"
                                  : "bg-gray-200 text-gray-700"
                                }`}
                            >
                              {day.charAt(0).toUpperCase() + day.slice(1)}
                            </button>
                          ))}
                        </div>
                        {formErrors.repeatDays && <p className="text-red-500 text-xs mt-1">{formErrors.repeatDays}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            id="startDate"
                            className={`w-full border rounded-md px-3 py-2 ${formErrors.startDate ? "border-red-500" : ""
                              }`}
                            value={formData.startDate}
                            onChange={handleChange}
                          />
                          {formErrors.startDate && <p className="text-red-500 text-xs mt-1">{formErrors.startDate}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            id="endDate"
                            className={`w-full border rounded-md px-3 py-2 ${formErrors.endDate ? "border-red-500" : ""
                              }`}
                            value={formData.endDate}
                            onChange={handleChange}
                            min={formData.startDate}
                            max={maxEndDate}
                          />
                          {formErrors.endDate && <p className="text-red-500 text-xs mt-1">{formErrors.endDate}</p>}
                          <p className="text-xs text-gray-500 mt-1">Maximum 3 months from start date</p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Date-based repetition */}
                  {formData.repetitionType === "dates" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select specific dates:</label>

                      {/* Selected dates display */}
                      <div className="mb-4">
                        <p className="text-sm text-gray-700 mb-2">Selected dates ({formData.selectedDates.length}):</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.selectedDates.length > 0 ? (
                            formData.selectedDates.map((date) => (
                              <div
                                key={date}
                                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center"
                              >
                                {format(new Date(date), "MMM d, yyyy")}
                                <button
                                  type="button"
                                  onClick={() => handleDateSelect(new Date(date))}
                                  className="ml-1 text-blue-600 hover:text-blue-800"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No dates selected</p>
                          )}
                        </div>
                        {formErrors.selectedDates && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.selectedDates}</p>
                        )}
                      </div>


                      <div className="border border-gray-300 rounded-md p-4 mb-4 bg-white">
                        <div className="flex justify-between items-center mb-4">
                          <button
                            type="button"
                            onClick={() => changeMonth(-1)}
                            className="p-1 rounded-full hover:bg-gray-200"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                          <h3 className="text-md font-medium">{format(currentMonth, "MMMM yyyy")}</h3>
                          <button
                            type="button"
                            onClick={() => changeMonth(1)}
                            className="p-1 rounded-full hover:bg-gray-200"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                          {/* Day headers */}
                          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                            <div key={day} className="text-center text-sm font-medium text-gray-700 py-1">
                              {day}
                            </div>
                          ))}

                          {/* Calendar days */}
                          {generateCalendarDays().map((day, index) => (
                            <div key={index} className="text-center py-1">
                              {day ? (
                                <button
                                  type="button"
                                  onClick={() => handleDateSelect(day)}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${isDateSelected(day)
                                      ? "bg-blue-600 text-white"
                                      : isToday(day)
                                        ? "bg-blue-100 text-blue-800"
                                        : "hover:bg-gray-200"
                                    }`}
                                >
                                  {day.getDate()}
                                </button>
                              ) : (
                                <div className="w-8 h-8"></div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                ""
              )}

              {/* Submit Button */}
              <div className="mt-4 flex gap-3">
                <button
                  className={`Search-btn flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white rounded ${loading ? "bg-gray-400 cursor-not-allowed" : ""
                    }`}
                  type="submit"
                  disabled={loading}
                  style={{ minWidth: "120px", height: "40px" }}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Adding...
                    </>
                  ) : (
                    "Add Shift"
                  )}
                </button>
              </div>

            </div>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
