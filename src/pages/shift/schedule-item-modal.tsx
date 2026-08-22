import React, { useState } from "react"
import { Check, PencilLine, Trash } from "lucide-react"
import { Button, ConfigProvider, Flex, Popover } from 'antd';

interface ScheduleItem {
    id: string
    patrol: string
    staff: string
    color?: string
    location?: string
    notes?: string
    create_by?: string
}

export function ScheduleItemCard({ item, timeSlot, cellId, index, handleDragStart, selectedShifts, toggleShiftSelection }: any) {
    const [open, setOpen] = useState(false);
    const isSelected = selectedShifts.some((s: any) => s.id === item.id);
    const isUnsavedPaste = item.isPasted && !item.isSaved;
    const fullName = `${item.guard_first_name} ${item.guard_last_name}`;
    return (
        <div className="" key={`${cellId}`}>
            <Popover
                placement="right"
                trigger="click"
                open={open}
                onOpenChange={(newOpen) => setOpen(newOpen)}
                content={
                    <div className="p-4 space-y-3 w-60">
                        <div className="border-b pb-2">
                            <h3 className="font-semibold text-lg">{item.patrol}</h3>
                            <p className="text-muted-foreground">{timeSlot.time}</p>
                        </div>
                        <div className="grid gap-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Customer:</span>
                                <span className="font-medium">{item.staff}</span>
                            </div>
                        </div>
                    </div>
                }
            >
                <div
                    key={`${cellId}-${index}`}
                    className={`p-3 rounded border ${
                        isSelected ? "border-blue-500 shadow-md ring-2 ring-blue-500" : "border-gray-200"
                    } ${isUnsavedPaste ? "unsaved-pasted-shift" : ""} 
                    cursor-move group relative bg-white min-h-[80px]`}
                    style={{ backgroundColor: item.color || "white" }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onClick={() => toggleShiftSelection(item)}
                >
                    <div className="flex flex-col gap-1">
                        <div className="text-sm font-medium relative text-white">{timeSlot.time}</div>
                        <div className="text-sm relative text-white">{item.patrol}</div>
                        <div className="text-sm relative text-white">{fullName}</div>
                        {/* {item.notes && <div className="text-xs italic text-white opacity-75">{item.notes}</div>} */}
                    </div>

                    {isSelected && (
                        <div className="absolute bottom-2 right-2">
                            <div className="bg-blue-100 rounded-full p-1 border border-blue-300">
                                <Check className="w-4 h-4 text-blue-500" />
                            </div>
                        </div>
                    )}
                </div>
            </Popover>
        </div>
    );
}

