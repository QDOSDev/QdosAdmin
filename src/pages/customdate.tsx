"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"

// Helper functions for date manipulation
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()
const formatDate = (date: Date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
const isSameDay = (date1: Date, date2: Date) =>
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()

// Get start and end of week for a given date
const getWeekRange = (date: Date) => {
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Sunday
    const startDate = new Date(date)
    startDate.setDate(diff)

    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)

    return { startDate, endDate }
}

// Get start and end of month for a given date
const getMonthRange = (date: Date) => {
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1)
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    return { startDate, endDate }
}

// Check if a date is within a range
const isDateInRange = (date: Date, startDate: Date, endDate: Date) => {
    return date >= startDate && date <= endDate
}

// Check if a date is in an array of dates
const isDateInArray = (date: Date, dateArray: Date[]) => {
    return dateArray.some((d) => isSameDay(d, date))
}

type SelectionMode = "day" | "week" | "month" | "custom"

export default function CustomDatePicker() {
    const today = new Date()
    const [currentDate, setCurrentDate] = useState(today)
    const [selectedDates, setSelectedDates] = useState<Date[]>([today])
    const [showCalendar, setShowCalendar] = useState(false)
    const [selectionMode, setSelectionMode] = useState<SelectionMode>("day")
    const [displayMonths, setDisplayMonths] = useState(() => {
        const currentMonth = today.getMonth()
        const currentYear = today.getFullYear()
        return [
            { year: currentYear, month: currentMonth },
            { year: currentMonth === 11 ? currentYear + 1 : currentYear, month: (currentMonth + 1) % 12 },
        ]
    })
    const [startDate, setStartDate] = useState<Date | null>(null)
    const [endDate, setEndDate] = useState<Date | null>(null)

    const calendarRef = useRef<HTMLDivElement>(null)

    // Add these new state variables after the existing state declarations
    const [tempSelectedDates, setTempSelectedDates] = useState<Date[]>([])
    const [tempStartDate, setTempStartDate] = useState<Date | null>(null)
    const [tempEndDate, setTempEndDate] = useState<Date | null>(null)
    const [tempSelectionMode, setTempSelectionMode] = useState<SelectionMode>("day")

    // Initialize with today's date
    useEffect(() => {
        handleDateSelection(today)
    }, [])

    // Handle outside click to close calendar
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setShowCalendar(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    // Add this effect to initialize temp values when calendar opens
    useEffect(() => {
        if (showCalendar) {
            setTempSelectedDates([...selectedDates])
            setTempStartDate(startDate)
            setTempEndDate(endDate)
            setTempSelectionMode(selectionMode)
        }
    }, [showCalendar])

    // Update display text based on selection
    const getDisplayText = () => {
        if (!startDate || !endDate) return "Select date"

        if (isSameDay(startDate, endDate)) {
            return formatDate(startDate)
        }

        return `${formatDate(startDate).split(",")[0]} — ${formatDate(endDate)}`
    }

    // Modify the handleModeChange function to use temp variables
    const handleModeChange = (mode: SelectionMode) => {
        setTempSelectionMode(mode)

        if (mode === "day") {
            handleTempDateSelection(currentDate)
        } else if (mode === "week") {
            const { startDate, endDate } = getWeekRange(currentDate)
            setTempStartDate(startDate)
            setTempEndDate(endDate)
            setTempSelectedDates([startDate, endDate])
        } else if (mode === "month") {
            const { startDate, endDate } = getMonthRange(currentDate)
            setTempStartDate(startDate)
            setTempEndDate(endDate)
            setTempSelectedDates([startDate, endDate])
        } else if (mode === "custom") {
            setTempSelectedDates([currentDate])
            setTempStartDate(currentDate)
            setTempEndDate(currentDate)
        }
    }

    // Handle date selection based on mode
    const handleDateSelection = (date: Date) => {
        setCurrentDate(date)

        if (selectionMode === "day") {
            setSelectedDates([date])
            setStartDate(date)
            setEndDate(date)
        } else if (selectionMode === "week") {
            const { startDate, endDate } = getWeekRange(date)
            setStartDate(startDate)
            setEndDate(endDate)
            setSelectedDates([startDate, endDate])
        } else if (selectionMode === "month") {
            const { startDate, endDate } = getMonthRange(date)
            setStartDate(startDate)
            setEndDate(endDate)
            setSelectedDates([startDate, endDate])
        } else if (selectionMode === "custom") {
            // For custom selection, we allow multiple dates
            if (selectedDates.some((d) => isSameDay(d, date))) {
                // If date is already selected, remove it
                setSelectedDates(selectedDates.filter((d) => !isSameDay(d, date)))
            } else {
                // Add the date to selection
                setSelectedDates([...selectedDates, date])
            }

            // Update start and end dates for display
            if (selectedDates.length > 0) {
                const sortedDates = [...selectedDates, date].sort((a, b) => a.getTime() - b.getTime())
                setStartDate(sortedDates[0])
                setEndDate(sortedDates[sortedDates.length - 1])
            } else {
                setStartDate(date)
                setEndDate(date)
            }
        }
    }

    // Add a new function for temporary date selection
    const handleTempDateSelection = (date: Date) => {
        if (tempSelectionMode === "day") {
            setTempSelectedDates([date])
            setTempStartDate(date)
            setTempEndDate(date)
        } else if (tempSelectionMode === "week") {
            const { startDate, endDate } = getWeekRange(date)
            setTempStartDate(startDate)
            setTempEndDate(endDate)
            setTempSelectedDates([startDate, endDate])
        } else if (tempSelectionMode === "month") {
            const { startDate, endDate } = getMonthRange(date)
            setTempStartDate(startDate)
            setTempEndDate(endDate)
            setTempSelectedDates([startDate, endDate])
        } else if (tempSelectionMode === "custom") {
            // For custom selection, we allow multiple dates
            if (tempSelectedDates.some((d) => isSameDay(d, date))) {
                // If date is already selected, remove it
                setTempSelectedDates(tempSelectedDates.filter((d) => !isSameDay(d, date)))
            } else {
                // Add the date to selection
                setTempSelectedDates([...tempSelectedDates, date])
            }

            // Update start and end dates for display
            if (tempSelectedDates.length > 0) {
                const sortedDates = [...tempSelectedDates, date].sort((a, b) => a.getTime() - b.getTime())
                setTempStartDate(sortedDates[0])
                setTempEndDate(sortedDates[sortedDates.length - 1])
            } else {
                setTempStartDate(date)
                setTempEndDate(date)
            }
        }
    }

    // Navigate to previous period based on selection mode
    const handlePrevious = () => {
        if (selectionMode === "day") {
            const newDate = new Date(currentDate)
            newDate.setDate(currentDate.getDate() - 1)
            handleDateSelection(newDate)
        } else if (selectionMode === "week") {
            const newDate = new Date(currentDate)
            newDate.setDate(currentDate.getDate() - 7)
            handleDateSelection(newDate)
        } else if (selectionMode === "month") {
            const newDate = new Date(currentDate)
            newDate.setMonth(currentDate.getMonth() - 1)
            handleDateSelection(newDate)
        }
    }

    // Navigate to next period based on selection mode
    const handleNext = () => {
        if (selectionMode === "day") {
            const newDate = new Date(currentDate)
            newDate.setDate(currentDate.getDate() + 1)
            handleDateSelection(newDate)
        } else if (selectionMode === "week") {
            const newDate = new Date(currentDate)
            newDate.setDate(currentDate.getDate() + 7)
            handleDateSelection(newDate)
        } else if (selectionMode === "month") {
            const newDate = new Date(currentDate)
            newDate.setMonth(currentDate.getMonth() + 1)
            handleDateSelection(newDate)
        }
    }

    // Navigate to previous month in calendar view
    const handlePrevMonth = () => {
        setDisplayMonths((prev) => {
            const newFirstMonth = {
                year: prev[0].month === 0 ? prev[0].year - 1 : prev[0].year,
                month: prev[0].month === 0 ? 11 : prev[0].month - 1,
            }
            const newSecondMonth = {
                year: prev[1].month === 0 ? prev[1].year - 1 : prev[1].year,
                month: prev[1].month === 0 ? 11 : prev[1].month - 1,
            }
            return [newFirstMonth, newSecondMonth]
        })
    }

    // Navigate to next month in calendar view
    const handleNextMonth = () => {
        setDisplayMonths((prev) => {
            const newFirstMonth = {
                year: prev[0].month === 11 ? prev[0].year + 1 : prev[0].year,
                month: (prev[0].month + 1) % 12,
            }
            const newSecondMonth = {
                year: prev[1].month === 11 ? prev[1].year + 1 : prev[1].year,
                month: (prev[1].month + 1) % 12,
            }
            return [newFirstMonth, newSecondMonth]
        })
    }

    // Handle today button click
    const handleTodayClick = () => {
        handleTempDateSelection(new Date())
    }

    // Render calendar for a specific month
    const renderCalendar = (year: number, month: number) => {
        const daysInMonth = getDaysInMonth(year, month)
        const firstDay = getFirstDayOfMonth(year, month)
        const monthName = new Date(year, month).toLocaleString("default", { month: "long" })

        // Create array of days
        const days = []

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>)
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day)
            const isToday = isSameDay(date, today)

            // Check if this date should be highlighted based on selection mode
            let isSelected = false
            if (tempSelectionMode === "day") {
                isSelected = tempSelectedDates.some((d) => isSameDay(d, date))
            } else if (tempSelectionMode === "week" || tempSelectionMode === "month") {
                isSelected = tempStartDate && tempEndDate ? isDateInRange(date, tempStartDate, tempEndDate) : false
            } else if (tempSelectionMode === "custom") {
                isSelected = isDateInArray(date, tempSelectedDates)
            }

            days.push(
                <div
                    key={`day-${day}`}
                    onClick={() => handleTempDateSelection(date)}
                    className={`
            flex items-center justify-center h-8 w-8 rounded-sm cursor-pointer text-sm
            ${isToday ? "font-bold" : ""}
            ${isSelected ? "bg-orange-500 text-white" : "hover:bg-gray-100"}
          `}
                >
                    {day}
                </div>,
            )
        }

        const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

        return (
            <div className="w-full">
                <div className="text-center font-medium mb-2">
                    {monthName} {year}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {weekdays.map((day) => (
                        <div key={day} className="h-8 flex items-center justify-center text-sm font-medium">
                            {day}
                        </div>
                    ))}
                    {days}
                </div>
            </div>
        )
    }

    // Add a function to apply the temporary selection
    const applySelection = () => {
        setSelectedDates(tempSelectedDates)
        setStartDate(tempStartDate)
        setEndDate(tempEndDate)
        setSelectionMode(tempSelectionMode)
        setCurrentDate(tempStartDate || currentDate)
        setShowCalendar(false)
    }

    // Add a function to cancel and revert changes
    const cancelSelection = () => {
        setTempSelectedDates([...selectedDates])
        setTempStartDate(startDate)
        setTempEndDate(endDate)
        setTempSelectionMode(selectionMode)
        setShowCalendar(false)
    }

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="relative" ref={calendarRef}>
                {/* Date display and toggle */}
                <div
                    className="flex items-center border rounded-md p-2 cursor-pointer bg-gray-50"
                    onClick={() => setShowCalendar(!showCalendar)}
                >
                    <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                    <div className="flex-1">{getDisplayText()}</div>
                    <div className="flex">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                handlePrevious()
                            }}
                            className="p-1 hover:bg-gray-200 rounded-md"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                handleNext()
                            }}
                            className="p-1 hover:bg-gray-200 rounded-md"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Calendar dropdown */}
                {showCalendar && (
                    <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
                        <div className="p-4">
                            {/* Top controls */}
                            <div className="flex justify-between items-center mb-4">
                                <button
                                    onClick={handleTodayClick}
                                    className="px-4 py-2 border rounded-md hover:bg-gray-50 text-sm font-medium"
                                >
                                    Today
                                </button>
                                <div className="flex space-x-4">
                                    <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-md">
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-md">
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Selection mode buttons */}
                            <div className="grid grid-cols-4 gap-1 mb-4">
                                <button
                                    onClick={() => handleModeChange("day")}
                                    className={`px-4 py-2 border rounded-md text-sm font-medium ${tempSelectionMode === "day" ? "bg-orange-500 text-white" : "hover:bg-gray-50"}`}
                                >
                                    Day
                                </button>
                                <button
                                    onClick={() => handleModeChange("week")}
                                    className={`px-4 py-2 border rounded-md text-sm font-medium ${tempSelectionMode === "week" ? "bg-orange-500 text-white" : "hover:bg-gray-50"}`}
                                >
                                    Week
                                </button>
                                <button
                                    onClick={() => handleModeChange("month")}
                                    className={`px-4 py-2 border rounded-md text-sm font-medium ${tempSelectionMode === "month" ? "bg-orange-500 text-white" : "hover:bg-gray-50"}`}
                                >
                                    Month
                                </button>
                                <button
                                    onClick={() => handleModeChange("custom")}
                                    className={`px-4 py-2 border rounded-md text-sm font-medium ${tempSelectionMode === "custom" ? "bg-orange-500 text-white" : "hover:bg-gray-50"}`}
                                >
                                    Custom
                                </button>
                            </div>

                            {/* Calendar grid */}
                            <div className="grid grid-cols-2 gap-8">
                                {renderCalendar(displayMonths[0].year, displayMonths[0].month)}
                                {renderCalendar(displayMonths[1].year, displayMonths[1].month)}
                            </div>

                            {/* Action buttons */}
                            <div className="flex justify-end mt-6 space-x-2">
                                <button
                                    onClick={cancelSelection}
                                    className="px-6 py-2 border rounded-md hover:bg-gray-50 text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={applySelection}
                                    className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm font-medium"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

