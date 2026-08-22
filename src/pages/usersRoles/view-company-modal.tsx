"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface CompanyDetails {
    Name: string
    logo?: string
    Address: string
    Contact_person: string
    Phone: string
    Email: string
}

interface ViewCompanyModalProps {
    isOpen: boolean
    onClose: () => void
    company: CompanyDetails
}

export default function ViewCompanyModal({ isOpen, onClose, company }: ViewCompanyModalProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true)
        } else {
            const timer = setTimeout(() => {
                setIsVisible(false)
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    if (!isVisible) return null

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isOpen ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
        >
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="relative w-full max-w-md rounded-lg bg-white shadow-lg transition-all duration-300 transform">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Company Details</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex flex-col items-center mb-6">
                        {company.logo ? (
                            <img
                                src={company.logo || "/placeholder.svg"}
                                alt={`${company.Name} logo`}
                                className="w-24 h-24 rounded-full object-cover border"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border">
                                <span className="text-gray-400 text-xl font-medium">{company.Name.substring(0, 2).toUpperCase()}</span>
                            </div>
                        )}
                        <h3 className="mt-4 text-xl font-semibold text-gray-800">{company.Name}</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-medium text-gray-500">Address</h4>
                            <p className="mt-1 text-gray-800">{company.Address || "Not provided"}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Contact Person</h4>
                                <p className="mt-1 text-gray-800">{company.Contact_person || "Not provided"}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Phone Number</h4>
                                <p className="mt-1 text-gray-800">{company.Phone || "Not provided"}</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-gray-500">Email Address</h4>
                            <p className="mt-1 text-gray-800">{company.Email || "Not provided"}</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end p-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

