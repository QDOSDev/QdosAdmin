import { Button, ButtonGroup } from "@nextui-org/react";
import { Calendar, Filter } from "lucide-react"
import { formatDate } from "../lib/utils"

interface ScheduleHeaderProps {
    startDate: Date
    onDateChange: (date: Date) => void
    onFilterChange: (type: string, value: string) => void
}

export function ScheduleHeader({ startDate, onDateChange, onFilterChange }: ScheduleHeaderProps) {
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)

    return (
        <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                    <Filter className="h-4 w-4 inline-block mr-2" />
                    No filter selected
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Retrieve shifts for</span>
                    <Button size="sm" onClick={() => onFilterChange("guard", "all")}>
                        All Guards
                    </Button>
                    <Button size="sm" onClick={() => onFilterChange("customer", "all")}>
                        All Customers
                    </Button>
                    <Button size="sm" onClick={() => onFilterChange("site", "all")}>
                        All Sites
                    </Button>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    size="sm"
                    onClick={() => {
                        const newDate = new Date(startDate)
                        newDate.setDate(startDate.getDate() + 7)
                        onDateChange(newDate)
                    }}
                >
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(startDate)} - {formatDate(endDate)}
                </Button>
                <Button size="sm">
                    Schedule Tools
                </Button>
            </div>
        </div>
    )
}

