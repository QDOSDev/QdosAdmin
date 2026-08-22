// Convert hours and minutes to a formatted string
export function formatTime(hours: number, minutes: number): string {
    if (hours === 0 && minutes === 0) {
      return "0 hr 0 min"
    }
  
    if (minutes === 0) {
      return `${hours} hr`
    }
  
    return `${hours} hr ${minutes} min`
  }
  
  // Calculate the difference between two time strings (HH:MM format)
  export function calculateTimeDifference(startTime: string, endTime: string): string {
    try {
      const [startHours, startMinutes] = startTime.split(":").map(Number)
      const [endHours, endMinutes] = endTime.split(":").map(Number)
  
      // Convert to minutes
      const startTotalMinutes = startHours * 60 + startMinutes
      const endTotalMinutes = endHours * 60 + endMinutes
  
      // Calculate difference
      let diffMinutes = endTotalMinutes - startTotalMinutes
  
      // Handle overnight shifts
      if (diffMinutes < 0) {
        diffMinutes += 24 * 60 // Add 24 hours
      }
  
      const diffHours = Math.floor(diffMinutes / 60)
      const remainingMinutes = diffMinutes % 60
  
      return formatTime(diffHours, remainingMinutes)
    } catch (error) {
      console.error("Error calculating time difference:", error)
      return "0 hr 0 min"
    }
  }
  
  // Sum multiple time strings (e.g., "8 hr 30 min" + "9 hr" = "17 hr 30 min")
  export function sumTimes(times: string[]): string {
    let totalHours = 0
    let totalMinutes = 0
  
    times.forEach((time) => {
      // Extract hours and minutes using regex
      const hoursMatch = time.match(/(\d+)\s*hr/)
      const minutesMatch = time.match(/(\d+)\s*min/)
  
      if (hoursMatch) {
        totalHours += Number.parseInt(hoursMatch[1], 10)
      }
  
      if (minutesMatch) {
        totalMinutes += Number.parseInt(minutesMatch[1], 10)
      }
    })
  
    // Convert excess minutes to hours
    totalHours += Math.floor(totalMinutes / 60)
    totalMinutes = totalMinutes % 60
  
    return formatTime(totalHours, totalMinutes)
  }
  
  