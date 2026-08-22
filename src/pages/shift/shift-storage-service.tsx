// Enhanced shift storage service with complete shift data preservation

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
    // Additional metadata for proper rendering
    visualState?: {
      isSelected?: boolean
      isDraggable?: boolean
      cssClasses?: string[]
    }
  }
  
  // Store shifts in localStorage with complete date information
  export const storeShifts = (shifts: Shift[]): void => {
    try {
      // Ensure we capture all necessary properties for proper date handling
      const enhancedShifts = shifts.map((shift) => ({
        ...shift,
        originalWeek: shift.originalWeek || (shift.date ? new Date(shift.date).toISOString() : undefined),
        visualState: {
          isSelected: true,
          isDraggable: true,
          cssClasses: shift.isPremium ? ["premium-shift"] : [],
        },
      }))
  
      localStorage.setItem("copiedShifts", JSON.stringify(enhancedShifts))
      console.log(`Stored ${shifts.length} shifts in localStorage with date information`)
    } catch (error) {
      console.error("Error storing shifts:", error)
    }
  }
  
  // Retrieve shifts from localStorage with complete metadata
  export const getStoredShifts = (): Shift[] => {
    try {
      const storedShifts = localStorage.getItem("copiedShifts")
      if (!storedShifts) return []
  
      return JSON.parse(storedShifts) as Shift[]
    } catch (error) {
      console.error("Error retrieving shifts:", error)
      return []
    }
  }
  
  // Clear stored shifts
  export const clearStoredShifts = (): void => {
    localStorage.removeItem("copiedShifts")
  }
  
  