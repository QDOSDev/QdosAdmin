import { ScheduleHeader } from "./schedule-header"
import { ShiftBlock } from "./shift-block"
import { useSchedule } from "../hooks/useSchedule"
import { generateWeekDates, formatDate } from "../lib/utils"

export default function ScheduleGrid() {
    const { sites, schedules, selectedDate, setSelectedDate, setFilters, updateShift } = useSchedule()

    const weekDates = generateWeekDates(selectedDate)

    return (
        <div className="flex flex-col h-screen">
            <ScheduleHeader
                startDate={selectedDate}
                onDateChange={setSelectedDate}
                onFilterChange={(type, value) => setFilters((prev) => ({ ...prev, [type]: value }))}
            />
            <div className="grid grid-cols-[200px_repeat(7,1fr)] gap-0.5 bg-gray-200 flex-1 overflow-auto">
                {/* Header row with days */}
                <div className="bg-white p-4 font-medium">Site ID</div>
                {weekDates.map((date) => (
                    <div key={date.toISOString()} className="bg-white p-4 font-medium">
                        {formatDate(date)}
                    </div>
                ))} 

                {/* Site rows */}
                {sites.map((site) => {
                    const siteSchedule = schedules.find((s) => s.siteId === site.id)

                    return (
                        <>
                            <div key={site.id} className="bg-white p-4">
                                {site.name}
                            </div>
                            {siteSchedule?.schedules.map((daySchedule) => (
                                <div key={daySchedule.date} className="bg-white p-2 min-h-[200px] space-y-2">
                                    {daySchedule.shifts.map((shift) => (

                                        <ShiftBlock key={shift.id} {...shift} onUpdate={updateShift} />
                                    ))}
                                </div>
                            ))}
                        </>
                    )
                })}
            </div>
        </div>
    )
}

