// This service handles storing and retrieving shifts across pages

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
  
  // Store shifts in localStorage for cross-page access
  export const storeShifts = (shifts: Shift[]): void => {
    try {
      localStorage.setItem("copiedShifts", JSON.stringify(shifts))
      console.log(`Stored ${shifts.length} shifts in localStorage`)
    } catch (error) {
      console.error("Error storing shifts:", error)
    }
  }
  
  // Retrieve shifts from localStorage
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
  
  