
import { useState } from "react";
import type { Shift } from "../types/schedule";
import { cn } from "../lib/utils";
import { Modal, Input } from "antd";
import { Button } from "@nextui-org/react";

interface ShiftBlockProps extends Shift {
    onUpdate: (id: string, updates: Partial<Shift>) => void;
}

export function ShiftBlock({ id, startTime, endTime, guardName, isUrgent, onUpdate }: ShiftBlockProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedGuard, setEditedGuard] = useState(guardName);

    return (
        <>
            <div
                onClick={() => setIsEditing(true)}
                className={cn(
                    "p-2 rounded-sm text-xs cursor-pointer transition-colors",
                    isUrgent ? "bg-red-500 text-white hover:bg-red-600" : "bg-gray-100 hover:bg-gray-200"
                )}
            >
                <div className="font-medium">{`${startTime} - ${endTime}`}</div>
                <div>{guardName}</div>
            </div>

            <Modal
                title="Edit Shift"
                open={isEditing}
                onCancel={() => setIsEditing(false)}
                footer={null}
            >
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label htmlFor="guard">Guard Name</label>
                        <Input
                            id="guard"
                            value={editedGuard}
                            onChange={(e) => setEditedGuard(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button
                            onClick={() => {
                                onUpdate(id, { isUrgent: !isUrgent });
                                setIsEditing(false);
                            }}

                        >
                            Toggle Urgent
                        </Button>
                        <Button
                            onClick={() => {
                                onUpdate(id, { guardName: editedGuard });
                                setIsEditing(false);
                            }}
                            color="primary"
                        >
                            Save Changes
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
