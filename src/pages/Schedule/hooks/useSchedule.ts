"use client"

import { useState, useCallback } from "react"
import type { Shift, Site, SiteSchedule } from "../types/schedule"

// Sample data
const initialSites: Site[] = [
    { id: 1, name: "DefCust" },
    { id: 2, name: "Bosa" },
    { id: 3, name: "900 Burr" },
    { id: 4, name: "988 W Br" },
]

const initialSchedules: SiteSchedule[] = initialSites.map((site) => ({
    siteId: site.id,
    schedules: Array(7)
        .fill(0)
        .map((_, i) => ({
            date: new Date(2025, 0, 20 + i).toISOString(),
            shifts: [
                {
                    id: `${site.id}-${i}-1`,
                    startTime: "7:00 am",
                    endTime: "7:00 pm",
                    guardName: "SingG",
                    isUrgent: Math.random() > 0.7,
                },
                {
                    id: `${site.id}-${i}-2`,
                    startTime: "7:00 pm",
                    endTime: "7:00 am",
                    guardName: "NightG",
                    isUrgent: Math.random() > 0.8,
                },
            ],
        })),
}))

export function useSchedule() {
    const [sites] = useState<Site[]>(initialSites)
    const [schedules, setSchedules] = useState<SiteSchedule[]>(initialSchedules)
    const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 0, 20))
    const [filters, setFilters] = useState({
        guard: "",
        customer: "",
        site: "",
    })

    const updateShift = useCallback((shiftId: string, updates: Partial<Shift>) => {
        setSchedules((current) => {
            return current.map((siteSchedule) => ({
                ...siteSchedule,
                schedules: siteSchedule.schedules.map((schedule: any) => ({
                    ...schedule,
                    shifts: schedule.shifts.map((shift: any) => (shift.id === shiftId ? { ...shift, ...updates } : shift)),
                })),
            }))
        })
    }, [])

    const addShift = useCallback((siteId: number, date: string, newShift: Omit<Shift, "id">) => {
        setSchedules((current) => {
            return current.map((siteSchedule) => {
                if (siteSchedule.siteId !== siteId) return siteSchedule

                return {
                    ...siteSchedule,
                    schedules: siteSchedule.schedules.map((schedule: any) => {
                        if (schedule.date !== date) return schedule

                        return {
                            ...schedule,
                            shifts: [...schedule.shifts, { ...newShift, id: `${siteId}-${Date.now()}` }],
                        }
                    }),
                }
            })
        })
    }, [])

    return {
        sites,
        schedules,
        selectedDate,
        filters,
        setSelectedDate,
        setFilters,
        updateShift,
        addShift,
    }
}

