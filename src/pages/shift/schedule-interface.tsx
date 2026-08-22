import React, { useState, useEffect, useRef } from "react"
import { Plus, Clipboard, Save, EllipsisVertical } from "lucide-react"
import CustomDatePicker from "./custom-datepicker"
import Cookies from "js-cookie"
import axios from "axios"
import { Trash } from "lucide-react"
import Tableempty from "../Tableempty"
import Loader from "../../components/Loader"
import { Button, Popover, PopoverTrigger, PopoverContent } from "@nextui-org/react"
import { message } from "antd"
import type { AppDispatch, IRootState } from "../../store"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import Filter from "./filter"

import { RxCross2 } from "react-icons/rx"
import { ScheduleItemCard } from "./schedule-item-modal"
import Add_shift from "./Components/Add_shift"
import EditShift from "./Components/Edit_shift"
import Repeatshift from "./Components/Repeat_shift"
import { Modal } from "antd"
interface Gaurds {
  ID: number
  first_name: string
  last_name: string
  expiry_date: string
}
interface ShiftItem {
  id: string
  locationId: string
  timeSlotId: number
  day: string
  dayOfWeek?: number
  Service_id?: string
  Company_id?: string
  Guard_id?: string
  schedule_start?: string
  schedule_end?: string
  color?: string
  isPremium?: boolean
  patrol?: string
  staff?: string
  notes?: string
  create_by?: string
  isPasted?: boolean 
  ids?: string[]
  isRecurring?: boolean
  repetitionType?: string
  repeatDays?: {
    monday: boolean
    tuesday: boolean
    wednesday: boolean
    thursday: boolean
    friday: boolean
    saturday: boolean
    sunday: boolean
  }
  startDate?: string
  endDate?: string
  selectedDates?: string[]
  [key: string]: any
}

const getCurrentWeekRange = () => {
  const today = new Date()
  const dayOfWeek = today.getDay()

  const start = new Date(today)
  start.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return { start, end }
}

export default function ScheduleInterface() {
  const effectRun = useRef(false)
  const dispatch: AppDispatch = useDispatch()
  const endpoint = import.meta.env.VITE_API_LIVEHOST
  const apiKey = import.meta.env.VITE_API_X_HEADER_KEY
  const token = Cookies.get("token")
  const [expandedLocations, setExpandedLocations] = useState<Record<string, boolean>>({})
  const [editisOpen, seteditIsOpen] = useState(false)
  const [RepeatisOpen, setrepeatIsOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [Editdata, setEditdata] = useState([])
  const [Repeatdata, setRepeatdata] = useState([])
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(false)
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    item: any
  } | null>(null)
  const [filters, setFilters] = useState({
    customer_id: "",
    site_id: "",
    service_id: "",
    BETWEENshift_date: "",
    "Guard_Schedule.guard_id": "",
  })
  const [appliedFilters, setAppliedFilters] = useState(filters)
  const [locations, setLocations] = useState<any[]>([])
  const [timeSlots, setTimeSlots] = useState<any[]>([])
  const [scheduleData, setScheduleData] = useState<ShiftItem[]>([])
  const [fullData, setFullData] = useState<any[]>([])
  const [selectedRange, setSelectedRange] = useState<{ start: Date; end: Date }>(getCurrentWeekRange())
  const [days, setdays] = useState<any[]>([])
  const [history, setHistory] = useState<ShiftItem[][]>([])
  const [redoStack, setRedoStack] = useState<ShiftItem[][]>([])
  const [selectedShifts, setSelectedShifts] = useState<ShiftItem[]>([])
  const [copiedShifts, setCopiedShifts] = useState<ShiftItem[]>([])
  const [cutShifts, setCutShifts] = useState<ShiftItem[]>([])
  const [draggedItem, setDraggedItem] = useState<any>(null)
  const [isDragging, setIsDragging] = useState(false)
  const contextMenuRef = useRef<HTMLDivElement | null>(null)
  const [showPasteIndicator, setShowPasteIndicator] = useState(false)
  const [pasteTargetWeek, setPasteTargetWeek] = useState<Date | null>(null)

  const [forceUpdate, setForceUpdate] = useState(0)

  const [showPasteModal, setShowPasteModal] = useState(false)

  const [selectedRows, setSelectedRows] = useState<{ [key: string]: boolean }>({})

  const [isDataModified, setIsDataModified] = useState<boolean>(false)
  const [unsavedChanges, setUnsavedChanges] = useState<ShiftItem[]>([])
  const [skipNextApiCall, setSkipNextApiCall] = useState(false)

  const [isMouseDown, setIsMouseDown] = useState(false)
  const [isSelecting, setIsSelecting] = useState<{ locationId: string; timeSlotId: number; day: string } | null>(null)
  const [selectionStart, setSelectionStart] = useState<{ locationId: string; timeSlotId: number; day: string } | null>(
    null,
  )
  const [lastSelectedCell, setLastSelectedCell] = useState<{
    locationId: string
    timeSlotId: number
    day: string
  } | null>(null)
  const tableRef = useRef<HTMLDivElement>(null)

  const [dragStartPosition, setDragStartPosition] = useState<{
    locationId: string
    timeSlotId: number
    day: string
  } | null>(null)

  const toggleRowSelection = (locationId: string, timeSlotId: number) => {
    const rowKey = `${locationId}-${timeSlotId}`

    // Get shifts in this row but filter out unsaved shifts
    const shiftsInRow = scheduleData.filter(
      (item) =>
        String(item.locationId) === String(locationId) &&
        Number(item.timeSlotId) === Number(timeSlotId) &&
        !item.isUnsaved &&
        !item.tempId,
    ) 

    if (shiftsInRow.length === 0) {
      message.info("No saved shifts in this row to select")
      return
    }

    setSelectedRows((prev) => {
      const newSelection = { ...prev }
      newSelection[rowKey] = !prev[rowKey]

      if (!prev[rowKey]) {
        setSelectedShifts((prevShifts) => {
          const newShifts = [...prevShifts]
          shiftsInRow.forEach((shift) => {
            if (!newShifts.some((s) => s.id === shift.id)) {
              newShifts.push(shift)
            }
          })
          return newShifts
        })
      } else {
        setSelectedShifts((prevShifts) =>
          prevShifts.filter(
            (shift) =>
              !(String(shift.locationId) === String(locationId) && Number(shift.timeSlotId) === Number(timeSlotId)),
          ),
        )
      }

      return newSelection
    })
  }

  const selectAllRows = () => {
    const allRows: Record<string, boolean> = {}
    let hasAnySelectableShifts = false

    timeSlots.forEach((timeSlot) => {
      locations.forEach((location) => {
        if (timeSlot.locationid === location.id) {
          // Check if this row has any saved shifts
          const hasSavedShifts = scheduleData.some(
            (shift) =>
              String(shift.locationId) === String(location.id) &&
              Number(shift.timeSlotId) === Number(timeSlot.id) &&
              !shift.isUnsaved &&
              !shift.tempId,
          )

          if (hasSavedShifts) {
            allRows[`${location.id}-${timeSlot.id}`] = true
            hasAnySelectableShifts = true
          }
        }
      })
    })

    if (!hasAnySelectableShifts) {
      message.info("No saved shifts available to select")
      return
    }

    setSelectedRows(allRows)

    // Only select saved shifts
    const savedShifts = scheduleData.filter((shift) => !shift.isUnsaved && !shift.tempId)
    setSelectedShifts(savedShifts)
  }

  const unselectAllRows = () => {
    setSelectedRows({})
    setSelectedShifts([])
  }
  const toggleShiftSelection = (shift: any) => {
    // Don't allow selection if the shift is unsaved or if dragging is in progress
    if (shift.isUnsaved || shift.tempId || isDragging) {
      if (isDragging) {
        message.info("Cannot select shifts while dragging")
      } else {
        message.info("Cannot select unsaved shifts")
      }
      return
    }

    setSelectedShifts((prev) => {
      const isSelected = prev.some((s) => s.id === shift.id)
      if (isSelected) {
        return prev.filter((s) => s.id !== shift.id)
      } else {
        return [...prev, shift]
      }
    })
  }

  const handleMouseDown = (locationId: string, timeSlotId: number, day: string) => {
    // Don't start selection if we're dragging
    if (isDragging) return

    setIsMouseDown(true)
    setIsSelecting({ locationId, timeSlotId, day })
    setSelectionStart({ locationId, timeSlotId, day })
    setLastSelectedCell({ locationId, timeSlotId, day })
  }

  const handleMouseEnter = (locationId: string, timeSlotId: number, day: string) => {
    if (isMouseDown && isSelecting && selectionStart) {
      setLastSelectedCell({ locationId, timeSlotId, day })
      updateSelection(selectionStart, { locationId, timeSlotId, day })
    }
  }

  const handleMouseUp = () => {
    setIsMouseDown(false)
    setIsSelecting(null)
    setSelectionStart(null)
    setLastSelectedCell(null)
  }

  const updateSelection = (
    start: { locationId: string; timeSlotId: number; day: string },
    end: { locationId: string; timeSlotId: number; day: string },
  ) => {
    const shiftsInRange = scheduleData.filter((shift) => {
      const shiftDate = new Date(shift.day)
      const startDate = new Date(start.day)
      const endDate = new Date(end.day)

      const isInDateRange =
        shiftDate >= (startDate < endDate ? startDate : endDate) &&
        shiftDate <= (startDate > endDate ? startDate : endDate)

      const isInLocationRange =
        (Number(shift.locationId) >= Number(start.locationId) && Number(shift.locationId) <= Number(end.locationId)) ||
        (Number(shift.locationId) <= Number(start.locationId) && Number(shift.locationId) >= Number(end.locationId))

      const isInTimeSlotRange =
        (shift.timeSlotId >= start.timeSlotId && shift.timeSlotId <= end.timeSlotId) ||
        (shift.timeSlotId <= start.timeSlotId && shift.timeSlotId >= end.timeSlotId)

      return isInDateRange && isInLocationRange && isInTimeSlotRange
    })

    setSelectedShifts(shiftsInRange)
  }
  // useEffect(() => {
  //   if (!isSelecting || !tableRef.current) return

  //   const handleScroll = () => {
  //     if (lastSelectedCell && selectionStart) {
  //       updateSelection(selectionStart, lastSelectedCell)
  //     }
  //   }

  //   const tableWrapper = tableRef.current
  //   tableWrapper.addEventListener("scroll", handleScroll)

  //   return () => {
  //     tableWrapper.removeEventListener("scroll", handleScroll)
  //   }
  // }, [isSelecting, lastSelectedCell, selectionStart])

  // useEffect(() => {
  //   const handleGlobalMouseUp = () => {
  //     handleMouseUp()
  //   }

  //   window.addEventListener("mouseup", handleGlobalMouseUp)

  //   return () => {
  //     window.removeEventListener("mouseup", handleGlobalMouseUp)
  //   }
  // }, [])

  const handleDragStart = (e: React.DragEvent, item: any) => {
    e.stopPropagation()
    e.currentTarget.classList.add("dragging")

    // Clear selection when dragging starts
    if (selectedShifts.some((s) => s.id === item.id)) {
      setSelectedShifts([])
      setSelectedRows({})
    }

    const originalPosition = item.originalPosition || {
      locationId: item.locationId,
      timeSlotId: item.timeSlotId,
      day: item.day,
    }

    const dragItem = {
      ...item,
      originalPosition,
    }

    setDraggedItem(dragItem)
    setIsDragging(true)
    setDragStartPosition({
      locationId: item.locationId,
      timeSlotId: item.timeSlotId,
      day: item.day,
    })

    if (e.dataTransfer) {
      e.dataTransfer.setData("text/plain", JSON.stringify(dragItem))
      e.dataTransfer.effectAllowed = "move"

      // Create a custom drag preview
      const dragPreview = document.createElement("div")
      dragPreview.className =
        "bg-white border-2 border-blue-500 rounded p-3 shadow-lg opacity-90 pointer-events-none fixed"
      dragPreview.innerHTML = `
        <div class="text-sm">
          <div class="font-medium text-gray-800">${item.staff || "Untitled"}</div>
          <div class="text-gray-500">${item.patrol || "No service"}</div>
          <div class="text-xs text-gray-400">${item.Service_Name || ""}</div>
        </div>
      `
      document.body.appendChild(dragPreview)
      e.dataTransfer.setDragImage(dragPreview, 10, 10)

      // Remove the preview element after it's no longer needed
      requestAnimationFrame(() => document.body.removeChild(dragPreview))
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation()
    e.currentTarget.classList.remove("dragging")
    setIsDragging(false)
    setDraggedItem(null)
    setDragStartPosition(null)

    // Remove any drag-related visual effects
    document.querySelectorAll(".drag-over").forEach((el) => {
      el.classList.remove("drag-over")
    })
  }

  const handleDragOver = (e: React.DragEvent, locationId: string, timeSlotId: number, day: string) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = "move"

    // Add visual feedback for the drop target
    const target = e.currentTarget as HTMLElement
    if (!target.classList.contains("drag-over")) {
      target.classList.add("drag-over")
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Remove visual feedback when dragging leaves the target
    const target = e.currentTarget as HTMLElement
    target.classList.remove("drag-over")
  }

  const handleDrop = (e: React.DragEvent, locationId: string, timeSlotId: number, day: string) => {
    e.preventDefault()
    e.stopPropagation()

    // Remove visual feedback
    const target = e.currentTarget as HTMLElement
    target.classList.remove("drag-over")

    if (!draggedItem || !dragStartPosition) return

    // Don't do anything if dropping in the same position
    if (
      locationId === dragStartPosition.locationId &&
      timeSlotId === dragStartPosition.timeSlotId &&
      day === dragStartPosition.day
    ) {
      setDraggedItem(null)
      setIsDragging(false)
      setDragStartPosition(null)
      return
    }

    const currentState = JSON.parse(JSON.stringify(scheduleData))
    setHistory((prev) => [...prev, currentState])
    setRedoStack([])

    const originalPosition = draggedItem.originalPosition || {
      locationId: dragStartPosition.locationId,
      timeSlotId: dragStartPosition.timeSlotId,
      day: dragStartPosition.day,
    }

    const isBackToOriginal =
      String(locationId) === String(originalPosition.locationId) &&
      Number(timeSlotId) === Number(originalPosition.timeSlotId) &&
      String(day) === String(originalPosition.day)

    // Get time slot info for the target position
    const timeSlotInfo = timeSlots.find((ts) => ts.id === timeSlotId)
    let startTime = draggedItem.schedule_start
    let endTime = draggedItem.schedule_end

    if (timeSlotInfo) {
      const timeRange = timeSlotInfo.time
      const [startPart, endPart] = timeRange.split(" - ")
      const convertTo24Hour = (timeStr: string) => {
        const [timePart, period] = timeStr.split(" ")
        let [hours, minutes] = timePart.split(":").map(Number)
        if (period.toLowerCase() === "pm" && hours < 12) hours += 12
        else if (period.toLowerCase() === "am" && hours === 12) hours = 0
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
      }
      startTime = convertTo24Hour(startPart)
      endTime = convertTo24Hour(endPart)
    }

    // Remove the dragged item from scheduleData
    const filteredScheduleData = scheduleData.filter((item) => {
      if (item.id === draggedItem.id) return false
      if (draggedItem.tempId && item.tempId === draggedItem.tempId) return false
      return true
    })

    // Create a new shift with updated properties
    const tempId = draggedItem.tempId || `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const originalColor = draggedItem.originalColor || draggedItem.color
    const originalBorderColor = draggedItem.originalBorderColor || draggedItem.borderColor

    const newShift = {
      ...draggedItem,
      locationId,
      timeSlotId,
      day,
      schedule_start: startTime,
      schedule_end: endTime,
      isDragged: true,
      tempId: isBackToOriginal ? undefined : tempId,
      originalPosition,
      originalColor: originalColor,
      originalBorderColor: originalBorderColor,
      color: isBackToOriginal ? originalColor : "#FAA",
      borderColor: isBackToOriginal ? originalBorderColor : "#F00",
      isUnsaved: !isBackToOriginal,
    }

    // Add the new shift to scheduleData with a smooth transition
    requestAnimationFrame(() => {
      setScheduleData([...filteredScheduleData, newShift])
    })

    // Handle unsaved changes
    let newUnsavedChanges = [...unsavedChanges]
    newUnsavedChanges = newUnsavedChanges.filter((item) => {
      if (item.id === draggedItem.id) return false
      if (draggedItem.tempId && item.tempId === draggedItem.tempId) return false
      return true
    })

    if (!isBackToOriginal) {
      newUnsavedChanges.push(newShift)
    }

    setUnsavedChanges(newUnsavedChanges)
    setIsDataModified(newUnsavedChanges.length > 0)

    // Clean up
    setDraggedItem(null)
    setIsDragging(false)
    setDragStartPosition(null)

    // Add visual feedback for successful drop
    const successFeedback = () => {
      target.classList.add("drop-success")
      setTimeout(() => target.classList.remove("drop-success"), 500)
    }
    requestAnimationFrame(successFeedback)
  }

  const handleOpenAddShift = (date: any) => {
    setShiftDate(date)
    setIsOpen(true)
  }

  const handleOpenEditShift = (contextMenu: any) => {
    setEditdata(contextMenu.item)
    seteditIsOpen(true)
  }

  const handleOpenrepeatShift = (contextMenu: any) => {
    setRepeatdata(contextMenu.item)
    setrepeatIsOpen(true)
  }




  // useEffect(() => {
  //   if (effectRun.current) return
  //   effectRun.current = true

  //   if (!gaurds || gaurds.length === 0) {
  //     dispatch(fetchGaurd())
  //   }
  //   if (!allcustomers || allcustomers.length === 0) {
  //     dispatch(fetchAllCustomers())
  //   }
  //   if (!services || services.length === 0) {
  //     dispatch(fetchServices())
  //   }
  //   if (!site || site.length === 0) {
  //     dispatch(fetchCustomersSite({ customerId: "" }))
  //   }
  // }, [dispatch, gaurds, allcustomers, services, site])

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  }

  const transformBackendData = (backendData: any[]) => {
    const locations: any[] = []
    const timeSlots: any[] = []
    const scheduleData: ShiftItem[] = []

    backendData.forEach((shift) => {
      let location = locations.find((loc) => loc.name === shift.Site_Name)
      if (!location) {
        location = {
          id: shift.Shift_Siteid,
          name: shift.Site_Name,
          color: shift.Site_Color,
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
        locationId: shift.Shift_Siteid.toString(),
        timeSlotId: timeSlot.id,
        Shift_Guardid: shift.Shift_Guardid.toString(),
        Shift_Serviceid: shift.Shift_Serviceid.toString(),
        Shift_Customerid: shift.Shift_Customerid.toString(),
        Shift_Siteid: shift.Shift_Siteid.toString(),
        Shift_Companyid: shift.Shift_Companyid?.toString() || "",
        day: shift.shift_date,
        schedule_start: shift.schedule_start,
        schedule_end: shift.schedule_end,
        color: shift.Site_Color,
        Service_Color: shift.Service_Color,
        Accept_status: shift.Accept_status || "Pending",
        Company_Name: shift.Company_Name,
        Customer_Name: shift.Customer_Name,
        Service_Name: shift.Service_Name,
        Site_Name: shift.Site_Name,
        guard_first_name: shift.guard_first_name || "",
        guard_last_name: shift.guard_last_name || "",
        notes: shift.note || "",
        created_at: shift.created_at,
        updated_at: shift.updated_at,
        created_by: `${shift.created_by_first_name} ${shift.created_by_last_name}`.trim(),
        updated_by: `${shift.updated_by_first_name} ${shift.updated_by_last_name}`.trim(),
        isPremium: shift.Accept_status === "Accepted",
        isPasted: shift.isPasted || false,
        patrol: shift.Service_Name,
        staff: shift.Customer_Name,
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

  // Function to handle deletion of multiple shifts
  const handleDelete = async (ids: string | string[]) => {
    try {
      // Convert IDs to numbers and ensure it's an array
      const IDs = (Array.isArray(ids) ? ids : [ids]).map((id) => Number(id))

      const response = await axios.post(
        `${endpoint}?route=Delete/shift/schedule`,
        { IDs },
        {
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.status === true) {
        message.success(`Successfully deleted ${IDs.length} shift${IDs.length > 1 ? "s" : ""}`)
        // Clear selection if we're deleting selected shifts
        if (selectedShifts.some((shift) => IDs.includes(Number(shift.id)))) {
          setSelectedShifts([])
          setSelectedRows({})
        }
        // getList()
      } else {
        message.error(response.data.message || "Failed to delete shifts")
      }
    } catch (error) {
      console.error("Delete error:", error)
      message.error("Failed to delete shifts")
    }
  }

  // const getList = async (extraFilter = {}) => {
  //   if (skipNextApiCall) {
  //     setSkipNextApiCall(false)
  //     return
  //   }

  //   setLoading(true)
  //   try {
  //     const queryParams = new URLSearchParams()

  //     queryParams.append("filter[Guard_Schedule.delete_status]", "0")
  //     queryParams.append(
  //       "filter[BETWEENshift_date]",
  //       `${formatDate(selectedRange.start)},${formatDate(selectedRange.end)}`,
  //     )

  //     const combinedFilters = { ...appliedFilters, ...extraFilter }

  //     Object.entries(combinedFilters).forEach(([key, value]) => {
  //       if (value) {
  //         queryParams.append(`filter[${key}]`, String(value))
  //       }
  //     })

  //     const url = `${endpoint}?route=User/Shift/List&${queryParams.toString()}`

  //     const { data } = await axios.get(url, {
  //       headers: {
  //         "x-api-key": apiKey,
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     })

  //     if (data.status === true) {
  //       if (data.Data.length === 0) {
  //         setLocations([])
  //         setTimeSlots([])
  //         setScheduleData([])
  //       } else {
  //         const transformedData = transformBackendData(data.Data)
  //         setLocations(transformedData.locations)
  //         setTimeSlots(transformedData.timeSlots)
  //         setScheduleData(transformedData.scheduleData)
  //         setFullData(data.Data)
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error fetching the list:", error)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const generateDays = (start: Date, end: Date) => {
    const days = []
    const currentDate = new Date(start)

    while (currentDate <= end) {
      const tempDate = new Date(currentDate)

      days.push({
        day: tempDate.toLocaleString("en-US", { weekday: "short" }),
        vailddate:
          tempDate.getFullYear() +
          "-" +
          String(tempDate.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(tempDate.getDate()).padStart(2, "0"),
        date: tempDate.toLocaleString("en-US", { month: "short", day: "numeric" }),
        dayOfWeek: tempDate.getDay(),
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }
    return days
  }

  // useEffect(() => {}, [selectedRange])

  // useEffect(() => {
  //   setdays(generateDays(selectedRange.start, selectedRange.end))
  //   getList()
  // }, [appliedFilters, selectedRange])

  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
  //       setContextMenu(null)
  //     }
  //   }

  //   if (contextMenu) {
  //     document.addEventListener("mousedown", handleClickOutside)
  //   }

  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside)
  //   }
  // }, [contextMenu])

  // useEffect(() => {
  //   setExpandedLocations(
  //     locations.reduce(
  //       (acc, location) => {
  //         acc[location.id] = false
  //         return acc
  //       },
  //       {} as Record<string, boolean>,
  //     ),
  //   )
  // }, [locations])

  const toggleLocation = (locationId: string) => {
    setExpandedLocations((prev = {}) => ({
      ...prev,
      [locationId]: !prev[locationId],
    }))
  }

  const getScheduleItems = (locationId: string, timeSlotId: number, day: string) => {
    const locId = String(locationId)
    const timeId = Number(timeSlotId)
    const dayStr = String(day)

    const savedItems = scheduleData.filter((item) => {
      return String(item.locationId) === locId && Number(item.timeSlotId) === timeId && String(item.day) === dayStr
    })

    const unsavedItems = unsavedChanges.filter((item) => {
      return (
        String(item.locationId) === locId &&
        Number(item.timeSlotId) === timeId &&
        String(item.day) === dayStr &&
        !savedItems.some((saved) => saved.id === item.id)
      )
    })

    return [...savedItems, ...unsavedItems]
  }

  const handleContextMenu = (e: React.MouseEvent, item: any) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item,
    })
  }

  const handleUndo = () => {
    if (history.length === 0) return
    const currentState = JSON.parse(JSON.stringify(scheduleData))
    const historyCopy = [...history]
    const lastState = historyCopy.pop()
    setHistory(historyCopy)
    setRedoStack((prev) => [currentState, ...prev])
    setScheduleData(lastState || [])
  }
  const handleRedo = () => {
    if (redoStack.length === 0) return
    const currentState = JSON.parse(JSON.stringify(scheduleData))
    const redoStackCopy = [...redoStack]
    const nextState = redoStackCopy.shift()
    setRedoStack(redoStackCopy)
    setHistory((prev) => [...prev, currentState])
    setScheduleData(nextState || [])
  }

  const getDayOfWeek = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number)
    const date = new Date(year, month - 1, day)
    return date.getDay()
  }

  const getDateForDayOfWeek = (referenceDate: string, targetDayOfWeek: number) => {
    const [year, month, day] = referenceDate.split("-").map(Number)
    const refDate = new Date(year, month - 1, day)
    const refDayOfWeek = refDate.getDay()

    let daysToAdd = targetDayOfWeek - refDayOfWeek

    if (daysToAdd < 0) {
      daysToAdd += 7
    }

    const targetDate = new Date(refDate)
    targetDate.setDate(refDate.getDate() + daysToAdd)

    return `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}-${String(targetDate.getDate()).padStart(2, "0")}`
  }

  const handleCopyShift = () => {
    if (selectedShifts.length === 0) {
      message.info("No shifts selected!")
      return
    }

    const shiftsWithDayInfo = selectedShifts.map((shift) => {
      const dayOfWeek = getDayOfWeek(shift.day)

      const originalShift = fullData.find((item) => String(item.ShiftID) === String(shift.id))

      const shiftTimeSlot = timeSlots.find(
        (ts) => Number(ts.id) === Number(shift.timeSlotId) && String(ts.locationId) === String(shift.locationId),
      )

      return {
        ...JSON.parse(JSON.stringify(shift)),
        dayOfWeek,
        originalLocationId: shift.locationId,
        originalTimeSlotId: shift.timeSlotId,
        originalDay: shift.day,
        originalScheduleStart: shift.schedule_start,
        originalScheduleEnd: shift.schedule_end,
        originalTimeSlotInfo: shiftTimeSlot ? shiftTimeSlot.time : null,
        originalLocationName: originalShift ? originalShift.Site_Name : null,
        originalTimeSlotTime: originalShift
          ? `${convertTo12Hour(originalShift.schedule_start)} - ${convertTo12Hour(originalShift.schedule_end)}`
          : null,
        originalSiteColor: originalShift ? originalShift.Site_Color : null,
        originalServiceName: originalShift ? originalShift.Service_Name : null,
        originalCustomerName: originalShift ? originalShift.Customer_Name : null,
        originalServiceId: originalShift ? originalShift.Shift_Serviceid : null,
        originalCompanyId: originalShift ? originalShift.Shift_Customerid : null,
        originalGuardId: originalShift ? originalShift.Shift_Guardid : null,
      }
    })
    setCopiedShifts(shiftsWithDayInfo)
    setShowPasteIndicator(true)

    const dayNames = shiftsWithDayInfo.map((shift) => {
      const dayIndex = shift.dayOfWeek
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      return dayNames[dayIndex]
    })

    const uniqueDayNames = [...new Set(dayNames)]

    message.success(
      `${selectedShifts.length} shifts copied! Press Ctrl+V to paste or click the clipboard icon in any empty cell.`,
    )
    setSelectedShifts([])
    setTimeout(() => {
      setShowPasteIndicator(false)
    }, 5000)
  }

  const handleCutShift = () => {
    if (selectedShifts.length === 0) {
      message.info("No shifts selected!")
      return
    }

    setHistory([...history, [...scheduleData]])

    const shiftsWithDayInfo = selectedShifts.map((shift) => {
      const dayOfWeek = getDayOfWeek(shift.day)

      const originalShift = fullData.find((item) => String(item.ShiftID) === String(shift.id))

      const shiftTimeSlot = timeSlots.find(
        (ts) => Number(ts.id) === Number(shift.timeSlotId) && String(ts.locationId) === String(shift.locationId),
      )

      return {
        ...JSON.parse(JSON.stringify(shift)),
        dayOfWeek,
        originalLocationId: shift.locationId,
        originalTimeSlotId: shift.timeSlotId,
        originalDay: shift.day,
        originalScheduleStart: shift.schedule_start,
        originalScheduleEnd: shift.schedule_end,
        originalTimeSlotInfo: shiftTimeSlot ? shiftTimeSlot.time : null,
        originalLocationName: originalShift ? originalShift.Site_Name : null,
        originalTimeSlotTime: originalShift
          ? `${convertTo12Hour(originalShift.schedule_start)} - ${convertTo12Hour(originalShift.schedule_end)}`
          : null,
        originalSiteColor: originalShift ? originalShift.Site_Color : null,
        originalServiceName: originalShift ? originalShift.Service_Name : null,
        originalCustomerName: originalShift ? originalShift.Customer_Name : null,
        originalServiceId: originalShift ? originalShift.Shift_Serviceid : null,
        originalCompanyId: originalShift ? originalShift.Shift_Customerid : null,
        originalGuardId: originalShift ? originalShift.Shift_Guardid : null,
      }
    })

    setCopiedShifts(shiftsWithDayInfo)
    setCutShifts(selectedShifts)
    setShowPasteIndicator(true)

    setScheduleData((prev) => prev.filter((s) => !selectedShifts.some((cut) => cut.id === s.id)))
    message.success(
      `${selectedShifts.length} shifts cut! Press Ctrl+V to paste or click the clipboard icon in any empty cell.`,
    )
    setSelectedShifts([])

    setTimeout(() => {
      setShowPasteIndicator(false)
    }, 5000)
  }

  const createDefaultShift = (): Partial<ShiftItem> => {
    return {
      color: "#4f46e5",
      isPremium: false,
      patrol: "Default Service",
      staff: "Default Staff",
      notes: "",
      create_by: "User",
      schedule_start: "09:00",
      schedule_end: "17:00",
    }
  }

  const findOrCreateLocation = (locationName: string, createdLocationsMap: Record<string, string>) => {
    if (createdLocationsMap[locationName]) {
      return {
        id: createdLocationsMap[locationName],
        isNew: false,
      }
    }

    const existingLocation = locations.find((loc) => loc.name === locationName)
    if (existingLocation) {
      return {
        id: existingLocation.id,
        isNew: false,
      }
    }
    const newLocationId = `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const newLocation = {
      id: newLocationId,
      name: locationName,
    }

    setLocations((prev) => [...prev, newLocation])

    return {
      id: newLocationId,
      isNew: true,
      location: newLocation,
    }
  }
  const findOrCreateTimeSlot = (
    locationId: string,
    formattedTime: string,
    startTime: string,
    endTime: string,
    createdTimeSlotsMap: Record<string, number>,
    nextTimeSlotId: number,
  ) => {
    const timeSlotKey = `${locationId}-${formattedTime}`

    if (createdTimeSlotsMap[timeSlotKey]) {
      return {
        id: createdTimeSlotsMap[timeSlotKey],
        isNew: false,
      }
    }

    const existingTimeSlot = timeSlots.find(
      (ts) => String(ts.locationid) === String(locationId) && ts.time === formattedTime,
    )

    if (existingTimeSlot) {
      return {
        id: existingTimeSlot.id,
        isNew: false,
      }
    }

    const newTimeSlot = {
      locationid: locationId,
      id: nextTimeSlotId,
      time: formattedTime,
    }

    setTimeSlots((prev) => [...prev, newTimeSlot])

    return {
      id: nextTimeSlotId,
      isNew: true,
      timeSlot: newTimeSlot,
    }
  }

  const handlePasteShift = (locationId: number | string, timeSlotId: number, targetDay: string) => {
    if (copiedShifts.length === 0) {
      message.info("No shifts copied!")
      return
    }

    const currentState = JSON.parse(JSON.stringify(scheduleData))
    setHistory((prev) => [...prev, currentState])
    setRedoStack([])

    const newShifts: ShiftItem[] = []
    const defaultShift = createDefaultShift()
    const newTimeSlots: any[] = []
    const newLocations: any[] = []
    const createdLocationsMap: Record<string, string> = {}
    const createdTimeSlotsMap: Record<string, number> = {}

    const uniqueDates = new Set(copiedShifts.map((shift) => shift.day))
    const allDates = Array.from(uniqueDates)

    const targetDate = new Date(targetDay)
    const targetDayOfWeek = targetDate.getDay()
    const targetWeekStart = new Date(targetDate)
    targetWeekStart.setDate(targetDate.getDate() - targetDayOfWeek + (targetDayOfWeek === 0 ? -6 : 1))

    const isEmptyWeek = locations.length === 0 || timeSlots.length === 0

    const maxExistingTimeSlotId = Math.max(...timeSlots.map((ts) => Number(ts.id)), 0)
    let nextTimeSlotId = maxExistingTimeSlotId + 1

    const shiftsByOriginalLocation: Record<string, ShiftItem[]> = {}

    copiedShifts.forEach((shift) => {
      const locationKey = shift.originalLocationName || "Unknown Location"
      if (!shiftsByOriginalLocation[locationKey]) {
        shiftsByOriginalLocation[locationKey] = []
      }
      shiftsByOriginalLocation[locationKey].push(shift)
    })

    for (const [locationName, shifts] of Object.entries(shiftsByOriginalLocation)) {
      const locationResult = findOrCreateLocation(locationName, createdLocationsMap)
      const shiftLocationId = locationResult.id

      if (locationResult.isNew && locationResult.location) {
        newLocations.push(locationResult.location)
        createdLocationsMap[locationName] = shiftLocationId
      }

      for (const shift of shifts) {
        const newId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

        const originalDayOfWeek = shift.dayOfWeek || getDayOfWeek(shift.originalDay || shift.day)
        const targetShiftDate = new Date(targetWeekStart)
        targetShiftDate.setDate(targetWeekStart.getDate() + (originalDayOfWeek - 1 + (originalDayOfWeek === 0 ? 7 : 0)))
        const formattedTargetDate = `${targetShiftDate.getFullYear()}-${String(targetShiftDate.getMonth() + 1).padStart(2, "0")}-${String(targetShiftDate.getDate()).padStart(2, "0")}`

        const startTime = shift.originalScheduleStart || shift.schedule_start || "09:00"
        const endTime = shift.originalScheduleEnd || shift.schedule_end || "17:00"
        const formattedTime =
          shift.originalTimeSlotInfo || `${convertTo12Hour(startTime)} - ${convertTo12Hour(endTime)}`

        const timeSlotResult = findOrCreateTimeSlot(
          shiftLocationId,
          formattedTime,
          startTime,
          endTime,
          createdTimeSlotsMap,
          nextTimeSlotId++,
        )

        const shiftTimeSlotId = timeSlotResult.id

        if (timeSlotResult.isNew && timeSlotResult.timeSlot) {
          newTimeSlots.push(timeSlotResult.timeSlot)
          createdTimeSlotsMap[`${shiftLocationId}-${formattedTime}`] = shiftTimeSlotId
        }

        // Check if a shift already exists at this location, time slot, and date
        // Check both in scheduleData and unsavedChanges
        const existingShift = scheduleData.find(
          (s) =>
            String(s.locationId) === String(shiftLocationId) &&
            Number(s.timeSlotId) === Number(shiftTimeSlotId) &&
            s.day === formattedTargetDate &&
            s.Service_id === (shift.originalServiceId || shift.Service_id) &&
            s.Guard_id === (shift.originalGuardId || shift.Guard_id),
        )

        const existingUnsavedShift = unsavedChanges.find(
          (s) =>
            String(s.locationId) === String(shiftLocationId) &&
            Number(s.timeSlotId) === Number(shiftTimeSlotId) &&
            s.day === formattedTargetDate &&
            s.Service_id === (shift.originalServiceId || shift.Service_id) &&
            s.Guard_id === (shift.originalGuardId || shift.Guard_id),
        )

        // Skip creating a new shift if one already exists with the same key properties
        if (existingShift || existingUnsavedShift) {
          continue
        }

        const newShift = {
          ...defaultShift,
          ...JSON.parse(JSON.stringify(shift)),
          id: newId,
          locationId: shiftLocationId,
          timeSlotId: shiftTimeSlotId,
          day: formattedTargetDate,
          dayOfWeek: undefined,
          originalLocationId: undefined,
          originalTimeSlotId: undefined,
          isPasted: true,
          Service_id: shift.originalServiceId || shift.Service_id,
          Company_id: shift.originalCompanyId || shift.Company_id,
          Guard_id: shift.originalGuardId || shift.Guard_id,
          schedule_start: startTime,
          schedule_end: endTime,
          color: shift.originalSiteColor || shift.color,
          patrol: shift.originalServiceName || shift.patrol,
          staff: shift.originalCustomerName || shift.staff,
          notes: shift.notes || "",
          ids: [],
          isRecurring: allDates.length > 1,
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
          startDate: allDates[0],
          endDate: allDates[allDates.length - 1],
          selectedDates: allDates,
        }

        newShifts.push(newShift)
      }
    }

    if (newShifts.length === 0) {
      message.info("No new shifts to paste - shifts already exist at target locations or no shifts were copied.")
      return
    }

    setScheduleData((prev) => [...prev, ...newShifts])
    setUnsavedChanges((prev) => [...prev, ...newShifts])
    setIsDataModified(true)

    if (cutShifts.length > 0) {
      setCopiedShifts([])
      setCutShifts([])
    }

    const createdMsg =
      newLocations.length > 0 || newTimeSlots.length > 0
        ? ` Created ${newLocations.length} new locations and ${newTimeSlots.length} new time slots.`
        : ""

    message.success(`${newShifts.length} shifts pasted to the same day of the week!${createdMsg}`)
  }

  const createNewTimeSlot = (locationId: string, startTime: string, endTime: string) => {
    const formattedTime = `${convertTo12Hour(startTime)} - ${convertTo12Hour(endTime)}`
    const newTimeSlotId = timeSlots.length + 1

    const newTimeSlot = {
      locationid: locationId,
      id: newTimeSlotId,
      time: formattedTime,
    }

    setTimeSlots((prev) => [...prev, newTimeSlot])
    return newTimeSlotId
  }

  const getDaysUntilExpiryFromDate = (scheduleDate: string, expiryDate: string): number | null => {
    if (!expiryDate || !scheduleDate) return null

    try {
      const scheduleDateObj = new Date(scheduleDate)
      const expiryDateObj = new Date(expiryDate)
      if (isNaN(scheduleDateObj.getTime()) || isNaN(expiryDateObj.getTime())) {
        console.error("Invalid date format:", { scheduleDate, expiryDate })
        return null
      }
      scheduleDateObj.setHours(0, 0, 0, 0)
      expiryDateObj.setHours(0, 0, 0, 0)
      const diffTime = expiryDateObj.getTime() - scheduleDateObj.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      return diffDays
    } catch (error) {
      console.error("Error calculating days until expiry:", error)
      return null
    }
  }

  const handleSave = async () => {
    if (unsavedChanges.length === 0) {
      message.info("No changes to save")
      return
    }
    const checkLicenseExpiry = () => {
      const newShifts = unsavedChanges.filter((shift) => !shift.isDragged)
      const draggedShifts = unsavedChanges.filter((shift) => shift.isDragged)
      const allShiftsToCheck = [...newShifts, ...draggedShifts]
      const datesToCheck = allShiftsToCheck.map((shift) => shift.day).filter(Boolean)

      if (datesToCheck.length === 0 || allShiftsToCheck.length === 0) {
        handleSubmitAfterConfirmation()
        return
      }
      const guardIds = allShiftsToCheck
        .map((shift) => shift.Shift_Guardid)
        .filter(Boolean)
        .map((id) => id.toString())

      if (guardIds.length === 0) {
        handleSubmitAfterConfirmation()
        return
      }
      const expiringGuards: { id: string; name: string; expiry: string }[] = []


      if (expiringGuards.length > 0) {
        Modal.confirm({
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
            <div className="flex gap-2 mt-3">
              <button className="reset-btn" onClick={() => Modal.destroyAll()}>
                Cancel
              </button>
              <button
                className="Search-btn"
                onClick={() => {
                  Modal.destroyAll()
                  handleSubmitAfterConfirmation()
                }}
              >
                Ignore & Add
              </button>
            </div>
          ),
        })
      } else {
        handleSubmitAfterConfirmation()
      }
    }

    const handleSubmitAfterConfirmation = async () => {
      setLoading(true)
      try {
        const newShifts = unsavedChanges.filter((shift) => !shift.isDragged)
        const draggedShifts = unsavedChanges.filter((shift) => shift.isDragged)

        if (newShifts.length > 0) {
          const submitMultiShifts = async (ignore = false) => {
            const payload = {
              ignore: ignore,
              shifts: newShifts.map((shift) => ({
                guard_name: shift.Shift_Guardid || "1",
                shiftDate: shift.day || "",
                schedule_start: shift.schedule_start || "",
                schedule_end: shift.schedule_end || "",
                customer: shift.Shift_Customerid || "1",
                site: shift.Shift_Siteid || shift.locationId || "1",
                service: shift.Shift_Serviceid || "1",
                note: shift.notes || "",
              })),
            }

            const response = await axios.post(`${endpoint}?route=User/Multi/Shift`, payload, {
              headers: {
                "x-api-key": apiKey,
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            })

            return response
          }

          const response = await submitMultiShifts()

          if (response.data.status === false && response.data.status_code === 101) {
            // Handle status code 101 - guard already assigned
            Modal.confirm({
              title: "Guard Already Assigned",
              content: `${response.data.message}`,
              maskClosable: true,
              footer: (
                <div className="flex gap-2 mt-3">
                  <button className="reset-btn" onClick={() => Modal.destroyAll()}>
                    Cancel
                  </button>
                  <button
                    className="Search-btn"
                    onClick={async () => {
                      Modal.destroyAll()
                      const retryResponse = await submitMultiShifts(true)
                      if (retryResponse.data.status) {
                        message.success("New shifts saved successfully")
                        // Clear the unsaved changes before fetching new data
                        setUnsavedChanges([])
                        setIsDataModified(false)
                        // getList()
                      } else {
                        throw new Error("Failed to save new shifts")
                      }
                    }}
                  >
                    Ignore & Add
                  </button>
                </div>
              ),
            })
            return
          }

          if (!response.data.status) {
            throw new Error("Failed to save new shifts")
          }

          message.success("New shifts saved successfully")
        }

        // Then handle dragged shifts if any
        if (draggedShifts.length > 0) {
          for (const shift of draggedShifts) {
            const editEndpoint = `${endpoint}?route=User/Edit/Shift`
            const draggedTimeSlot = timeSlots.find((ts) => ts.id === shift.timeSlotId)

            let schedule_start = shift.schedule_start
            let schedule_end = shift.schedule_end

            if (draggedTimeSlot) {
              const [startTime, endTime] = draggedTimeSlot.time.split(" - ")
              const convertTo24Hour = (timeStr: string) => {
                const [time, period] = timeStr.split(" ")
                let [hours, minutes] = time.split(":").map(Number)

                if (period.toLowerCase() === "pm" && hours < 12) {
                  hours += 12
                } else if (period.toLowerCase() === "am" && hours === 12) {
                  hours = 0
                }

                return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
              }

              schedule_start = convertTo24Hour(startTime)
              schedule_end = convertTo24Hour(endTime)
            }

            const payload = {
              ids: [shift.id],
              guard_name: shift.Shift_Guardid || "",
              shift_date: shift.day,
              schedulestart: schedule_start,
              scheduleend: schedule_end,
              customer: shift.Shift_Customerid || "",
              site: shift.locationId,
              service: shift.Shift_Serviceid || "",
              note: shift.notes || "",
            }

            const response = await axios.post(editEndpoint, payload, {
              headers: {
                "x-api-key": apiKey,
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            })

            if (!response.data.status) {
              throw new Error(`Failed to update shift ${shift.id}`)
            }
          }

          message.success("Dragged shifts updated successfully")
        }

        // Clear all temporary state before fetching fresh data
        setUnsavedChanges([])
        setIsDataModified(false)
        if (cutShifts.length > 0) {
          setCopiedShifts([])
          setCutShifts([])
        }

        // Fetch fresh data
        // getList()

      } catch (error) {
        console.error("Save error:", error)
        message.error("Failed to save changes")
      } finally {
        setLoading(false)
      }
    }

    checkLicenseExpiry()
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      e.preventDefault()
      handleUndo()
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
      e.preventDefault()
      handleRedo()
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
      e.preventDefault()
      if (selectedShifts.length > 0) {
        handleCopyShift()
      } else {
        message.info("Select shifts to copy first!")
      }
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
      e.preventDefault()

      if (copiedShifts.length === 0) {
        message.info("Copy shifts first!")
        return
      }

      if (selectedShifts.length > 0) {
        const targetShift = selectedShifts[0]
        handlePasteShift(targetShift.locationId, targetShift.timeSlotId, targetShift.day)
      } else if (days.length > 0) {
        const firstDay = days[0].vailddate
        if (locations.length === 0) {
          handlePasteShift("temp-location", 1, firstDay)
        } else {
          const firstLocation = locations[0]
          handlePasteShift(firstLocation.id, -999, firstDay)
        }
      }
    }
  }

  // useEffect(() => {
  //   const handleKeyboardEvent = (e: KeyboardEvent) => {
  //     if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
  //       return
  //     }

  //     if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
  //       e.preventDefault()
  //       handleUndo()
  //       return
  //     }

  //     if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
  //       e.preventDefault()
  //       handleRedo()
  //       return
  //     }

  //     if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
  //       e.preventDefault()
  //       if (selectedShifts.length > 0) {
  //         handleCopyShift()
  //       } else {
  //         message.info("Select shifts to copy first!")
  //       }
  //       return
  //     }
  //     if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
  //       e.preventDefault()

  //       if (copiedShifts.length === 0) {
  //         message.info("Copy shifts first!")
  //         return
  //       }
  //       if (selectedShifts.length > 0) {
  //         const targetShift = selectedShifts[0]
  //         handlePasteShift(targetShift.locationId, 0, targetShift.day)
  //       } else if (days.length > 0) {
  //         const firstDay = days[0].vailddate

  //         if (locations.length === 0) {
  //           handlePasteShift("temp-location", 0, firstDay)
  //         } else {
  //           // Use the first available location
  //           const firstLocation = locations[0]
  //           handlePasteShift(firstLocation.id, 0, firstDay)
  //         }
  //       }
  //     }
  //   }

  //   document.addEventListener("keydown", handleKeyboardEvent)
  //   return () => {
  //     document.removeEventListener("keydown", handleKeyboardEvent)
  //   }
  // }, [history, redoStack, copiedShifts, selectedShifts, scheduleData, locations, timeSlots, days, forceUpdate])

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
    setAppliedFilters(newFilters)
  }

  const removeFilter = (key: string) => {
    const updatedFilters = { ...appliedFilters, [key]: "" }
    setFilters(updatedFilters)
    setAppliedFilters(updatedFilters)
    // if (key === "Guard_Schedule.guard_id") {
    //   getList()
    // }
  }



  return (
<></>
  )
}
