import React, { useEffect, useState } from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
} from "@nextui-org/react";
import { Plus, UserRoundCog } from 'lucide-react';
import Cookies from 'js-cookie';
import axios from "axios";
import { message } from 'antd';

const colorPalette = [
    ["#9D174D", "#5B21B6", "#1D4ED8", "#0F766E", "#15803D", "#65A30D", "#C2410C", "#B91C1C", "#7C2D12", "#1F2937"],
    ["#DB2777", "#7C3AED", "#3B82F6", "#06B6D4", "#059669", "#84CC16", "#F97316", "#EF4444", "#92400E", "#4B5563"],
    ["#F472B6", "#A78BFA", "#60A5FA", "#22D3EE", "#34D399", "#A3E635", "#FB923C", "#FCA5A5", "#B45309", "#6B7280"],
    ["#FBCFE8", "#DDD6FE", "#93C5FD", "#67E8F9", "#6EE7B7", "#D9F99D", "#FED7AA", "#FEE2E2", "#D97706", "#9CA3AF"],
    ["#FCE7F3", "#EDE9FE", "#BFDBFE", "#A5F3FC", "#A7F3D0", "#ECFCCB", "#FFEDD5", "#FEE2E2", "#FDBA74", "#E5E7EB"],
]

export default function App({ onServiceAdded }: { onServiceAdded?: () => void }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const endpoint = import.meta.env.VITE_API_LIVEHOST;
    const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;
    const token = Cookies.get('token')

    const [selectedColor, setSelectedColor] = useState("")
    const [ColorOpen, setcolorOpen] = useState(false)

    const [isSubmitting, setIsSubmitting] = useState(false);
    const initialFormData = {
        ServiceName: "",
        Status: "Active",
        ServicesColor: "",
    };

    const [formData, setFormData] = useState(initialFormData);
    
    const isValidServiceName = (name: string) => {
        return name.trim().length > 0 && !/^[.\s]+$/.test(name);
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!isValidServiceName(formData.ServiceName)) {
            message.error("Please enter a valid service name");
            return;
        }
        try {
            setIsSubmitting(true);
            const response = await axios.post(`${endpoint}?route=admin/add/Services`, formData, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.data.status === true) {
                message.success(response.data.message);
                setFormData(initialFormData);
                onServiceAdded?.(); // Call the callback function to refresh the list
                onOpenChange();
            } else if (response.data.status === false) {
                message.error(response.data.message);
            }

        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setIsSubmitting(false); 
        }
    };
    return (
        <>
            <Button className="Insert-Button" onPress={onOpen}> <Plus /> Services</Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Add Services</ModalHeader>
                            <ModalBody>
                                <form className="grid gap-3" onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="input-field col-span-2">
                                            <label htmlFor="Customer" className="">
                                                Services Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="ServiceName"
                                                type="text"
                                                placeholder="Services Name"
                                                value={formData.ServiceName}
                                                onChange={(e) => setFormData({ ...formData, ServiceName: e.target.value })}
                                                required
                                                className="w-full border border-gray-300 rounded-md" 
                                            />
                                        </div>
                                        <div className="input-field col-span-2">
                                            <label htmlFor="category" className="">
                                                Status
                                            </label>
                                            <select
                                                className='w-full border border-gray-300 rounded-md'
                                                id="Status"
                                                name="Status"
                                                value={formData.Status}
                                                onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
                                            >
                                                <option key="Active" value="Active">
                                                    Active
                                                </option>
                                                <option key="Inactive" value="Inactive">
                                                    Inactive
                                                </option>
                                            </select>
                                        </div>
                                        <div className="input-field col-span-2">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Service color</label>
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => setcolorOpen(!ColorOpen)}
                                                        className="w-full px-3 py-2 text-left border rounded-md flex items-center bg-white"
                                                    >
                                                        {selectedColor ? (
                                                            <>
                                                                <div className="h-4 w-4 rounded-full mr-2" style={{ backgroundColor: selectedColor }} />
                                                                <span className="text-gray-600">{selectedColor}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth="2"
                                                                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                                                    />
                                                                </svg>
                                                                <span>Pick a color</span>
                                                            </>
                                                        )}
                                                    </button>

                                                    {ColorOpen && (
                                                        <>
                                                            <div className="fixed inset-0" onClick={() => setcolorOpen(false)} />
                                                            <div className="absolute bottom-full z-10 mt-1 p-3 bg-white border rounded-md shadow-lg">
                                                                <div className="grid grid-cols-10 gap-1">
                                                                    {colorPalette.map((row, rowIndex) => (
                                                                        <div key={rowIndex} className="contents">
                                                                            {row.map((color) => (
                                                                                <button
                                                                                    key={color}
                                                                                    className={`h-5 w-5 rounded-full cursor-pointer hover:scale-110 transition-transform
                                                                                    ${selectedColor === color ? "ring-2 ring-offset-2 ring-blue-500" : ""}`}
                                                                                    style={{ backgroundColor: color }}
                                                                                    onClick={() => {
                                                                                        setSelectedColor(color)
                                                                                        setFormData({ ...formData, ServicesColor: color })
                                                                                        setcolorOpen(false)
                                                                                    }}
                                                                                    aria-label={`Select color ${color}`}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                        </div>
                                    </div>


                                    <div className="flex justify-start gap-1 mt-3">
                                        <button
                                            type='button'
                                            className="Close-btn"
                                            onClick={onClose}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            disabled={isSubmitting}
                                            className={`submit-btn ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                                                }`}
                                            type='submit'
                                        >
                                            {isSubmitting ? "Wait..." : "Submit"}
                                        </button>
                                    </div>
                                </form>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
