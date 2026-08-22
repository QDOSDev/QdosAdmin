"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Settings,
    Layers,
    Filter,
    Wrench,
    Shirt,
    Copy,
    Clipboard,
    Check,
    DollarSign,
    Info,
    Plus,
    FileText,
    Undo,
    Redo,
} from "lucide-react"
import Cookies from "js-cookie"
import axios from "axios"
// Define types for our data structures
type Day = {
    day: string
    date: string
    fullDate?: Date
}

type Location = {
    id: string
    name: string
}

type TimeSlot = {
    id: number
    time: string
}

type Shift = {
    id: string
    locationId: string
    timeSlotId: number
    day: string
    date?: string
    isPremium: boolean
    patrol: string
    staff: string
    hasAlert?: boolean
    darkBg?: boolean
    originalWeek?: string
}

// Define action types for undo/redo
type ActionType =
    | { type: "ADD_SHIFT"; shift: Shift }
    | { type: "DELETE_SHIFT"; shift: Shift }
    | { type: "MOVE_SHIFT"; shift: Shift; prevShift: Shift }
    | { type: "PASTE_SHIFTS"; shifts: Shift[] }
    | { type: "BULK_EDIT"; prevShifts: Shift[]; newShifts: Shift[] }

const getCurrentWeekRange = () => {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Sunday, 6 = Saturday

    const start = new Date(today)
    start.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)) // Start from Monday

    const end = new Date(start)
    end.setDate(start.getDate() + 6) // Full 7-day range

    return { start, end }
}
export default function ScheduleInterface() {
    // State for date range and schedule selection
    const endpoint = import.meta.env.VITE_API_LIVEHOST
    const apiKey = import.meta.env.VITE_API_X_HEADER_KEY
    const token = Cookies.get("token")
    const [loading, setLoading] = useState(false)
    const [selectedRange, setSelectedRange] = useState<{ start: Date; end: Date }>(getCurrentWeekRange())
    const [locations, setLocations] = useState<any[]>([])
    const [timeSlots, setTimeSlots] = useState<any[]>([])
    const [scheduleData, setScheduleData] = useState<any[]>([])
    const [fullData, setFullData] = useState<any[]>([])
    const [days, setdays] = useState<any[]>([])



    const [selectedSchedule, setSelectedSchedule] = useState("Main Schedule")
    const [expandedLocations, setExpandedLocations] = useState<Record<string, boolean>>({
        "11": true,
        "2700": true,
        "401": true,
        "900": true,
    })

    // Calendar state
    const [showCalendar, setShowCalendar] = useState(false)
    const [currentMonth, setCurrentMonth] = useState(2) // March (0-indexed)
    const [currentYear, setCurrentYear] = useState(2025)
    const [selectedWeek, setSelectedWeek] = useState([17, 18, 19, 20, 21, 22, 23]) // Mar 17-23
    const [calendarView, setCalendarView] = useState("Week")
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date(2025, 2, 17)) // Mar 17, 2025

    // Drag and drop state
    const [draggedItem, setDraggedItem] = useState<Shift | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const dragCounter = useRef(0)
    const dragImage = useRef<HTMLDivElement | null>(null)
    const selectionBox = useRef<HTMLDivElement | null>(null)
    const [selectionRect, setSelectionRect] = useState<{
        startX: number
        startY: number
        endX: number
        endY: number
        isSelecting: boolean
    }>({
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
        isSelecting: false,
    })

    // Selection state
    const [selectedCells, setSelectedCells] = useState<string[]>([])
    const [isSelecting, setIsSelecting] = useState(false)
    const [selectionStart, setSelectionStart] = useState<string | null>(null)
    const [copiedShifts, setCopiedShifts] = useState<Shift[]>([])
    const [showCopyToast, setShowCopyToast] = useState(false)
    const [showPasteToast, setShowPasteToast] = useState(false)
    const [contextMenu, setContextMenu] = useState<{
        x: number
        y: number
        day: string
        locationId: string
        timeSlotId: number
    } | null>(null)
    const tableRef = useRef<HTMLDivElement>(null)
    const [selectionMode, setSelectionMode] = useState<"cell" | "rectangle">("cell")

    // Undo/Redo state
    const [undoStack, setUndoStack] = useState<ActionType[]>([])
    const [redoStack, setRedoStack] = useState<ActionType[]>([])
    const [showUndoToast, setShowUndoToast] = useState(false)
    const [showRedoToast, setShowRedoToast] = useState(false)

    // Empty state
    const [showEmptyState, setShowEmptyState] = useState(false)

    // Generate days of the week with dates


    // Locations/departments

    // shift backend data manage
    const formatDate = (date: Date) => {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    }

    const transformBackendData = (backendData: any[]) => {
        const locations: any[] = []
        const timeSlots: any[] = []
        const scheduleData: any[] = []

        backendData.forEach((shift) => {
            let location = locations.find((loc) => loc.name === shift.Site_Name)
            if (!location) {
                location = {
                    id: locations.length + 1,
                    name: shift.Site_Name,
                }
                locations.push(location)
            }
            const formattedTime = `${convertTo12Hour(shift.schedule_start)} - ${convertTo12Hour(shift.schedule_end)}`
            let timeSlot = timeSlots.find((slot) => slot.time === formattedTime && slot.locationid === location.id)
            if (!timeSlot) {
                timeSlot = {
                    locationid: location.id,
                    id: timeSlots.length + 1,
                    time: formattedTime,
                }
                timeSlots.push(timeSlot)
            }
            scheduleData.push({
                id: shift.ShiftID.toString(),
                locationId: location.id,
                timeSlotId: timeSlot.id,
                day: shift.shift_date,
                color: shift.Site_Color,
                isPremium: shift.Accept_status === "Accepted",
                patrol: shift.Service_Name,
                staff: shift.Customer_Name,
                notes: shift.note,
                create_by: shift.created_by_first_name + ' ' + shift.created_by_last_name,
            })
        })

        return { locations, timeSlots, scheduleData }
    }

    const convertTo12Hour = (timeStr: string) => {
        const [hour, minute] = timeStr.split(":").map(Number)
        const period = hour >= 12 ? "pm" : "am"
        const formattedHour = hour % 12 || 12
        return `${formattedHour}:${minute.toString().padStart(2, "0")} ${period}`
    }

    const getList = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            queryParams.append("filter[Guard_Schedule.delete_status]", "0"); // Add delete_status filter
            queryParams.append(
                "filter[BETWEENshift_date]",
                `${formatDate(selectedRange.start)},${formatDate(selectedRange.end)}`
            );
            // Apply additional filters dynamically
            const url = `${endpoint}?route=User/Shift/List&${queryParams.toString()}`;

            const { data } = await axios.get(url, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.status === true) {
                if (data.Data.length === 0) {
                    setLocations([]);
                    setTimeSlots([]);
                    setScheduleData([]);
                } else {
                    const transformedData = transformBackendData(data.Data);
                    setLocations(transformedData.locations);
                    setTimeSlots(transformedData.timeSlots);
                    setScheduleData(transformedData.scheduleData);
                    setFullData(data.Data);
                }
            }
        } catch (error) {
            console.error("Error fetching the list:", error);
        } finally {
            setLoading(false);
        }
    };

    const generateDays = (start: Date, end: Date) => {
        const days = []
        const currentDate = new Date(start)

        while (currentDate <= end) {
            const tempDate = new Date(currentDate)

            days.push({
                day: tempDate.toLocaleString("en-US", { weekday: "short" }), // Mon, Tue, Wed...
                vailddate:
                    tempDate.getFullYear() +
                    "-" +
                    String(tempDate.getMonth() + 1).padStart(2, "0") +
                    "-" +
                    String(tempDate.getDate()).padStart(2, "0"), // YYYY-MM-DD (Local Time)
                date: tempDate.toLocaleString("en-US", { month: "short", day: "numeric" }), // Mar 24, Mar 25...
            })

            currentDate.setDate(currentDate.getDate() + 1) // Move to the next day
        }

        return days
    }

    useEffect(() => {
        setdays(generateDays(selectedRange.start, selectedRange.end))
        getList()
    }, [selectedRange])

    // end shift backend data manage


    // Create drag image element on mount
    useEffect(() => {
        const div = document.createElement("div")
        div.className = "fixed top-0 left-0 -translate-x-full bg-white border border-gray-300 rounded shadow-md p-2 text-sm"
        div.textContent = "Dragging shift..."
        document.body.appendChild(div)
        dragImage.current = div

        // Create selection box
        const selBox = document.createElement("div")
        selBox.className =
            "fixed top-0 left-0 bg-blue-200 bg-opacity-30 border border-blue-500 pointer-events-none z-50 hidden"
        document.body.appendChild(selBox)
        selectionBox.current = selBox

        // Load undo/redo history from localStorage
        const savedUndoStack = localStorage.getItem("scheduleUndoStack")
        const savedRedoStack = localStorage.getItem("scheduleRedoStack")

        if (savedUndoStack) {
            try {
                setUndoStack(JSON.parse(savedUndoStack))
            } catch (e) {
                console.error("Failed to parse undo stack from localStorage")
            }
        }

        if (savedRedoStack) {
            try {
                setRedoStack(JSON.parse(savedRedoStack))
            } catch (e) {
                console.error("Failed to parse redo stack from localStorage")
            }
        }

        return () => {
            document.body.removeChild(div)
            document.body.removeChild(selBox)
        }
    }, [])

    // Save undo/redo stacks to localStorage when they change
    useEffect(() => {
        localStorage.setItem("scheduleUndoStack", JSON.stringify(undoStack))
    }, [undoStack])

    useEffect(() => {
        localStorage.setItem("scheduleRedoStack", JSON.stringify(redoStack))
    }, [redoStack])



    // Function to add action to undo stack
    const addToUndoStack = (action: ActionType) => {
        setUndoStack((prev) => [...prev, action])
        setRedoStack([])
    }

    // Undo function
    const undo = () => {
        if (undoStack.length === 0) return

        const action = undoStack[undoStack.length - 1]
        setUndoStack((prev) => prev.slice(0, -1))

        // Apply the reverse of the action
        switch (action.type) {
            case "ADD_SHIFT":
                setScheduleData((prev) => prev.filter((shift) => shift.id !== action.shift.id))
                setRedoStack((prev) => [...prev, action])
                break
            case "DELETE_SHIFT":
                setScheduleData((prev) => [...prev, action.shift])
                setRedoStack((prev) => [...prev, action])
                break
            case "MOVE_SHIFT":
                setScheduleData((prev) => {
                    const newData = [...prev]
                    const index = newData.findIndex((shift) => shift.id === action.shift.id)
                    if (index !== -1) {
                        newData[index] = action.prevShift
                    }
                    return newData
                })
                setRedoStack((prev) => [...prev, action])
                break
            case "PASTE_SHIFTS":
                setScheduleData((prev) => {
                    return prev.filter((shift) => !action.shifts.some((s) => s.id === shift.id))
                })
                setRedoStack((prev) => [...prev, action])
                break
            case "BULK_EDIT":
                setScheduleData((prev) => {
                    const newData = [...prev]
                    action.newShifts.forEach((newShift) => {
                        const index = newData.findIndex((shift) => shift.id === newShift.id)
                        if (index !== -1) {
                            const originalShift = action.prevShifts.find((s) => s.id === newShift.id)
                            if (originalShift) {
                                newData[index] = originalShift
                            }
                        }
                    })
                    return newData
                })
                setRedoStack((prev) => [...prev, action])
                break
        }

        setShowUndoToast(true)
        setTimeout(() => setShowUndoToast(false), 3000)
    }

    // Redo function
    const redo = () => {
        if (redoStack.length === 0) return

        const action = redoStack[redoStack.length - 1]
        setRedoStack((prev) => prev.slice(0, -1))

        // Apply the action
        switch (action.type) {
            case "ADD_SHIFT":
                setScheduleData((prev) => [...prev, action.shift])
                break
            case "DELETE_SHIFT":
                setScheduleData((prev) => prev.filter((shift) => shift.id !== action.shift.id))
                break
            case "MOVE_SHIFT":
                setScheduleData((prev) => {
                    const newData = [...prev]
                    const index = newData.findIndex((shift) => shift.id === action.prevShift.id)
                    if (index !== -1) {
                        newData[index] = action.shift
                    }
                    return newData
                })
                break
            case "PASTE_SHIFTS":
                setScheduleData((prev) => [...prev, ...action.shifts])
                break
            case "BULK_EDIT":
                setScheduleData((prev) => {
                    const newData = [...prev]
                    action.prevShifts.forEach((prevShift) => {
                        const index = newData.findIndex((shift) => shift.id === prevShift.id)
                        if (index !== -1) {
                            const newShift = action.newShifts.find((s) => s.id === prevShift.id)
                            if (newShift) {
                                newData[index] = newShift
                            }
                        }
                    })
                    return newData
                })
                break
        }

        setUndoStack((prev) => [...prev, action])
        setShowRedoToast(true)
        setTimeout(() => setShowRedoToast(false), 3000)
    }

    // Function to toggle location expand/collapse
    const toggleLocation = (locationId: string) => {
        setExpandedLocations((prev) => ({
            ...prev,
            [locationId]: !prev[locationId],
        }))
    }

    // Function to get schedule items for a specific location, time slot and day
    const getScheduleItems = (locationId: string, timeSlotId: number, day: string) => {
        // Find the day object to get the full date
        const dayObj = days.find((d) => d.day === day)

        return scheduleData.filter((item) => {
            // Basic filtering by location, time slot, and day
            const basicMatch = item.locationId === locationId && item.timeSlotId === timeSlotId && item.day === day

            // If we have date information, also check that
            if (dayObj?.fullDate && item.date) {
                const itemDate = new Date(item.date)
                return (
                    basicMatch &&
                    itemDate.getDate() === dayObj.fullDate.getDate() &&
                    itemDate.getMonth() === dayObj.fullDate.getMonth() &&
                    itemDate.getFullYear() === dayObj.fullDate.getFullYear()
                )
            }

            return basicMatch
        })
    }


    // Optimized drag and drop handlers
    const handleDragStart = (e: React.DragEvent, item: Shift) => {
        e.stopPropagation()

        // Set data transfer
        if (e.dataTransfer) {
            e.dataTransfer.setData("text/plain", JSON.stringify(item))
            e.dataTransfer.effectAllowed = "move"

            // Use custom drag image
            if (dragImage.current) {
                dragImage.current.textContent = `Moving: ${item.staff} (${item.patrol})`
                e.dataTransfer.setDragImage(dragImage.current, 20, 20)
            }
        }

        setDraggedItem(item)
        setIsDragging(true)

        // Clear any existing selection
        if (!e.ctrlKey && !e.shiftKey) {
            setSelectedCells([])
        }
    }

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault()
        dragCounter.current += 1
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        dragCounter.current -= 1
    }

    const handleDragOver = (e: React.DragEvent, locationId: string, timeSlotId: number, day: string) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
    }

    const handleDrop = (e: React.DragEvent, locationId: string, timeSlotId: number, day: string) => {
        e.preventDefault()
        e.stopPropagation()

        dragCounter.current = 0

        if (draggedItem) {
            // Find the day object to get the full date
            const dayObj = days.find((d) => d.day === day)
            const date = dayObj?.fullDate ? new Date(dayObj.fullDate).toISOString() : undefined

            // Create a copy of the schedule data
            const newScheduleData = [...scheduleData]

            // Find the index of the dragged item
            const draggedIndex = newScheduleData.findIndex((item) => item.id === draggedItem.id)

            if (draggedIndex !== -1) {
                // Store the previous state for undo
                const prevShift = { ...newScheduleData[draggedIndex] }

                // Update the dragged item with new location, time slot, day, and date
                newScheduleData[draggedIndex] = {
                    ...newScheduleData[draggedIndex],
                    locationId,
                    timeSlotId,
                    day,
                    date,
                }

                // Update the schedule data
                setScheduleData(newScheduleData)

                // Add to undo stack
                addToUndoStack({
                    type: "MOVE_SHIFT",
                    shift: newScheduleData[draggedIndex],
                    prevShift,
                })

                // Show a toast notification
                const toast = document.createElement("div")
                toast.className = "fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50"
                toast.textContent = `Shift moved to ${day}, ${locationId}, ${timeSlotId}`
                document.body.appendChild(toast)
                setTimeout(() => {
                    document.body.removeChild(toast)
                }, 3000)
            }

            setDraggedItem(null)
            setIsDragging(false)
        }
    }

    // Rectangle selection handlers
    const handleTableMouseDown = (e: React.MouseEvent) => {
        // Only start selection if left mouse button is pressed and not on a shift card
        if (e.button !== 0 || (e.target as HTMLElement).closest(".shift-card")) return

        // Get table position
        const tableRect = tableRef.current?.getBoundingClientRect()
        if (!tableRect) return

        // Set selection start coordinates relative to table
        setSelectionRect({
            startX: e.clientX - tableRect.left,
            startY: e.clientY - tableRect.top,
            endX: e.clientX - tableRect.left,
            endY: e.clientY - tableRect.top,
            isSelecting: true,
        })

        // Show selection box
        if (selectionBox.current) {
            selectionBox.current.style.display = "block"
            selectionBox.current.style.left = `${e.clientX}px`
            selectionBox.current.style.top = `${e.clientY}px`
            selectionBox.current.style.width = "0"
            selectionBox.current.style.height = "0"
        }

        // Clear existing selection if not holding shift
        if (!e.shiftKey) {
            setSelectedCells([])
        }

        setSelectionMode("rectangle")
    }

    const handleTableMouseMove = (e: React.MouseEvent) => {
        if (!selectionRect.isSelecting || !tableRef.current) return

        const tableRect = tableRef.current.getBoundingClientRect()

        // Update selection end coordinates
        setSelectionRect((prev) => ({
            ...prev,
            endX: e.clientX - tableRect.left,
            endY: e.clientY - tableRect.top,
        }))

        // Update selection box position and size
        if (selectionBox.current) {
            const left = Math.min(selectionRect.startX, e.clientX - tableRect.left)
            const top = Math.min(selectionRect.startY, e.clientY - tableRect.top)
            const width = Math.abs(e.clientX - tableRect.left - selectionRect.startX)
            const height = Math.abs(e.clientY - tableRect.top - selectionRect.startY)

            selectionBox.current.style.left = `${left + tableRect.left}px`
            selectionBox.current.style.top = `${top + tableRect.top}px`
            selectionBox.current.style.width = `${width}px`
            selectionBox.current.style.height = `${height}px`
        }

        // Find all shift cards within the selection rectangle
        const shiftCards = document.querySelectorAll(".shift-card")
        const selectedIds: string[] = []

        shiftCards.forEach((card) => {
            const cardRect = card.getBoundingClientRect()
            const cardLeft = cardRect.left - tableRect.left
            const cardTop = cardRect.top - tableRect.top
            const cardRight = cardLeft + cardRect.width
            const cardBottom = cardTop + cardRect.height

            // Calculate selection rectangle coordinates
            const selLeft = Math.min(selectionRect.startX, selectionRect.endX)
            const selTop = Math.min(selectionRect.startY, selectionRect.endY)
            const selRight = Math.max(selectionRect.startX, selectionRect.endX)
            const selBottom = Math.max(selectionRect.startY, selectionRect.endY)

            // Check if card intersects with selection rectangle
            if (cardRight >= selLeft && cardLeft <= selRight && cardBottom >= selTop && cardTop <= selBottom) {
                const cellId = card.getAttribute("data-cell-id")
                if (cellId) {
                    selectedIds.push(cellId)
                }
            }
        })

        // Update selected cells
        if (e.shiftKey) {
            setSelectedCells((prev) => {
                const newSelection = [...prev]
                selectedIds.forEach((id) => {
                    if (!newSelection.includes(id)) {
                        newSelection.push(id)
                    }
                })
                return newSelection
            })
        } else {
            setSelectedCells(selectedIds)
        }
    }

    const handleTableMouseUp = () => {
        // End selection
        setSelectionRect((prev) => ({
            ...prev,
            isSelecting: false,
        }))

        // Hide selection box
        if (selectionBox.current) {
            selectionBox.current.style.display = "none"
        }
    }

    // Cell-based selection handlers
    const handleCellMouseDown = (e: React.MouseEvent, cellId: string, hasItem: boolean) => {
        // Only allow selection on cells that have shifts
        if (!hasItem) return

        // If shift key is pressed, add to existing selection
        if (e.shiftKey) {
            setSelectedCells((prev) => {
                if (prev.includes(cellId)) {
                    return prev.filter((id) => id !== cellId)
                } else {
                    return [...prev, cellId]
                }
            })
        } else {
            // Start new selection
            setIsSelecting(true)
            setSelectionStart(cellId)
            setSelectedCells([cellId])
        }

        setSelectionMode("cell")
        e.stopPropagation()
    }

    const handleCellMouseEnter = (cellId: string, hasItem: boolean) => {
        if (isSelecting && selectionStart && hasItem && selectionMode === "cell") {
            // Add the cell to the selection only if it has an item
            if (!selectedCells.includes(cellId)) {
                setSelectedCells((prev) => [...prev, cellId])
            }
        }
    }

    const handleCellMouseUp = () => {
        setIsSelecting(false)
        setSelectionStart(null)
    }

    // Improved copy and paste handlers
    const copySelectedShiftsFunc = () => {
        const selectedShifts = scheduleData.filter((item) => {
            const cellId = `${item.locationId}-${item.timeSlotId}-${item.day}`
            return selectedCells.includes(cellId)
        })

        if (selectedShifts.length === 0) {
            // Show a message when no shifts are selected
            setShowCopyToast(true)
            setCopiedShifts([])
            setTimeout(() => setShowCopyToast(false), 3000)
            return
        }

        // Store complete shift data including all attributes
        setCopiedShifts(
            selectedShifts.map((shift) => ({
                ...shift,
                originalWeek: currentWeekStart.toISOString(), // Store the original week for reference
            })),
        )

        // Show success toast notification with animation
        setShowCopyToast(true)
        setTimeout(() => setShowCopyToast(false), 3000)

        // Highlight the selected cells briefly to provide visual feedback
        const selectedElements = document.querySelectorAll('.shift-card[data-selected="true"]')
        selectedElements.forEach((el) => {
            el.classList.add("copy-flash-animation")
            setTimeout(() => {
                el.classList.remove("copy-flash-animation")
            }, 500)
        })
    }

    const pasteShiftsFunc = (targetDay: string, targetLocationId?: string, targetTimeSlotId?: number) => {
        if (copiedShifts.length === 0) {
            // Show a message when no shifts are available for pasting
            setShowPasteToast(true)
            setTimeout(() => setShowPasteToast(false), 3000)
            return
        }

        // Find the day object to get the full date
        const dayObj = days.find((d) => d.day === targetDay)
        if (!dayObj?.fullDate) return

        const targetDate = new Date(dayObj.fullDate)
        const originalWeekStart = copiedShifts[0].originalWeek ? new Date(copiedShifts[0].originalWeek) : currentWeekStart

        // Calculate the day difference between original and target week
        const weekDiff = Math.floor((targetDate.getTime() - originalWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000))

        // Create new shifts with updated day, date, and preserving all attributes
        const newShifts = copiedShifts
            .map((shift) => {
                // Find the original day index in the week
                const originalDayIndex = days.findIndex((d) => d.day === shift.day)
                if (originalDayIndex === -1) return null

                // If pasting to a specific day, use that day
                // Otherwise, maintain the same day of week pattern
                const newDayIndex =
                    targetLocationId && targetTimeSlotId ? days.findIndex((d) => d.day === targetDay) : originalDayIndex

                if (newDayIndex === -1) return null

                // Calculate the new date based on the week difference
                const newDate: any = dayObj.fullDate ? new Date(dayObj.fullDate) : new Date()
                newDate.setDate(newDate.getDate() + (newDayIndex - days.findIndex((d) => d.day === targetDay)))

                const newShift = {
                    ...shift,
                    id: `${shift.id}-copy-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, // Generate a unique ID
                    day: days[newDayIndex].day,
                    date: newDate.toISOString(),
                    originalWeek: undefined, // Remove the originalWeek property
                }

                // If target location and time slot are provided, update those too
                if (targetLocationId) newShift.locationId = targetLocationId
                if (targetTimeSlotId) newShift.timeSlotId = targetTimeSlotId

                return newShift
            })
            .filter(Boolean) as Shift[]

        if (newShifts.length === 0) return

        // Add the new shifts to the schedule data
        setScheduleData((prev) => [...prev, ...newShifts])

        // Add to undo stack
        addToUndoStack({
            type: "PASTE_SHIFTS",
            shifts: newShifts,
        })

        // Show success toast notification
        setShowPasteToast(true)
        setTimeout(() => setShowPasteToast(false), 3000)

        // Clear selection after paste
        setSelectedCells([])

        // Highlight the newly pasted shifts briefly
        setTimeout(() => {
            newShifts.forEach((shift) => {
                const cellId = `${shift.locationId}-${shift.timeSlotId}-${shift.day}`
                const shiftElement = document.querySelector(`.shift-card[data-cell-id="${cellId}"]`)
                if (shiftElement) {
                    shiftElement.classList.add("paste-flash-animation")
                    setTimeout(() => {
                        shiftElement.classList.remove("paste-flash-animation")
                    }, 800)
                }
            })
        }, 100)
    }

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const handlePrevMonth = () => {
        setCurrentMonth((prevMonth) => (prevMonth === 0 ? 11 : prevMonth - 1))
        setCurrentYear((prevYear) => (currentMonth === 0 ? prevYear - 1 : prevYear))
    }

    const handleNextMonth = () => {
        setCurrentMonth((prevMonth) => (prevMonth === 11 ? 0 : prevMonth + 1))
        setCurrentYear((prevYear) => (currentMonth === 11 ? prevYear + 1 : prevYear))
    }

    const generateCalendarDays = (year: number, month: number) => {
        const firstDayOfMonth = new Date(year, month, 1)
        const lastDayOfMonth = new Date(year, month + 1, 0)
        const daysInMonth = lastDayOfMonth.getDate()
        const startingDayOfWeek = firstDayOfMonth.getDay() // 0 (Sunday) to 6 (Saturday)
        const calendarDays = []

        // Adjust to start from Monday (1) instead of Sunday (0)
        const adjustedStartingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1

        // Add days from the previous month to fill the first week
        for (let i = 0; i < adjustedStartingDayOfWeek; i++) {
            const prevMonthLastDay = new Date(year, month, 0).getDate()
            calendarDays.push({
                day: prevMonthLastDay - adjustedStartingDayOfWeek + i + 1,
                month: month - 1 < 0 ? 11 : month - 1,
                year: month - 1 < 0 ? year - 1 : year,
                isCurrentMonth: false,
            })
        }

        // Add days from the current month
        for (let i = 1; i <= daysInMonth; i++) {
            calendarDays.push({
                day: i,
                month: month,
                year: year,
                isCurrentMonth: true,
            })
        }

        // Add days from the next month to fill the last week
        let nextMonthDay = 1
        while (calendarDays.length % 7 !== 0) {
            calendarDays.push({
                day: nextMonthDay,
                month: month + 1 > 11 ? 0 : month + 1,
                year: month + 1 > 11 ? year + 1 : year,
                isCurrentMonth: false,
            })
            nextMonthDay++
        }

        return calendarDays
    }

    const isDateInSelectedWeek = (day: number, month: number, year: number) => {
        const selectedDate = new Date(year, month, day)
        const weekStartDate = new Date(currentWeekStart)
        const weekEndDate = new Date(weekStartDate)
        weekEndDate.setDate(weekStartDate.getDate() + 6)

        return selectedDate >= weekStartDate && selectedDate <= weekEndDate
    }


    const handleContextMenu = (e: React.MouseEvent, day: string, locationId: string, timeSlotId: number) => {
        e.preventDefault()
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            day,
            locationId,
            timeSlotId,
        })
    }

    const createNewShift = (locationId: string, timeSlotId: number, day: string) => {
        // Find the day object to get the full date
        const dayObj = days.find((d) => d.day === day)
        const date = dayObj?.fullDate ? new Date(dayObj.fullDate).toISOString() : undefined

        const newShift = {
            id: `new-shift-${Date.now()}`,
            locationId,
            timeSlotId,
            day,
            date,
            isPremium: false,
            patrol: "Patrol",
            staff: "OPEN",
        }

        setScheduleData((prev) => [...prev, newShift])
        addToUndoStack({ type: "ADD_SHIFT", shift: newShift })
    }

    // Enhance the keyboard shortcuts for copy and paste

    // Replace the keyboard shortcuts useEffect with this enhanced version:
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Copy with Ctrl+C
            if (e.ctrlKey && e.key === "c") {
                e.preventDefault() // Prevent default browser copy
                copySelectedShiftsFunc()
            }

            // Paste with Ctrl+V
            if (e.ctrlKey && e.key === "v") {
                e.preventDefault() // Prevent default browser paste

                // If no shifts are copied, show a notification
                if (copiedShifts.length === 0) {
                    setShowPasteToast(true)
                    setTimeout(() => setShowPasteToast(false), 3000)
                    return
                }

                // Find the first selected cell to paste to, or use Monday as default
                if (selectedCells.length > 0) {
                    const [locationId, timeSlotId, day] = selectedCells[0].split("-")
                    pasteShiftsFunc(day, locationId, Number.parseInt(timeSlotId))
                } else {
                    // Paste to the first day of the current week if no cell is selected
                    pasteShiftsFunc(days[0].day)
                }
            }

            // Undo with Ctrl+Z
            if (e.ctrlKey && e.key === "z" && !e.shiftKey) {
                e.preventDefault()
                undo()
            }

            // Redo with Ctrl+Y or Ctrl+Shift+Z
            if ((e.ctrlKey && e.key === "y") || (e.ctrlKey && e.shiftKey && e.key === "z")) {
                e.preventDefault()
                redo()
            }

            // Select all with Ctrl+A
            if (e.ctrlKey && e.key === "a") {
                e.preventDefault()

                // Find all cells with shifts and select them
                const shiftCells = scheduleData.map((shift) => `${shift.locationId}-${shift.timeSlotId}-${shift.day}`)

                setSelectedCells([...new Set(shiftCells)])
            }

            // Escape key to close calendar and context menu
            if (e.key === "Escape") {
                setShowCalendar(false)
                setContextMenu(null)
            }
        }

        window.addEventListener("keydown", handleKeyDown)

        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [selectedCells, copiedShifts, days])

    // Update the shift card rendering to include the data-selected attribute for animations
    // In the shift card JSX, update the div with data-cell-id to include data-selected:

    return (
        <div className="flex flex-col w-full bg-white border border-gray-200 rounded-md shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-2 border-b border-gray-200">
                {/* Date range selector */}


                {/* Schedule selector */}
                <div className="flex items-center">
                    <div className="flex items-center border border-gray-300 rounded-md mr-2">
                        <select
                            className="px-3 py-1 bg-white outline-none"
                            value={selectedSchedule}
                            onChange={(e) => setSelectedSchedule(e.target.value)}
                        >
                            <option>Main Schedule</option>
                            <option>Alternative Schedule</option>
                        </select>
                        <button className="p-1 border-l border-gray-300">
                            <Settings className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                    <button className="p-1 mx-1 text-gray-500 hover:bg-gray-100 rounded-md">
                        <Layers className="w-5 h-5" />
                    </button>
                </div>

                {/* Action buttons */}
                <div className="flex items-center">
                    <button className="p-1 mx-1 text-gray-500 hover:bg-gray-100 rounded-md">
                        <Calendar className="w-5 h-5" />
                    </button>
                    <button
                        className="p-1 mx-1 text-gray-500 hover:bg-gray-100 rounded-md"
                        onClick={undo}
                        disabled={undoStack.length === 0}
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo className={`w-5 h-5 ${undoStack.length === 0 ? "opacity-50" : ""}`} />
                    </button>
                    <button
                        className="p-1 mx-1 text-gray-500 hover:bg-gray-100 rounded-md"
                        onClick={redo}
                        disabled={redoStack.length === 0}
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo className={`w-5 h-5 ${redoStack.length === 0 ? "opacity-50" : ""}`} />
                    </button>

                    <div className="flex items-center border border-gray-300 rounded-md mx-2">
                        <span className="px-3 py-1 text-gray-500">0 filters selected</span>
                        <button className="p-1 border-l border-gray-300">
                            <Filter className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <button className="flex items-center px-3 py-1 mx-1 text-gray-700 border border-gray-300 rounded-md">
                        <Wrench className="w-4 h-4 mr-2" />
                        <span>Schedule Tools</span>
                    </button>

                    <button className="flex items-center px-3 py-1 mx-1 text-gray-700 border border-gray-300 rounded-md">
                        <Shirt className="w-4 h-4 mr-2" />
                        <span>Shift Tools</span>
                    </button>
                </div>
            </div>

            {/* Calendar Popup */}
            {showCalendar && (
                <div className="absolute top-16 left-4 z-50 bg-white border border-gray-200 rounded-md shadow-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex space-x-2">
                            <button
                                className={`px-4 py-2 rounded ${calendarView === "Day" ? "bg-orange-500 text-white" : "bg-gray-100"}`}
                                onClick={() => setCalendarView("Day")}
                            >
                                Day
                            </button>
                            <button
                                className={`px-4 py-2 rounded ${calendarView === "Week" ? "bg-orange-500 text-white" : "bg-gray-100"}`}
                                onClick={() => setCalendarView("Week")}
                            >
                                Week
                            </button>
                            <button
                                className={`px-4 py-2 rounded ${calendarView === "Work week" ? "bg-orange-500 text-white" : "bg-gray-100"}`}
                                onClick={() => setCalendarView("Work week")}
                            >
                                Work week
                            </button>
                            <button
                                className={`px-4 py-2 rounded ${calendarView === "Month" ? "bg-orange-500 text-white" : "bg-gray-100"}`}
                                onClick={() => setCalendarView("Month")}
                            >
                                Month
                            </button>
                            <button
                                className={`px-4 py-2 rounded ${calendarView === "Custom" ? "bg-orange-500 text-white" : "bg-gray-100"}`}
                                onClick={() => setCalendarView("Custom")}
                            >
                                Custom
                            </button>
                        </div>
                        <button
                            className="px-4 py-2 bg-gray-100 rounded"
                            onClick={() => {
                                const today = new Date()
                                setCurrentMonth(today.getMonth())
                                setCurrentYear(today.getFullYear())
                            }}
                        >
                            Today
                        </button>
                    </div>

                    <div className="flex space-x-4">
                        {/* Current Month */}
                        <div className="w-[350px]">
                            <div className="flex justify-between items-center mb-2">
                                <button onClick={handlePrevMonth}>
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <h3 className="text-lg font-medium">
                                    {monthNames[currentMonth]} {currentYear}
                                </h3>
                                <button onClick={handleNextMonth}>
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                                <div className="text-center font-medium text-sm py-1">Mo</div>
                                <div className="text-center font-medium text-sm py-1">Tu</div>
                                <div className="text-center font-medium text-sm py-1">We</div>
                                <div className="text-center font-medium text-sm py-1">Th</div>
                                <div className="text-center font-medium text-sm py-1">Fr</div>
                                <div className="text-center font-medium text-sm py-1">Sa</div>
                                <div className="text-center font-medium text-sm py-1">Su</div>

                                {generateCalendarDays(currentYear, currentMonth).map((day, index) => {
                                    const isSelected = isDateInSelectedWeek(day.day, day.month, day.year)
                                    const isWeekStart = day.day % 7 === 1 || index % 7 === 0

                                    return (
                                        <div
                                            key={index}
                                            className={`
                        text-center py-2 cursor-pointer border border-transparent hover:border-gray-300
                        ${!day.isCurrentMonth ? "text-gray-400" : ""}
                        ${isSelected ? "bg-orange-500 text-white" : ""}
                      `}

                                        >
                                            {day.day}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Next Month */}
                        <div className="w-[350px]">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-medium">
                                    {monthNames[(currentMonth + 1) % 12]} {currentMonth === 11 ? currentYear + 1 : currentYear}
                                </h3>
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                                <div className="text-center font-medium text-sm py-1">Mo</div>
                                <div className="text-center font-medium text-sm py-1">Tu</div>
                                <div className="text-center font-medium text-sm py-1">We</div>
                                <div className="text-center font-medium text-sm py-1">Th</div>
                                <div className="text-center font-medium text-sm py-1">Fr</div>
                                <div className="text-center font-medium text-sm py-1">Sa</div>
                                <div className="text-center font-medium text-sm py-1">Su</div>

                                {generateCalendarDays(currentMonth === 11 ? currentYear + 1 : currentYear, (currentMonth + 1) % 12).map(
                                    (day, index) => (
                                        <div
                                            key={index}
                                            className={`
                      text-center py-2 cursor-pointer border border-transparent hover:border-gray-300
                      ${!day.isCurrentMonth ? "text-gray-400" : ""}
                    `}
                                        >
                                            {day.day}
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mt-4 space-x-2">
                        <button className="px-4 py-2 border border-gray-300 rounded" onClick={() => setShowCalendar(false)}>
                            Cancel
                        </button>
                        <button className="px-4 py-2 bg-orange-500 text-white rounded" onClick={() => setShowCalendar(false)}>
                            Apply
                        </button>
                    </div>
                </div>
            )}

            {/* Copy/Paste Toolbar */}
            <div className="flex items-center p-2 bg-gray-100 border-b border-gray-200 copy-paste-toolbar">
                <button
                    onClick={copySelectedShiftsFunc}
                    className="flex items-center px-3 py-1 mr-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={selectedCells.length === 0}
                >
                    <Copy className="w-4 h-4 mr-2" />
                    <span>Copy Selected ({selectedCells.length})</span>
                </button>

                <button
                    onClick={() => pasteShiftsFunc("Mon")}
                    className="flex items-center px-3 py-1 mr-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={copiedShifts.length === 0}
                >
                    <Clipboard className="w-4 h-4 mr-2" />
                    <span>Paste to Next Week</span>
                </button>

                <div className="ml-4 text-sm text-gray-500">
                    <span>
                        Tip: Drag to select multiple shifts, then use Ctrl+C to copy and Ctrl+V to paste. Ctrl+Z to undo, Ctrl+Y to
                        redo.
                    </span>
                </div>
            </div>

            {/* Schedule Grid or Empty State */}
            {showEmptyState ? (
                <div className="flex flex-col items-center justify-center p-16 text-center">
                    <div className="text-gray-500 mb-8">No shifts found</div>

                    <div className="flex space-x-16">
                        <div className="flex flex-col items-center">
                            <button
                                className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 hover:bg-gray-200"
                                onClick={() => {
                                    // Create a new shift for the first day of the week
                                    createNewShift("11", 1, days[0].day)
                                    setShowEmptyState(false)
                                }}
                            >
                                <Plus className="w-8 h-8 text-gray-500" />
                            </button>
                            <span className="text-sm text-gray-600">Create a new shift</span>
                        </div>

                        <div className="flex flex-col items-center">
                            <button
                                className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 hover:bg-gray-200"

                            >
                                <FileText className="w-8 h-8 text-gray-500" />
                            </button>
                            <span className="text-sm text-gray-600">Apply shift template</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div
                    className="overflow-auto schedule-table"
                    ref={tableRef}
                    onMouseDown={handleTableMouseDown}
                    onMouseMove={handleTableMouseMove}
                    onMouseUp={handleTableMouseUp}
                    onMouseLeave={handleTableMouseUp}
                >
                    <table className="w-full border-collapse">
                        {/* Days header */}
                        <thead>
                            <tr className="bg-white">
                                <th className="w-48 p-2 border-r border-b border-gray-200 text-left">
                                    <div className="flex items-center">
                                        <input type="checkbox" className="mr-2" />
                                        <span className="text-sm font-medium text-gray-600">Scheduled time</span>
                                    </div>
                                </th>
                                {days.map((day, index) => (
                                    <th key={index} className="p-2 border-r border-b border-gray-200 text-left relative min-w-[180px]">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">
                                                {day.day}, <span className="text-gray-600">{day.date}</span>
                                            </span>
                                            <button className="text-gray-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                        {index === 1 && <div className="absolute top-0 bottom-0 right-0 w-0.5 bg-red-500"></div>}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {/* Location sections */}
                            {locations.map((location, locationIndex) => (
                                <React.Fragment key={location.id}>
                                    {/* Location header */}
                                    <tr className="bg-gray-50">
                                        <td colSpan={8} className="p-2 border-b border-gray-200 text-left">
                                            <div className="flex items-center">
                                                <button className="mr-2" onClick={() => toggleLocation(location.id)}>
                                                    {expandedLocations[location.id] ? (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <span className="font-medium">{location.name}</span>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Time slots for this location */}
                                    {expandedLocations[location.id] &&
                                        timeSlots
                                            .filter((slot) => {

                                                return false
                                            })
                                            .map((timeSlot, timeIndex) => (
                                                <tr key={`${location.id}-${timeSlot.id}`} className="border-b border-gray-200">
                                                    {/* Time slot */}
                                                    <td className="p-2 border-r border-gray-200 text-left relative">
                                                        <div className="flex items-center">
                                                            <button className="absolute left-0 top-1/2 transform -translate-y-1/2 ml-1">
                                                                <svg
                                                                    className="w-4 h-4 text-gray-400"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth="2"
                                                                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                                                    />
                                                                </svg>
                                                            </button>
                                                            <span className="ml-6 text-sm text-gray-600">{timeSlot.time}</span>
                                                        </div>
                                                    </td>

                                                    {/* Schedule cells for each day */}
                                                    {days.map((day, dayIndex) => {
                                                        const scheduleItems = getScheduleItems(location.id, timeSlot.id, day.vailddate)
                                                        const hasItem = scheduleItems.length > 0
                                                        const item = scheduleItems[0]
                                                        const cellId = `${location.id}-${timeSlot.id}-${day.day}`
                                                        const isSelected = selectedCells.includes(cellId)

                                                        return (
                                                            <td
                                                                key={cellId}
                                                                className={`p-2 border-r border-gray-200 align-top relative`}
                                                                onDragEnter={handleDragEnter}
                                                                onDragLeave={handleDragLeave}
                                                                onDragOver={(e) => handleDragOver(e, location.id, timeSlot.id, day.day)}
                                                                onDrop={(e) => handleDrop(e, location.id, timeSlot.id, day.day)}
                                                                onMouseDown={(e) => handleCellMouseDown(e, cellId, hasItem)}
                                                                onMouseEnter={() => handleCellMouseEnter(cellId, hasItem)}
                                                                onMouseUp={handleCellMouseUp}
                                                                onContextMenu={(e) => handleContextMenu(e, day.day, location.id, timeSlot.id)}
                                                            >
                                                                {hasItem ? (
                                                                    <div
                                                                        data-cell-id={cellId}
                                                                        data-selected={isSelected ? "true" : "false"}
                                                                        className={`p-2 rounded border ${isSelected ? "border-blue-500 shadow-md" : "border-gray-200"
                                                                            } shift-card ${item.darkBg
                                                                                ? "bg-gray-800 text-white"
                                                                                : item.isPremium
                                                                                    ? "bg-red-600 text-white"
                                                                                    : timeSlot.id === 4
                                                                                        ? "bg-blue-100"
                                                                                        : "bg-white"
                                                                            } ${isSelected ? "ring-2 ring-blue-500" : ""} cursor-move relative transition-all duration-150`}
                                                                        draggable
                                                                        onDragStart={(e) => handleDragStart(e, item)}
                                                                    >
                                                                        {item.isPremium && (
                                                                            <div className="absolute top-2 left-2 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                                                                <DollarSign className="w-4 h-4" />
                                                                            </div>
                                                                        )}
                                                                        {item.hasAlert && (
                                                                            <div className="absolute top-2 left-2 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                                                                <Info className="w-4 h-4" />
                                                                            </div>
                                                                        )}
                                                                        <div className="text-sm font-medium">{timeSlot.time}</div>
                                                                        <div className="text-sm">{item.patrol}</div>
                                                                        <div className="text-sm">{item.staff}</div>
                                                                        <div className="absolute bottom-2 right-2">
                                                                            {isSelected && (
                                                                                <div className="bg-blue-100 rounded-full p-1 border border-blue-300">
                                                                                    <Check className="w-4 h-4 text-blue-500" />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div
                                                                        className="h-full w-full min-h-[80px] flex items-center justify-center"
                                                                        onDoubleClick={() => createNewShift(location.id, timeSlot.id, day.day)}
                                                                    >
                                                                        <button
                                                                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                                                                            onClick={() => createNewShift(location.id, timeSlot.id, day.day)}
                                                                        >
                                                                            <Plus className="w-4 h-4 text-gray-500" />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        )
                                                    })}
                                                </tr>
                                            ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showCopyToast && (
                <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in">
                    {copiedShifts.length > 0 ? (
                        <div className="flex items-center">
                            <Check className="w-5 h-5 mr-2" />
                            <span>{copiedShifts.length} shifts copied successfully</span>
                        </div>
                    ) : (
                        <div className="flex items-center">
                            <Info className="w-5 h-5 mr-2" />
                            <span>No shifts selected to copy</span>
                        </div>
                    )}
                </div>
            )}

            {showPasteToast && (
                <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in">
                    {copiedShifts.length > 0 ? (
                        <div className="flex items-center">
                            <Check className="w-5 h-5 mr-2" />
                            <span>{copiedShifts.length} shifts pasted successfully</span>
                        </div>
                    ) : (
                        <div className="flex items-center">
                            <Info className="w-5 h-5 mr-2" />
                            <span>No shifts available to paste</span>
                        </div>
                    )}
                </div>
            )}

            {showUndoToast && (
                <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50">
                    Action undone successfully
                </div>
            )}

            {showRedoToast && (
                <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50">
                    Action redone successfully
                </div>
            )}

            {/* Context Menu for Paste */}
            {contextMenu && (
                <div
                    className="fixed z-50 bg-white border border-gray-200 rounded shadow-lg py-1"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                        onClick={() => {
                            pasteShiftsFunc(contextMenu.day, contextMenu.locationId, contextMenu.timeSlotId)
                            setContextMenu(null)
                        }}
                    >
                        Paste {copiedShifts.length} shift(s)
                    </button>
                    <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                        onClick={() => {
                            createNewShift(contextMenu.locationId, contextMenu.timeSlotId, contextMenu.day)
                            setContextMenu(null)
                        }}
                    >
                        Create new shift
                    </button>
                </div>
            )}
        </div>
    )
}

