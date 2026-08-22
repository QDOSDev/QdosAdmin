"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Drawer, DrawerContent, Switch } from "@nextui-org/react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "../../../store"
import { ChevronUpIcon, ChevronDownIcon } from "lucide-react"
import Cookies from "js-cookie"
import axios from "axios"
import { Modal } from "antd"


export default function EditShift({ isOpen, setIsOpen, gaurds, allcustomers, services, site, shiftdata }: any) {
    const dispatch: AppDispatch = useDispatch()

    const [searchTerm, setSearchTerm] = useState("")
    const filteredOptions = gaurds.filter((guard: any) => guard.name.toLowerCase().includes(searchTerm.toLowerCase()))
    const apiKey = import.meta.env.VITE_API_X_HEADER_KEY
    const token = Cookies.get("token")
    const [Selectopen, setselectOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [licenseExpiryCheckBasedOn, setlicenseExpiryCheckBasedOn] = useState('shiftDate');
    const [Licenceexpirde, setlicenceexpirde] = useState('');

    const [formData, setFormData] = useState({
        guardName: "",
        shiftDate: "",
        startTime: "",
        endTime: "",
        customer: "",
        site: "",
        service: "",
        note: "",
        companyName: "",
        customerName: "",
        serviceName: "",
        siteName: "",
        acceptStatus: "",
        serviceColor: "",
        guardFirstName: "",
        guardLastName: "",
        createdAt: "",
        createdBy: "",
        updatedAt: "",
        updatedBy: "",
    });

    useEffect(() => {
        if (shiftdata.length === 1) {
            const shift = shiftdata[0];
            setFormData({
                guardName: shift.Shift_Guardid || "",
                shiftDate: shift.day || "",
                startTime: shift.schedule_start || "",
                endTime: shift.schedule_end || "",
                customer: shift.Shift_Customerid || "",
                site: shift.Shift_Siteid || shift.locationId || "",
                service: shift.Shift_Serviceid || "",
                note: shift.notes || "",
                companyName: shift.Company_Name || "",
                customerName: shift.Customer_Name || "",
                serviceName: shift.Service_Name || "",
                siteName: shift.Site_Name || "",
                acceptStatus: shift.Accept_status || "Pending",
                serviceColor: shift.Service_Color || "",
                guardFirstName: shift.guard_first_name || "",
                guardLastName: shift.guard_last_name || "",
                createdAt: shift.created_at || "",
                createdBy: shift.created_by || "",
                updatedAt: shift.updated_at || "",
                updatedBy: shift.updated_by || "",
            });
        } else {
            setFormData({
                guardName: "",
                shiftDate: "",
                startTime: "",
                endTime: "",
                customer: "",
                site: "",
                service: "",
                note: "",
                companyName: "",
                customerName: "",
                serviceName: "",
                siteName: "",
                acceptStatus: "Pending",
                serviceColor: "",
                guardFirstName: "",
                guardLastName: "",
                createdAt: "",
                createdBy: "",
                updatedAt: "",
                updatedBy: "",
            });
        }
    }, [shiftdata]);

    const isMultiple = Array.isArray(shiftdata) && shiftdata.length > 1;
    const getTitle = () => {
        if (Array.isArray(shiftdata)) {
            return shiftdata.length > 1 ? `Edit ${shiftdata.length} Shifts` : "Edit Shift"
        }
        return "Edit Shift"
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }))

        if (formErrors[id]) {
            setFormErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[id]
                return newErrors
            })
        }
    }

    const handleCustomerChange = (customerId: any) => {
        setFormData((prev) => ({
            ...prev,
            customer: customerId,
            // Reset site when customer changes
            site: "",
        }))

        // Clear customer error
        if (formErrors.customer) {
            setFormErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors.customer
                return newErrors
            })
        }


    }




    const getDaysUntilExpiry = (expiryDateStr: string, referenceDateStr: string): number => {
        const [ey, em, ed] = expiryDateStr.split("-").map(Number)
        const expiryDate = new Date(ey, em - 1, ed)

        const [ry, rm, rd] = referenceDateStr.split("-").map(Number)
        const referenceDate = new Date(ry, rm - 1, rd)

        expiryDate.setHours(0, 0, 0, 0)
        referenceDate.setHours(0, 0, 0, 0)

        const diff = expiryDate.getTime() - referenceDate.getTime()
        return Math.ceil(diff / (1000 * 60 * 60 * 24))
    }

    const shouldWarnAboutLicense = (): { warn: boolean, daysLeft: number } => {
        const expiry = Licenceexpirde;
        const basis: string = licenseExpiryCheckBasedOn;

        const datesToCheck: string[] = []

        switch (basis) {
            case "shiftDate": {
                const dateStr = formData[basis]
                if (dateStr) datesToCheck.push(dateStr)
                break
            }
        }

        for (const refDate of datesToCheck) {
            const daysLeft = getDaysUntilExpiry(expiry, refDate)
            if (daysLeft <= 30) {
                return { warn: true, daysLeft }
            }
        }

        return { warn: false, daysLeft: 999 }
    }





    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) {
            return
        }

        const { warn, daysLeft } = shouldWarnAboutLicense()

        if (warn) {
            const modal = Modal.confirm({
                title: "License Expiry Warning",
                content: `License will expire on ${Licenceexpirde}`,
                footer: (
                    <div className='flex gap-2 mt-3'>
                        <button className="reset-btn" onClick={() => modal.destroy()}>
                            Cancel
                        </button>
                        <button className="Search-btn" onClick={async () => {
                            modal.destroy()
                            submitShift()
                        }}>
                            Ignore & Add
                        </button>
                    </div>
                ),
            })
        } else {
            submitShift()
        }

    }


    const submitShift = async () => {


        const shiftIds = Array.isArray(shiftdata)
            ? shiftdata.map((shift: any) => shift.id)
            : [shiftdata?.id]
        setLoading(true)
        try {
            const endpoint = `${import.meta.env.VITE_API_LIVEHOST}?route=User/Edit/Shift`
            const payload = {
                "ids": shiftIds,
                "guard_name": formData.guardName,
                "shift_date": formData.shiftDate,
                "schedulestart": formData.startTime,
                "scheduleend": formData.endTime,
                "customer": formData.customer,
                "site": formData.site,
                "service": formData.service,
                "note": formData.note,
            }

            const { data } = await axios.post(endpoint, payload, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            })

            if (data.status === true) {
                setIsOpen(false)
            } else {

            }
        } catch (error) {
            console.error("Error submitting form:", error)

        } finally {
            setLoading(false)
        }
    }

    const validateForm = () => {
        const errors: Record<string, string> = {}

        if (!isMultiple) {
            if (!formData.guardName) errors.guardName = "Guard is required";
            if (!formData.shiftDate) errors.shiftDate = "Shift date is required";
            if (!formData.startTime) errors.startTime = "Start time is required";
            if (!formData.endTime) errors.endTime = "End time is required";
            if (!formData.customer) errors.customer = "Customer is required";
            if (!formData.site) errors.site = "Site is required";
            if (!formData.service) errors.service = "Service is required";
        }


        if (formData.customer && !formData.site) {
            errors.site = "Site is required because customer is selected";
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    return (
        <div>
            <Drawer isOpen={isOpen} onOpenChange={setIsOpen} size="xl" shouldBlockScroll={true}>
                <DrawerContent>
                    <form onSubmit={handleSubmit} className="p-6">
                        {/* Title */}
                        <h2 className="uppercase text-xl font-semibold mb-4 text-gray-700">{getTitle()}</h2>

                        <div className="flex flex-col gap-4">
                            {/* Status Information */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-600">Status</label>
                                        <p className="font-medium">{formData.acceptStatus}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">Company</label>
                                        <p className="font-medium">{formData.companyName}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Guard Name with current guard info */}
                            <div className="relative">
                                <label htmlFor="guard_name">
                                    Guard Name {isMultiple ? '' : <span className="text-red-500">*</span>}
                                </label>
                                {formData.guardFirstName && formData.guardLastName && (
                                    <p className="text-sm text-gray-600 mb-2">
                                        Current: {formData.guardFirstName} {formData.guardLastName}
                                    </p>
                                )}

                                <div
                                    className="w-full border rounded-md p-2 flex items-center justify-between bg-white cursor-pointer"
                                    onClick={() => setselectOpen(!Selectopen)}
                                >
                                    <span>
                                        {formData.guardName
                                            ? gaurds.find((option: any) => option.id.toString() === formData.guardName)?.name ||
                                            "Select an option"
                                            : "Select an option"}
                                    </span>

                                    {Selectopen ? (
                                        <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                                    ) : (
                                        <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                                    )}
                                </div>

                                {Selectopen && (
                                    <div className="absolute w-full border bg-white rounded-md shadow-md mt-1 z-10">
                                        <input
                                            type="text"
                                            placeholder="Search..."
                                            className="w-full border-b p-2"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />

                                        <div className="max-h-40 overflow-y-auto">
                                            {filteredOptions.length > 0 ? (
                                                filteredOptions.map((option: any) => (
                                                    <div
                                                        key={option.id}
                                                        className="p-2 hover:bg-gray-100 cursor-pointer"
                                                        onClick={() => {
                                                            setFormData((prev) => ({ ...prev, guardName: option.id.toString() }))
                                                            setlicenceexpirde(option.expiry_date);
                                                            setselectOpen(false)
                                                        }}
                                                    >
                                                        {option.name}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-2 text-gray-500">No options found</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {formErrors.guardName && <p className="text-red-500 text-xs mt-1">{formErrors.guardName}</p>}
                            </div>

                            {/* Shift Date */}
                            <div>
                                <label className="font-medium text-gray-600">
                                    Shift Date {isMultiple ? '' : <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    type="date"
                                    id="shiftDate"
                                    className="w-full border rounded-md px-3 py-2"
                                    value={formData.shiftDate}
                                    onChange={handleChange}
                                />
                                {formErrors.shiftDate && <p className="text-red-500 text-xs mt-1">{formErrors.shiftDate}</p>}
                            </div>

                            {/* Scheduled Start Time */}
                            <div className="flex justify-between gap-3">
                                <div className="w-full">
                                    <label className="font-medium text-gray-600">
                                        Scheduled Start Time
                                    </label>
                                    <input
                                        type="time"
                                        id="startTime"
                                        className="w-full border rounded-md px-3 py-2"
                                        value={formData.startTime || ""}
                                        onChange={handleChange}
                                    />
                                    {formErrors.startTime && <p className="text-red-500 text-xs mt-1">{formErrors.startTime}</p>}
                                </div>

                                {/* Scheduled End Time */}
                                <div className="w-full">
                                    <label className="font-medium text-gray-600">
                                        Scheduled End Time {isMultiple ? '' : <span className="text-red-500">*</span>}
                                    </label>
                                    <input
                                        type="time"
                                        id="endTime"
                                        className="w-full border rounded-md px-3 py-2"
                                        value={formData.endTime}
                                        onChange={handleChange}
                                    />
                                    {formErrors.endTime && <p className="text-red-500 text-xs mt-1">{formErrors.endTime}</p>}
                                </div>
                            </div>

                            {/* Customer with current info */}
                            <div>
                                <label className="font-medium text-gray-600">
                                    Customer {isMultiple ? '' : <span className="text-red-500">*</span>}
                                </label>
                                {formData.customerName && (
                                    <p className="text-sm text-gray-600 mb-2">
                                        Current: {formData.customerName}
                                    </p>
                                )}
                                <select
                                    id="customer"
                                    className={`w-full border rounded-md p-2`}
                                    value={formData.customer}
                                    onChange={(e) => handleCustomerChange(e.target.value)}
                                >
                                    <option value="">Select a customer</option>
                                    {allcustomers?.map((customer: any) => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.customer_name || customer.name}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.customer && <p className="text-red-500 text-xs mt-1">{formErrors.customer}</p>}
                            </div>

                            {/* Site with current info */}
                            <div>
                                <label className="font-medium text-gray-600">
                                    Site {isMultiple ? '' : <span className="text-red-500">*</span>}
                                </label>
                                {formData.siteName && (
                                    <p className="text-sm text-gray-600 mb-2">
                                        Current: {formData.siteName}
                                    </p>
                                )}
                                <select
                                    id="site"
                                    className="w-full border rounded-md p-2"
                                    value={formData.site}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, site: e.target.value }))}
                                    disabled={!formData.customer}
                                >
                                    <option value="">Select a Site</option>
                                    {site?.map((siteItem: any) => (
                                        <option key={siteItem.ID} value={siteItem.ID}>
                                            {siteItem.site_name || siteItem.name}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.site && <p className="text-red-500 text-xs mt-1">{formErrors.site}</p>}
                            </div>

                            {/* Service with current info */}
                            <div>
                                <label className="font-medium text-gray-600">
                                    Service {isMultiple ? '' : <span className="text-red-500">*</span>}
                                </label>
                                {formData.serviceName && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm text-gray-600">Current: {formData.serviceName}</span>
                                        {formData.serviceColor && (
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: formData.serviceColor }}
                                            />
                                        )}
                                    </div>
                                )}
                                <select
                                    id="service"
                                    className={`w-full border rounded-md p-2`}
                                    value={formData.service}
                                    onChange={handleChange}
                                >
                                    <option value="">Select a Service</option>
                                    {services?.map((service: any) => (
                                        <option key={service.ID} value={String(service.ID)}>
                                            {service.Service_name}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.service && <p className="text-red-500 text-xs mt-1">{formErrors.service}</p>}
                            </div>

                            {/* Note */}
                            <div>
                                <label className="font-medium text-gray-600">
                                    Note
                                </label>
                                <textarea
                                    id="note"
                                    className="w-full border rounded-md p-2 h-24"
                                    value={formData.note}
                                    onChange={handleChange}
                                    placeholder="Enter a note..."
                                />
                                {formErrors.note && <p className="text-red-500 text-xs mt-1">{formErrors.note}</p>}
                            </div>

                            {/* Metadata */}
                            <div className="bg-gray-50 p-4 rounded-lg mt-4">
                                <h3 className="text-sm font-medium text-gray-700 mb-3">Additional Information</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <label className="text-gray-600">Created By</label>
                                        <p>{formData.createdBy}</p>
                                        <label className="text-gray-600 mt-2">Created At</label>
                                        <p>{new Date(formData.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <label className="text-gray-600">Updated By</label>
                                        <p>{formData.updatedBy !== "null null" ? formData.updatedBy : "Not updated"}</p>
                                        <label className="text-gray-600 mt-2">Updated At</label>
                                        <p>{formData.updatedAt ? new Date(formData.updatedAt).toLocaleString() : "Not updated"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="mt-4 flex gap-3">
                                <button type="button" className="reset-btn" onClick={() => setIsOpen(false)} >
                                    Cancel
                                </button>
                                <button
                                    className={` ${loading ? "bg-gray-400 cursor-not-allowed" : "Search-btn"
                                        }`}
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="flex items-center">
                                            Updating...
                                        </span>
                                    ) : (
                                        "Update"
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </DrawerContent>
            </Drawer>
        </div>
    )
}