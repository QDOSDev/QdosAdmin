export interface Shift {
    id: string
    startTime: string
    endTime: string
    guardName: string
    isUrgent?: boolean
}

export interface Site {
    id: number
    name: string
}

export interface ScheduleDay {
    date: string
    shifts: Shift[]
}

export interface SiteSchedule {
    siteId: number
    schedules: ScheduleDay[]
}

