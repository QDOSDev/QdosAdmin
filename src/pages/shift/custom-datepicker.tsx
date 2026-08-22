"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"

// Helper functions for date manipulation
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()
const formatDate = (date: Date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
};

const isDateInRange = (date: Date, start: Date, end: Date) => {
    return date >= start && date <= end;
};

const isDateInArray = (date: Date, dateArray: Date[]) => {
    return dateArray.some(d => isSameDay(d, date));
};
// Get start and end of week for a given date
const getWeekRange = (date: Date) => {
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1)
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



type SelectionMode = "day" | "week" | "month" | "custom"

export default function CustomDatePicker({ selectedRange, onRangeChange }: any) {
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

    const [startDate, setStartDate] = useState<Date | null>(selectedRange.start)
    const [endDate, setEndDate] = useState<Date | null>(selectedRange.end)

    const calendarRef = useRef<HTMLDivElement>(null)

    // Add these new state variables after the existing state declarations
    const [tempSelectedDates, setTempSelectedDates] = useState<Date[]>([])
    const [tempStartDate, setTempStartDate] = useState<Date | null>(null)
    const [tempEndDate, setTempEndDate] = useState<Date | null>(null)
    const [tempSelectionMode, setTempSelectionMode] = useState<SelectionMode>("day")



    useEffect(() => {
        if (!startDate || !endDate) return;
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start.toDateString() === end.toDateString()) {
            setSelectionMode("day");
        }
        else if ((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) === 6) {
            setSelectionMode("week");
        }
        else if (
            start.getDate() === 1 &&
            new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate() ===
            end.getDate()
        ) {
            setSelectionMode("month");
        }
        else {
            setSelectionMode("custom");
        }

    }, [startDate, endDate]);

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
        if (mode == "day") {
            setTempStartDate(currentDate)
            setTempEndDate(currentDate)
            setTempSelectedDates([currentDate, currentDate])

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
        setCurrentDate(date);

        let newStartDate = date;
        let newEndDate = date;

        if (selectionMode === "day") {
            setSelectedDates([date]);
        } else if (selectionMode === "week") {
            const { startDate, endDate } = getWeekRange(date);
            newStartDate = startDate;
            newEndDate = endDate;
            setSelectedDates([startDate, endDate]);
        } else if (selectionMode === "month") {
            const { startDate, endDate } = getMonthRange(date);
            newStartDate = startDate;
            newEndDate = endDate;
            setSelectedDates([startDate, endDate]);
        } else if (selectionMode === "custom") {
            let newSelectedDates;
            if (selectedDates.some((d) => isSameDay(d, date))) {
                newSelectedDates = selectedDates.filter((d) => !isSameDay(d, date));
            } else {
                newSelectedDates = [...selectedDates, date];
            }

            setSelectedDates(newSelectedDates);

            if (newSelectedDates.length > 0) {
                const sortedDates = newSelectedDates.sort((a, b) => a.getTime() - b.getTime());
                newStartDate = sortedDates[0];
                newEndDate = sortedDates[sortedDates.length - 1];
            }
        }

        setStartDate(newStartDate);
        setEndDate(newEndDate);
        setTempStartDate(newStartDate)
        setTempEndDate(newEndDate)
        onRangeChange({ start: newStartDate, end: newEndDate })
    };


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
            // Handle custom date range selection
            if (!tempStartDate || (tempStartDate && tempEndDate)) {
                // If no start date or both dates are set, start new selection
                setTempStartDate(date)
                setTempEndDate(null)
                setTempSelectedDates([date])
            } else {
                // If start date is set but no end date, complete the range
                const start = new Date(tempStartDate)
                const end = new Date(date)
                
                // Ensure start date is always before end date
                if (start > end) {
                    setTempStartDate(end)
                    setTempEndDate(start)
                    setTempSelectedDates([end, start])
                } else {
                    setTempEndDate(end)
                    setTempStartDate(start)
                    setTempSelectedDates([start, end])
                }
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
        setTempSelectionMode('day')
        setTempStartDate(currentDate)
        setTempEndDate(currentDate)
        // handleTempDateSelection(new Date())
    }

    // Render calendar for a specific month
    const renderCalendar = (year: number, month: number) => {
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const monthName = new Date(year, month).toLocaleString("default", { month: "long" });

        // Create array of days
        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = isSameDay(date, today);

            let isSelected = false;

            if (tempSelectionMode === "day") {
                isSelected = isDateInArray(date, tempSelectedDates);
            } else if (tempSelectionMode === "week") {
                if (tempStartDate) {
                    const weekStart = new Date(tempStartDate);
                    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7)); // Start from Monday
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 6); // 7-day range

                    isSelected = isDateInRange(date, weekStart, weekEnd);
                }
            } else if (tempSelectionMode === "month") {
                isSelected = tempStartDate && tempEndDate ? isDateInRange(date, tempStartDate, tempEndDate) : false;
            } else if (tempSelectionMode === "custom") {
                isSelected = isDateInArray(date, tempSelectedDates);
            }

            days.push(
                <div
                    key={`day-${day}`}
                    onClick={() => handleTempDateSelection(date)}
                    className={`
                    flex items-center justify-center h-8 w-8 rounded-sm cursor-pointer text-sm
                    ${isToday ? "font-bold" : ""}
                    ${isSelected ? "bg-[#0f3253] text-white" : "hover:bg-gray-100"}
                `}
                >
                    {day}
                </div>
            );
        }

        const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

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
        );
    };
    // Add a function to apply the temporary selection
    const applySelection = () => {
        setSelectedDates(tempSelectedDates)
        setStartDate(tempStartDate)
        setEndDate(tempEndDate)
        setSelectionMode(tempSelectionMode)
        setCurrentDate(tempStartDate || currentDate)
        setShowCalendar(false)

        onRangeChange({ start: tempStartDate, end: tempEndDate })
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
                    <div className="absolute z-20 mt-1 w-[700px] bg-white border rounded-md shadow-lg right-0">
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
                                    className={`px-4 py-2 border rounded-md text-sm font-medium ${tempSelectionMode === "day" ? "bg-[#0f3253] text-white" : "hover:bg-gray-50"}`}
                                >
                                    Day
                                </button>
                                <button
                                    onClick={() => handleModeChange("week")}
                                    className={`px-4 py-2 border rounded-md text-sm font-medium ${tempSelectionMode === "week" ? "bg-[#0f3253] text-white" : "hover:bg-gray-50"}`}
                                >
                                    Week
                                </button>
                                <button
                                    onClick={() => handleModeChange("month")}
                                    className={`px-4 py-2 border rounded-md text-sm font-medium ${tempSelectionMode === "month" ? "bg-[#0f3253] text-white" : "hover:bg-gray-50"}`}
                                >
                                    Month
                                </button>
                                <button
                                    onClick={() => handleModeChange("custom")}
                                    className={`px-4 py-2 border rounded-md text-sm font-medium ${tempSelectionMode === "custom" ? "bg-[#0f3253] text-white" : "hover:bg-gray-50"}`}
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
                                    className="reset-btn"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={applySelection}
                                    className="Search-btn"
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

