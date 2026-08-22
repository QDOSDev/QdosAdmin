"use client"
import type React from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@nextui-org/react"
import { Calendar, ChevronLeft, ChevronRight, Plus, XIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { SquareMousePointer } from "lucide-react"

interface Shift {
  id: string
  startTime: string
  endTime: string
  guardName: string
  isUrgent?: boolean
  columnId?: string
}

interface Site {
  id: number
  name: string
}

interface ScheduleDay {
  date: string
  shifts: Shift[]
}

interface SiteSchedule {
  siteId: number
  schedules: ScheduleDay[]
}

function formatDate(date: Date, includeYear = false): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: includeYear ? "numeric" : undefined,
  }).format(date)
}

function generateWeekDates(startDate: Date): Date[] {
  const dates: Date[] = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    dates.push(date)
  }
  return dates
}

const initialSites: Site[] = [
  { id: 1, name: "DefCust" },
  { id: 2, name: "Bosa" },
  { id: 3, name: "900 Burr" },
  { id: 4, name: "988 W Br" },
]

const initialSchedules: SiteSchedule[] = initialSites.map((site) => ({
  siteId: site.id,
  schedules: generateWeekDates(new Date(2025, 0, 20)).map((date, i) => {
    const columnId = `${site.id}-${date.toISOString().split("T")[0]}`
    return {
      date: date.toISOString(),
      shifts: [
        {
          id: `${columnId}-1`,
          startTime: "7:00 am",
          endTime: "7:00 pm",
          guardName: "SingG",
          isUrgent: Math.random() > 0.7,
          columnId,
        },
      ],
    }
  }),
}))

export default function ScheduleGrid() {
  const [sites] = useState<Site[]>(initialSites)
  const navigate = useNavigate()
  const [schedules, setSchedules] = useState<SiteSchedule[]>(initialSchedules)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 0, 20))
  const [hover, setHover] = useState(false)
  const [filters, setFilters] = useState({
    guard: "",
    customer: "",
    site: "",
  })

  const [selectedShifts, setSelectedShifts] = useState(new Set())
  const selectionBoxRef = useRef<HTMLDivElement>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })
  const [targetColumnId, setTargetColumnId] = useState<string | null>(null)
  const [copiedShifts, setCopiedShifts] = useState<Shift[]>([])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsSelecting(true)
    setStartPosition({ x: e.clientX, y: e.clientY })
    if (selectionBoxRef.current) {
      selectionBoxRef.current.style.display = "block"
      selectionBoxRef.current.style.left = `${e.clientX}px`
      selectionBoxRef.current.style.top = `${e.clientY}px`
      selectionBoxRef.current.style.width = "0px"
      selectionBoxRef.current.style.height = "0px"
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting || !selectionBoxRef.current) return

    const x = Math.min(e.clientX, startPosition.x)
    const y = Math.min(e.clientY, startPosition.y)
    const width = Math.abs(e.clientX - startPosition.x)
    const height = Math.abs(e.clientY - startPosition.y)

    selectionBoxRef.current.style.left = `${x}px`
    selectionBoxRef.current.style.top = `${y}px`
    selectionBoxRef.current.style.width = `${width}px`
    selectionBoxRef.current.style.height = `${height}px`

    const shiftElements = document.querySelectorAll(".shift-item")
    const newSelectedShifts = new Set<string>()

    shiftElements.forEach((shiftElement) => {
      const rect = shiftElement.getBoundingClientRect()
      if (rect.left < x + width && rect.right > x && rect.top < y + height && rect.bottom > y) {
        const shiftId = shiftElement.getAttribute("data-id")
        if (shiftId) {
          newSelectedShifts.add(shiftId)
        }
      }
    })

    setSelectedShifts(newSelectedShifts)
  }

  const handleMouseUp = () => {
    setIsSelecting(false)
    if (selectionBoxRef.current) {
      selectionBoxRef.current.style.display = "none"
    }
  }

  const handleShiftSelection = (shiftId: string) => {
    setSelectedShifts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(shiftId)) {
        newSet.delete(shiftId)
      } else {
        newSet.add(shiftId)
      }
      return newSet
    })
  }
  const [isHovered] = useState(false)

  const handleAdd = () => {
    navigate("/addShift")
  }

  const updateShift = useCallback((shiftId: string, updates: Partial<Shift>) => {
    setSchedules((current) => {
      return current.map((siteSchedule) => ({
        ...siteSchedule,
        schedules: siteSchedule.schedules.map((schedule) => ({
          ...schedule,
          shifts: schedule.shifts.map((shift) => (shift.id === shiftId ? { ...shift, ...updates } : shift)),
        })),
      }))
    })
  }, [])

  const weekDates = generateWeekDates(selectedDate)

  useEffect(() => {
    setTargetColumnId(null)
    setSelectedShifts(new Set())
  }, [selectedDate])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isSelecting || !selectionBoxRef.current) return
      const selectionBox = selectionBoxRef.current.getBoundingClientRect()

      const shiftElements = document.querySelectorAll(".shift-item")

      const newSelectedShifts = new Set(selectedShifts)

      shiftElements.forEach((shiftElement) => {
        const shiftBox = shiftElement.getBoundingClientRect()
        if (
          shiftBox.left < selectionBox.right &&
          shiftBox.right > selectionBox.left &&
          shiftBox.top < selectionBox.bottom &&
          shiftBox.bottom > selectionBox.top
        ) {
          const shiftId = shiftElement.getAttribute("data-id")
          if (shiftId) {
            newSelectedShifts.add(shiftId)
          }
        }
      })
      setSelectedShifts(newSelectedShifts)
    }
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isSelecting])

  const handleToggleSelectAll = () => {
    const shiftElements = document.querySelectorAll(".shift-item")

    if (selectedShifts.size === shiftElements.length) {
      setSelectedShifts(new Set())
    } else {
      const newSelectedShifts = new Set<string>()
      shiftElements.forEach((shiftElement) => {
        const shiftId = shiftElement.getAttribute("data-id")
        if (shiftId) {
          newSelectedShifts.add(shiftId)
        }
      })
      setSelectedShifts(newSelectedShifts)
    }
  }

  const handleCellClick = (siteId: number, date: string) => {
    const columnId = `${siteId}-${date.split("T")[0]}`
    setTargetColumnId(columnId)
  }

  const handleCopyToClipboard = () => {
    if (selectedShifts.size === 0) return

    const copiedShiftsData = schedules.flatMap((siteSchedule) =>
      siteSchedule.schedules.flatMap((daySchedule) =>
        daySchedule.shifts
          .filter((shift) => selectedShifts.has(shift.id))
          .map((shift) => ({
            ...shift,
            columnId: undefined,
          }))
      )
    )

    // Store in state and sessionStorage
    setCopiedShifts(copiedShiftsData)
    sessionStorage.setItem("copiedShifts", JSON.stringify(copiedShiftsData))
    alert("Shift(s) copied!")
  }

  const handlePasteShifts = () => {
    let shiftsToInsert = copiedShifts
    
    if (shiftsToInsert.length === 0) {
      const storedShifts = sessionStorage.getItem("copiedShifts")
      if (storedShifts) {
        shiftsToInsert = JSON.parse(storedShifts)
      }
    }
    
    if (shiftsToInsert.length === 0) return alert("No shifts copied!")
    if (!targetColumnId) return alert("Please select a cell to paste into!")

    const [siteId, dateStr] = targetColumnId.split("-")
    const siteIdNum = Number.parseInt(siteId)

    setSchedules((prevSchedules) => {
      return prevSchedules.map((siteSchedule) => {
        if (siteSchedule.siteId !== siteIdNum) return siteSchedule

        return {
          ...siteSchedule,
          schedules: siteSchedule.schedules.map((schedule) => {
            if (!schedule.date.startsWith(dateStr)) return schedule

            return {
              ...schedule,
              shifts: [
                ...schedule.shifts,
                ...shiftsToInsert.map((shift: any, index: number) => ({
                  id: `new-${Date.now()}-${index}`,
                  columnId: targetColumnId,
                  ...shift,
                })),
              ],
            }
          }),
        }
      })
    })

    alert("Shift(s) pasted successfully!")
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "v") handlePasteShifts()
      if (e.ctrlKey && e.key === "c") handleCopyToClipboard()
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [selectedShifts, targetColumnId, copiedShifts])

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="flex flex-col"
    >
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          {/* Left Section */}
          <div className="grid gap-1">
            <h2 className="CRM-Page-Title" style={{ userSelect: "none" }}>
              Schedule shift
            </h2>
            <p className="CRM-Page-Structure" style={{ userSelect: "none" }}>
              Dashboard / HRM / <span className="CRM-Page-Name">Schedule shift</span>
            </p>
          </div>

          {/* Right Section (Date Selector & Add Shift Button) */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Selector */}
            <div className="Filter-button flex items-center gap-3">
              {/* Selected Date Range */}
              <div className="flex items-center text-sm font-medium" style={{ userSelect: "none" }}>
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(selectedDate, true)} -{" "}
                {formatDate(new Date(selectedDate.getTime() + 6 * 24 * 60 * 60 * 1000), true)}
              </div>

              {/* Previous Week Button */}
              <button
                className="border border-gray-300 rounded-md p-2 hover:bg-gray-100 transition"
                onClick={() => {
                  const newDate = new Date(selectedDate)
                  newDate.setDate(selectedDate.getDate() - 7)
                  setSelectedDate(newDate)
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Next Week Button */}
              <button
                className="border border-gray-300 rounded-md p-2 hover:bg-gray-100 transition"
                onClick={() => {
                  const newDate = new Date(selectedDate)
                  newDate.setDate(selectedDate.getDate() + 7)
                  setSelectedDate(newDate)
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            {/* Add Shift Button */}
            <Button className="Insert-Button" onClick={handleAdd}>
              <Plus /> Add shift
            </Button>
          </div>

          {/* SquareMousePointer Below */}
          <div className="w-full mt-2 flex justify-end">
            <SquareMousePointer
              onClick={handleToggleSelectAll}
              style={{
                color: selectedShifts.size === document.querySelectorAll(".shift-item").length ? "green" : "black",
              }}
            />
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b"></div>

        {/* Grid */}

        <div
          className="grid grid-cols-[200px_repeat(7,1fr)] gap-0.5 bg-gray-200 flex-1 overflow-auto"
          style={{ userSelect: "none" }}
        >
          {/* Header row with days */}
          <div className="bg-white p-4 font-medium" style={{ userSelect: "none" }}>
            Site ID
          </div>
          {weekDates.map((date) => (
            <div key={date.toISOString()} className="bg-white p-4 font-medium">
              {formatDate(date)}
            </div>
          ))}

          {/* Site rows */}
          {sites.map((site) => {
            const siteSchedule = schedules.find((s) => s.siteId === site.id)

            return (
              <div key={site.id} className="contents">
                <div className="bg-white p-4">{site.name}</div>

                {weekDates.map((date) => {
                  const formattedDate = date.toISOString().split("T")[0]
                  const daySchedule = siteSchedule?.schedules.find((s) => s.date.startsWith(formattedDate))
                  const columnId = `${site.id}-${formattedDate}`
                  const isTargetColumn = targetColumnId === columnId

                  return (
                    <div
                      key={formattedDate}
                      className={`bg-white p-2 min-h-[200px] space-y-2 ${isTargetColumn ? "ring-2 ring-blue-500" : ""}`}
                      onClick={() => handleCellClick(site.id, date.toISOString())}
                    >
                      {daySchedule && daySchedule.shifts.length > 0 ? (
                        daySchedule.shifts.map((shift) => {
                          const isSelected = selectedShifts.has(shift.id)

                          return (
                            <div
                              key={shift.id}
                              className={`shift-item relative flex items-center w-64 rounded-md shadow-md border p-2 text-xs transition-all duration-200 
                    ${isSelected ? "bg-green-300" : "bg-sky-300"}`}
                              data-id={shift.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleShiftSelection(shift.id)
                              }}
                              style={{ userSelect: "none" }}
                            >
                              {/* Shift Details */}
                              <div className="flex-1">
                                <div className="flex items-center justify-between font-bold">
                                  {`${shift.startTime} - ${shift.endTime}`}
                                </div>
                                <div>{shift.guardName}</div>
                              </div>

                              {/* Delete Button */}
                              {isHovered && (
                                <div className="absolute top-1 right-1 flex gap-1 transition-opacity duration-200">
                                  <button className="text-gray-600 hover:text-red-500">
                                    <XIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              )}

                              {/* Checkbox */}
                              <input
                                type="checkbox"
                                checked={isSelected}
                                className="absolute bottom-1 right-1 w-4 h-4 cursor-pointer"
                                onChange={(e) => {
                                  e.stopPropagation()
                                  handleShiftSelection(shift.id)
                                }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleShiftSelection(shift.id)
                                }}
                                style={{ userSelect: "none" }}
                              />
                            </div>
                          )
                        })
                      ) : (
                        <div className=""></div>
                      )}
                    </div>
                  )
                })}
                <div
                  ref={selectionBoxRef}
                  className="absolute bg-blue-200 opacity-50 border border-blue-500 z-10 pointer-events-none"
                  style={{ position: "fixed", display: "none" }}
                ></div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}