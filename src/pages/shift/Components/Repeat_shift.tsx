"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Drawer, DrawerContent, Switch } from "@nextui-org/react"

import { message, Modal } from "antd"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "../../../store"
import { ChevronUpIcon, ChevronDownIcon, Calendar, X } from "lucide-react"
import Cookies from "js-cookie"
import axios from "axios"
import { format, addMonths, isAfter, isSameDay, parse } from "date-fns"

interface Gaurds {
    ID: number
    first_name: string
    last_name: string
}

export default function Add_shift({ isOpen, setIsOpen, gaurds, shiftdata }: any) {
    const dispatch: AppDispatch = useDispatch()
    const apiKey = import.meta.env.VITE_API_X_HEADER_KEY
    const token = Cookies.get("token")
    const [loading, setLoading] = useState(false)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [licenseExpiryCheckBasedOn, setlicenseExpiryCheckBasedOn] = useState('');
    const [searchTerm, setSearchTerm] = useState("")
    const filteredOptions = gaurds?.filter((guard: any) => guard.name.toLowerCase().includes(searchTerm.toLowerCase()))
    const [formData, setFormData] = useState({
        ids: [] as string[],
        isRecurring: true,
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
        selectedDates: [] as string[], // For multi-date selection
    })

    useEffect(() => {
        setlicenseExpiryCheckBasedOn('endDate');
        setlicenseExpiryCheckBasedOn('endDate');
        if (shiftdata) {

            const shiftIds = Array.isArray(shiftdata)
                ? shiftdata.map((shift: any) => shift.id)
                : [shiftdata?.id]

            setFormData({
                ids: shiftIds,
                isRecurring: true,
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
                selectedDates: [] as string[],
            });
        }
    }, [shiftdata]);
    // Calendar state
    const [currentMonth, setCurrentMonth] = useState(new Date())

    // Calculate max end date (3 months from start date)
    const maxEndDate = formData.startDate
        ? format(addMonths(new Date(formData.startDate), 3), "yyyy-MM-dd")
        : "";


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

    const handleRepetitionTypeChange = (type: string) => {

        if (type == 'dates') {
            setlicenseExpiryCheckBasedOn('selectedDates');
        } else {
            setlicenseExpiryCheckBasedOn('endDate');
        }



        if (type == 'dates') {
            setlicenseExpiryCheckBasedOn('selectedDates');
        } else {
            setlicenseExpiryCheckBasedOn('endDate');
        }


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
    }

    // Calendar functions
    const generateCalendarDays = () => {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()

        // First day of the month
        const firstDay = new Date(year, month, 1)
        // Last day of the month
        const lastDay = new Date(year, month + 1, 0)

        // Day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
        const firstDayOfWeek = firstDay.getDay()

        // Total days in the month
        const daysInMonth = lastDay.getDate()

        // Generate array of days
        const days = []

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push(null)
        }

        // Add days of the month
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


    // const getDaysUntilExpiryFromDate = (checkDateStr: string, expiryDateStr: string): number | null => {
    //     if (!checkDateStr || !expiryDateStr) return null

    //     const checkDate = new Date(checkDateStr)
    //     const expiryDate = new Date(expiryDateStr)

    //     // Zero out time for clean date-only comparison
    //     checkDate.setHours(0, 0, 0, 0)
    //     expiryDate.setHours(0, 0, 0, 0)

    //     const diffTime = expiryDate.getTime() - checkDate.getTime()
    //     return Math.floor(diffTime / (1000 * 60 * 60 * 24))
    // }



    const getDaysUntilExpiryFromDate = (checkDateStr: string, expiryDateStr: string): number | null => {
        if (!checkDateStr || !expiryDateStr) return null

        const checkDate = new Date(checkDateStr)
        const expiryDate = new Date(expiryDateStr)

        // Zero out time for clean date-only comparison
        checkDate.setHours(0, 0, 0, 0)
        expiryDate.setHours(0, 0, 0, 0)

        const diffTime = expiryDate.getTime() - checkDate.getTime()
        return Math.floor(diffTime / (1000 * 60 * 60 * 24))
    }


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // Validate form before proceeding
        if (!validateForm()) {
            message.error("Please fill in all required fields")
            return
        }
        const datesToCheck: string[] = []

        if (formData.startDate) datesToCheck.push(formData.startDate)
        if (formData.endDate) datesToCheck.push(formData.endDate)
        if (formData.selectedDates.length > 0) {
            datesToCheck.push(...formData.selectedDates)
        }
        if (datesToCheck.length === 0 || formData.ids.length === 0) return
        const Guard_id = Array.isArray(shiftdata)
            ? shiftdata.map((shift: any) => shift.Shift_Guardid)
            : [shiftdata?.Shift_Guardid]


        const expiringGuards = Guard_id
            .map(id => {

                const guard = filteredOptions.find((opt: any) => opt.id == id)
                if (!guard || !guard.expiry_date) return null

                // Check each date range
                const isExpiringSoon = datesToCheck.some(date =>
                    (() => {
                        const daysLeft = getDaysUntilExpiryFromDate(date, guard.expiry_date)
                        return daysLeft !== null && daysLeft >= 0 && daysLeft <= 30
                    })()
                )

                return isExpiringSoon ? { id, name: guard.name, expiry: guard.expiry_date } : null
            })
            .filter(Boolean)

        console.log(expiringGuards);

        if (expiringGuards.length > 0) {
            const modal = Modal.confirm({
                title: `Some selected guards have expiring licenses`,
                content: (
                    <div>
                        {expiringGuards.map((guard, index) => (
                            <p key={index}>
                                {guard?.name} – License expires on <b>{guard?.expiry}</b>
                            </p>
                        ))}
                    </div>
                ),
                maskClosable: true,
                footer: (
                    <div className='flex gap-2 mt-3'>
                        <button className="reset-btn" onClick={() => modal.destroy()}>
                            Cancel
                        </button>
                        <button className="Search-btn" onClick={() => {
                            modal.destroy()
                            handleSubmitAfterConfirmation()
                        }}>
                            Ignore & Add
                        </button>
                    </div>
                )
            })
        } else {
            // Proceed normally if no expiry issue
            handleSubmitAfterConfirmation()
        }



    }

    const handleSubmitAfterConfirmation = async () => {
        setLoading(true)
        try {
            const endpoint = `${import.meta.env.VITE_API_LIVEHOST}?route=User/Repeat/Shift`
            // Prepare payload based on whether it's a recurring shift
            const payload: any = { ...formData }

            const { data } = await axios.post(endpoint, payload, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            })

            if (data.status === true) {
                message.success(data.message)
                setIsOpen(false);
                setFormData({
                    ids: [],
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

        // Validate recurring shift fields if recurring is enabled
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
            <Drawer isOpen={isOpen} onOpenChange={setIsOpen} size="xl" shouldBlockScroll={true} className="top-10">
                <DrawerContent>
                    <form onSubmit={handleSubmit} className="p-6">
                        {/* Title */}
                        <h2 className="uppercase text-xl font-semibold mb-4 text-gray-700">Repeat shift</h2>

                        <div className="flex flex-col gap-4">


                            {/* Recurring Shift Options */}
                            {formData.isRecurring === true ? (
                                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-2">
                                    <h4 className="font-medium text-gray-700 mb-3">Repeat</h4>

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

                                            <div className="grid  gap-4">
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

                                            {/* Calendar for date selection */}

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
                            ) : ''}

                            {/* Submit Button */}
                            <div className="mt-4 flex gap-3 fixed bottom-0 bg-white p-4 border-t border-gray-200 w-full">
                                <button
                                    className={`${loading ? "bg-gray-400 cursor-not-allowed" : "Search-btn"
                                        }`}
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="flex items-center">
                                            <svg
                                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                                        </span>
                                    ) : (
                                        "Repeat"
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

