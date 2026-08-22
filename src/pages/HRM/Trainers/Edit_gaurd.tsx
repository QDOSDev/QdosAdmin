import { message, Select } from 'antd';
import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { IRootState } from '../../../store';
import { useSelector } from 'react-redux';
import Loader from '../../../components/Loader';

export default function Edit_Gaurd() {
    const { id } = useParams()
    const endpoint = import.meta.env.VITE_API_LIVEHOST;
    const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;
    const token = Cookies.get('token')
    const [loading, setLoading] = useState(false);
    const [viewGaurd, setViewGaurd] = useState([])
    const location = useLocation()
    const navigate = useNavigate()
    interface GuardData {
        first_name: string;
        last_name: string;
        short_name: string;
        status: string;
        role: string;
        Company_ID: string;
        License_number: string;
        address_line1: string;
        address_line2: string;
        city: string;
        state_province: string;
        zip_postal_code: string;
        country: string;
        mobile_phone: string;
        email: string;
        alternate_phone: string;
        phone_type: string;
        date_of_birth: string;
        sin: string;
        gender: string;
        ethnicity: string;
        hair_color: string;
        eye_color: string;
        height: string;
        weight: string;
        marital_status: string;
        dependents: string;
        emergency_contact: string;
        emergency_contact_phone: string;
        reference_type: string;
        reference_value: string;
        start_date: string;
        end_date: string;
        termination_reason: string;
        employment_insurance: string;
        next_review: string;
        last_review: string;
        qualification: string;
        effective_date: string;
        expiry_date: string;
        fir_aid_level: string;
        fir_aid_value: string;
    }
    
    const [originalData, setOriginalData] = useState<GuardData | null>(null);

    const { action } = location.state || { action: "edit", site: {} };
    const isViewMode = action === "view";
   
    interface Role {
        id: string;
        name: string;
    }
    const [rolesList, setRolesList] = useState<Role[]>([]);
    const rolelisting = async (forceReload = false) => {
        try {
            const { data } = await axios.get(`${endpoint}?route=admin/get/role`, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (data.status === false) {
                message.error(data.message)
            }
            setRolesList(data.data);
        } catch (error) {
            setLoading(false);
        }
    };

    useEffect(() => {
        rolelisting()
    }, [])

    const stateOptions = [
        { value: "AL", label: "Alabama" },
        { value: "AK", label: "Alaska" },
        { value: "AZ", label: "Arizona" },
        { value: "AR", label: "Arkansas" },
        { value: "CA", label: "California" },
        { value: "CO", label: "Colorado" },
        { value: "CT", label: "Connecticut" },
        { value: "DE", label: "Delaware" },
        { value: "FL", label: "Florida" },
        { value: "GA", label: "Georgia" },
        { value: "HI", label: "Hawaii" },
        { value: "AB", label: "Alberta" },
        { value: "BC", label: "British Columbia" },
        { value: "MB", label: "Manitoba" },
        { value: "NB", label: "New Brunswick" },
        { value: "NL", label: "Newfoundland and Labrador" },
        { value: "NS", label: "Nova Scotia" },
        { value: "ON", label: "Ontario" },
        { value: "PE", label: "Prince Edward Island" },
        { value: "QC", label: "Quebec" },
        { value: "SK", label: "Saskatchewan" },
    ];

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        short_name: "",
        status: "Active",
        role: "",
        License_number: "",
        Company_ID: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state_province: "",
        zip_postal_code: "",
        country: "",
        mobile_phone: "",
        email: "",
        alternate_phone: "",
        phone_type: "",
        date_of_birth: "",
        sin: "",
        gender: "",
        ethnicity: "",
        hair_color: "",
        eye_color: " ",
        height: "",
        weight: "",
        marital_status: "",
        dependents: "",
        emergency_contact: "",
        emergency_contact_phone: "",
        reference_type: "",
        reference_value: "",
        start_date: "",
        end_date: "",
        termination_reason: "",
        employment_insurance: "",
        next_review: "",
        last_review: "",
        qualification: "",
        effective_date: "",
        expiry_date: "",
        fir_aid_level: "",
        fir_aid_value: "",
    });

    const handleChange = (e: any) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const hanndleSubmit = async (e: any) => {
        try {
            e.preventDefault();
            setLoading(true); // Set loading state when submission starts
            const { data } = await axios.post(`${endpoint}?route=APS/Employer/Edit&ID=${id}`, formData, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            })
            if (data.status === true) {
                message.success("Edited successfully")
                navigate('/managepeople')
            }
        } catch (error) {
            console.log(error)
            message.error("An error occurred while submitting the form");
        } finally {
            setLoading(false); // Reset loading state regardless of success or failure
        }
    }

    const [isLoading, setLoader] = useState(false);

    const hasFormChanged = () => {
        if (!originalData) return false;
        return JSON.stringify(originalData) !== JSON.stringify(formData);
    };

    const getDetails = async () => {
        setLoader(true);
        try {
            const { data } = await axios.get(`${endpoint}?route=APS/Employer/View&ID=${id}`, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.status === true) {
                if (data.status === true && data.data.length > 0) {
                    const guard = data.data[0];
                    const guardData = {
                        first_name: guard.first_name,
                        last_name: guard.last_name,
                        short_name: guard.short_name,
                        status: guard.status,
                        role: guard.role,
                        Company_ID: guard.Company_ID,
                        License_number: guard.License_number,
                        address_line1: guard.address_line1,
                        address_line2: guard.address_line2,
                        city: guard.city,
                        state_province: guard.state_province,
                        zip_postal_code: guard.zip_postal_code,
                        country: guard.country,
                        mobile_phone: guard.mobile_phone,
                        email: guard.email,
                        alternate_phone: guard.alternate_phone,
                        phone_type: guard.phone_type,
                        date_of_birth: guard.date_of_birth,
                        sin: guard.sin,
                        gender: guard.gender,
                        ethnicity: guard.ethnicity,
                        hair_color: guard.hair_color,
                        eye_color: guard.eye_color,
                        height: guard.height,
                        weight: guard.weight,
                        marital_status: guard.marital_status,
                        dependents: guard.dependents,
                        emergency_contact: guard.emergency_contact,
                        emergency_contact_phone: guard.emergency_contact_phone,
                        reference_type: guard.reference_type,
                        reference_value: guard.reference_value,
                        start_date: guard.start_date,
                        end_date: guard.end_date,
                        termination_reason: guard.termination_reason,
                        employment_insurance: guard.employment_insurance,
                        next_review: guard.next_review,
                        last_review: guard.last_review,
                        qualification: guard.qualification,
                        effective_date: guard.effective_date,
                        expiry_date: guard.expiry_date,
                        fir_aid_level: guard.fir_aid_level,
                        fir_aid_value: guard.fir_aid_value,
                    };
                    setFormData(guardData);
                    setOriginalData(guardData);
                } else {
                    message.warning("No data found");
                }
            } else if (data.status === false) {
                message.error(data.message);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            message.error("Submission failed. Please try again.");
        }
        setLoader(false);
    }

    useEffect(() => {
        getDetails()
    }, [])

    return (
        <div>
            {isLoading === true && <Loader />}
            <form onSubmit={hanndleSubmit}>
                <div
                    className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 shadow-medium rounded-large transition-transform-background motion-reduce:transition-none"
                    tabIndex={-1}
                >
                    <div className="relative flex w-full p-3 flex-auto flex-col place-content-inherit align-items-inherit h-auto break-words text-left overflow-y-auto subpixel-antialiased">
                        <h2 className="uppercase text-xl">{isViewMode ? "View Employee" : "Edit Employee"}</h2>
                        <span
                            aria-hidden="true"
                            className="w-px h-px block"
                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                        />
                        <div
                            className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 shadow-medium transition-transform-background motion-reduce:transition-none rounded-[10px] p-2 mb-2"
                            tabIndex={-1}
                        >
                            <div className="title border-b pb-2 w-full flex justify-between">
                                <span className="">General info</span>
                            </div>
                            <div className="relative flex w-full p-3 flex-auto flex-col place-content-inherit align-items-inherit h-auto break-words text-left overflow-y-auto subpixel-antialiased">
                                <div className="grid grid-cols-4 gap-5">
                                    <div>
                                        <label htmlFor="first_name">
                                            First name
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex items-center">
                                            <input
                                                readOnly={isViewMode}
                                                id="first_name"
                                                className="w-full border border-gray-300 rounded-md"
                                                placeholder="First name"
                                                type="text"
                                                value={formData.first_name}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <span
                                            aria-hidden="true"
                                            className="w-px h-px block"
                                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="last_name">
                                            Last name
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex items-center">
                                            <input readOnly={isViewMode}
                                                id="last_name"
                                                className="w-full border border-gray-300 rounded-md"
                                                placeholder="Last name"
                                                type="text"
                                                value={formData.last_name}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <span
                                            aria-hidden="true"
                                            className="w-px h-px block"
                                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="short_name">
                                            Short name
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex items-center">
                                            <input readOnly={isViewMode}
                                                id="short_name"
                                                className="w-full border border-gray-300 rounded-md"
                                                placeholder="Short name"
                                                type="text"
                                                value={formData.short_name}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <span
                                            aria-hidden="true"
                                            className="w-px h-px block"
                                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email">Email</label>
                                        <div className="flex items-center">
                                            <input readOnly={isViewMode}
                                                id="email"
                                                className="w-full border border-gray-300 rounded-md"
                                                placeholder="Email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <span
                                            aria-hidden="true"
                                            className="w-px h-px block"
                                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="status">
                                            Status
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            disabled={isViewMode}
                                            id="status"
                                            className="w-full border border-gray-300 rounded-md"
                                            value={formData.status}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select an option</option>
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                        <span
                                            aria-hidden="true"
                                            className="w-px h-px block"
                                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                        />
                                    </div>


                                    <div>
                                        <label htmlFor="role">
                                            Role
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <Select
                                            id="role"
                                            allowClear={!isViewMode}
                                            size="large"
                                            placeholder="Select a role"
                                            disabled={isViewMode}
                                            value={formData.role || undefined}
                                            onChange={(value) =>
                                                setFormData((prev: any) => ({
                                                    ...prev,
                                                    role: value,
                                                    companies: value === "1" ? [] : prev.companies,
                                                }))
                                            }
                                            style={{ width: '100%' }}
                                            options={rolesList.map((role) => ({
                                                value: role.id,
                                                label: role.name,
                                            }))}
                                        />
                                        <span
                                            aria-hidden="true"
                                            className="w-px h-px block"
                                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                        />
                                    </div>

                                    {formData.role !== '1' && formData.role !== '' && (
                                        <div>
                                            <label htmlFor="role">
                                                Company
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                mode="multiple"

                                                disabled={isViewMode} // Prevent selection changes in view mode

                                                id="companies"
                                                size="large"
                                                allowClear={!isViewMode}
                                                placeholder="Select a company"
                                                value={formData.Company_ID || undefined}
                                                onChange={(value) =>
                                                    setFormData((prev: any) => ({
                                                        ...prev,
                                                        Company_ID: value,
                                                    }))
                                                }
                                                style={{ width: "100%" }}
                                            
                                            />
                                        </div>
                                    )}



                                    {(Number(formData.role) === 2) && (
                                        <div>
                                            <label htmlFor="License_number">
                                                License number
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <div className="flex items-center">
                                                <input
                                                    id="License_number"

                                                    className="w-full border border-gray-300 rounded-md"
                                                    placeholder="License number"
                                                    type="text"
                                                    value={formData.License_number}
                                                    onChange={handleChange}
                                                    readOnly={isViewMode}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {(Number(formData.role) === 2) && (
                                        <div>
                                            <label htmlFor="effective_date">
                                                Effective date
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <div className="flex items-center">
                                                <input readOnly={isViewMode}
                                                    id="effective_date"
                                                    className="w-full border border-gray-300 rounded-md"
                                                    placeholder="Effective date"
                                                    type="date"
                                                    value={formData.effective_date}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <span
                                                aria-hidden="true"
                                                className="w-px h-px block"
                                                style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                            />
                                        </div>
                                    )}
                                    {(Number(formData.role) === 2) && (
                                        <div>
                                            <label htmlFor="expiry_date">
                                                Expiry date
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <div className="flex items-center">
                                                <input readOnly={isViewMode}
                                                    id="expiry_date"
                                                    className="w-full border border-gray-300 rounded-md"
                                                    placeholder="Expiry date"
                                                    type="date"
                                                    value={formData.expiry_date}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <span
                                                aria-hidden="true"
                                                className="w-px h-px block"
                                                style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                            />
                                        </div>
                                    )}

                                    {(Number(formData.role) === 2) && (
                                        <>
                                            <div>
                                                <label htmlFor="fir_aid_level">
                                                    First Aid Level
                                                </label>
                                                <select
                                                    id="fir_aid_level"
                                                    className="w-full border border-gray-300 rounded-md cursor-pointer"
                                                    value={formData.fir_aid_level}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Select an option</option>
                                                    <option value="1">Level 1</option>
                                                    <option value="2">Level 2</option>
                                                    <option value="3">Level 3</option>
                                                </select>
                                                <span
                                                    aria-hidden="true"
                                                    className="w-px h-px block"
                                                    style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="fir_aid_value">
                                                    First Aid value
                                                </label>
                                                <div className="flex items-center">
                                                    <input
                                                    readOnly={isViewMode}
                                                        id="fir_aid_value"
                                                        className="w-full border border-gray-300 rounded-md"
                                                        placeholder="First Aid Value"
                                                        type="text"
                                                        value={formData.fir_aid_value}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                                <span
                                                    aria-hidden="true"
                                                    className="w-px h-px block"
                                                    style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                                />
                                            </div>
                                        </>
                                    )}


                                </div>
                            </div>

                            <div className="p-3 h-auto flex w-full items-center overflow-hidden color-inherit subpixel-antialiased rounded-b-large" />
                        </div>
                        <div
                            className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 shadow-medium transition-transform-background motion-reduce:transition-none rounded-[10px] p-2 mb-2"
                            tabIndex={-1}
                        >
                            <div className="title border-b pb-2 w-full flex justify-between">
                                <span className="">Contact</span>
                            </div>
                            <div className="relative flex w-full p-3 flex-auto flex-col place-content-inherit align-items-inherit h-auto break-words text-left overflow-y-auto subpixel-antialiased">
                                <div className="grid grid-cols-4 gap-5">
                                    <div>
                                        <label htmlFor="address_line1">Address line 1</label>
                                        <div className="flex items-center">
                                            <input readOnly={isViewMode}
                                                id="address_line1"
                                                className="w-full border border-gray-300 rounded-md"
                                                placeholder="Address line 1"
                                                type="text"
                                                value={formData.address_line1}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <span
                                            aria-hidden="true"
                                            className="w-px h-px block"
                                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="address_line2">Address line 2</label>
                                        <div className="flex items-center">
                                            <input readOnly={isViewMode}
                                                id="address_line2"
                                                className="w-full border border-gray-300 rounded-md"
                                                placeholder="Address line 2"
                                                type="text"
                                                value={formData.address_line2}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <span
                                            aria-hidden="true"
                                            className="w-px h-px block"
                                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="city">City</label>
                                        <div className="flex items-center">
                                            <input readOnly={isViewMode}
                                                id="city"
                                                className="w-full border border-gray-300 rounded-md"
                                                placeholder="City"
                                                type="text"
                                                value={formData.city}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <span
                                            aria-hidden="true"
                                            className="w-px h-px block"
                                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="state">State/Province</label>
                                        <select
                                            id="state"
                                            name="state"
                                            value={formData.state_province}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded-md"
                                        >
                                            <option value="" disabled>
                                                Select State/Province
                                            </option>
                                            {stateOptions.map((state: any) => (
                                                <option key={state.value} value={state.value}>
                                                    {state.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="zip_postal_code">Zip/Postal code</label>
                                        <div className="flex items-center">
                                            <input readOnly={isViewMode}
                                                id="zip_postal_code"
                                                className="w-full border border-gray-300 rounded-md"
                                                placeholder="Zip/Postal code"
                                                type="text"
                                                value={formData.zip_postal_code}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <span
                                            aria-hidden="true"
                                            className="w-px h-px block"
                                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="country">Country</label>
                                        <select
                                            id="country"
                                            className="w-full border border-gray-300 rounded-md"
                                            value={formData.country}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select an option</option>
                                            <option value="Canada">Canada</option>
                                            <option value="United States">United States</option>
                                        </select>
                                        <span
                                            aria-hidden="true"
                                            className="w-px h-px block"
                                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="mobile_phone">Mobile phone</label>
                                        <div className="flex items-center">
                                            <input readOnly={isViewMode}
                                                id="mobile_phone"
                                                className="w-full border border-gray-300 rounded-md"
                                                placeholder="Mobile phone"
                                                type="text"
                                                value={formData.mobile_phone}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <span
                                            aria-hidden="true"
                                            className="w-px h-px block"
                                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="alternate_phone">Alternate phone</label>
                                        <div className="flex items-center">
                                            <input readOnly={isViewMode}
                                                id="alternate_phone"
                                                className="w-full border border-gray-300 rounded-md"
                                                placeholder="Alternate phone"
                                                type="number"
                                                value={formData.alternate_phone}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <span
                                            aria-hidden="true"
                                            className="w-px h-px block"
                                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="phone_type">Phone type</label>
                                        <select
                                            id="phone_type"
                                            className="w-full border border-gray-300 rounded-md"
                                            value={formData.phone_type}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select an option</option>
                                            <option value="Cell">Cell</option>
                                            <option value="Home">Home</option>
                                            <option value="Primary">Primary</option>
                                            <option value="Secondary">Secondary</option>
                                            <option value="Work">Work</option>
                                        </select>
                                        <span
                                            aria-hidden="true"
                                            className="w-px h-px block"
                                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 h-auto flex w-full items-center overflow-hidden color-inherit subpixel-antialiased rounded-b-large" />
                        </div>
                        <div
                            className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 shadow-medium transition-transform-background motion-reduce:transition-none rounded-[10px] p-2 mb-2"
                            tabIndex={-1}
                        >
                            <div className="title border-b pb-2 w-full flex justify-between">
                                <span className="">Personal info</span>
                            </div>
                            <div className="relative flex w-full p-3 flex-auto flex-col place-content-inherit align-items-inherit h-auto break-words text-left overflow-y-auto subpixel-antialiased">
                                <div className="grid grid-cols-4 gap-5">
                                    <div>
                                        <label htmlFor="date_of_birth">Date of birth</label>
                                        <div className="flex items-center">
                                            <input readOnly={isViewMode}
                                                id="date_of_birth"
                                                className="w-full border border-gray-300 rounded-md"
                                                placeholder="Date of birth"
                                                type="date"
                                                value={formData.date_of_birth}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <span
                                            aria-hidden="true"
                                            className="w-px h-px block"
                                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="sin">SIN</label>
                                        <div className="flex items-center">
                                            <input readOnly={isViewMode}
                                                id="sin"
                                                className="w-full border border-gray-300 rounded-md"
                                                placeholder="SIN"
                                                type="text"
                                                value={formData.sin}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <span
                                            aria-hidden="true"
                                            className="w-px h-px block"
                                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="gender">Gender <span className="text-red-500">*</span></label>
                                        <select
                                            id="gender"
                                            className="w-full border border-gray-300 rounded-md"
                                            value={formData.gender}
                                            onChange={handleChange}
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>

                                        </select>
                                        <span
                                            aria-hidden="true"
                                            className="w-px h-px block"
                                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="ethnicity">Ethnicity <span className="text-red-500">*</span></label>
                                        <select
                                            id="ethnicity"
                                            className="w-full border border-gray-300 rounded-md"
                                            value={formData.ethnicity}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select an option</option>
                                            <option value="">African American</option>
                                            <option value="">Asian</option>
                                            <option value="">Caucasian</option>
                                            <option value="">Latino</option>
                                        </select>
                                        <span
                                            aria-hidden="true"
                                            className="w-px h-px block"
                                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="hair_color">Hair color <span className="text-red-500">*</span></label>
                                        <div className="flex items-center">
                                            <input readOnly={isViewMode}
                                                id="hair_color"
                                                className="w-full border border-gray-300 rounded-md"
                                                placeholder="Hair color"
                                                type="text"
                                                value={formData.hair_color}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <span
                                            aria-hidden="true"
                                            className="w-px h-px block"
                                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="eye_color">Eye color <span className="text-red-500">*</span></label>
                                        <div className="flex items-center">
                                            <input readOnly
                                                id="eye_color"
                                                className="w-full border border-gray-300 rounded-md"
                                                placeholder="Eye color"
                                                type="text"
                                                value={formData.eye_color}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <span
                                            aria-hidden="true"
                                            className="w-px h-px block"
                                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="height">Height (m)</label>
                                        <div className="flex items-center">
                                            <input readOnly={isViewMode}
                                                id="height"
                                                className="w-full border border-gray-300 rounded-md"
                                                placeholder="Height (m)"
                                                type="number"
                                                value={formData.height}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <span
                                            aria-hidden="true"
                                            className="w-px h-px block"
                                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="weight">Weight (lbs)</label>
                                        <div className="flex items-center">
                                            <input readOnly={isViewMode}
                                                id="weight"
                                                className="w-full border border-gray-300 rounded-md"
                                                placeholder="Weight (lbs)"
                                                type="number"
                                                value={formData.weight}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <span
                                            aria-hidden="true"
                                            className="w-px h-px block"
                                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="marital_status">Marital status</label>
                                        <select
                                            id="marital_status"
                                            className="w-full border border-gray-300 rounded-md"
                                            value={formData.marital_status}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select an option</option>
                                            <option value="Divorced">Divorced</option>
                                            <option value="Married">Married</option>
                                            <option value="Same Sex Partner">Same Sex Partner</option>
                                            <option value="Single">Single</option>
                                            <option value="Widowed">Widowed</option>
                                        </select>
                                        <span
                                            aria-hidden="true"
                                            className="w-px h-px block"
                                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="dependents">Dependents</label>
                                        <div className="flex items-center">
                                            <input readOnly
                                                id="dependents"
                                                className="w-full border border-gray-300 rounded-md"
                                                placeholder="Dependents"
                                                type="number"
                                                value={formData.dependents}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <span
                                            aria-hidden="true"
                                            className="w-px h-px block"
                                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="emergency_contact">Emergency contact</label>
                                        <div className="flex items-center">
                                            <input readOnly={isViewMode}
                                                id="emergency_contact"
                                                className="w-full border border-gray-300 rounded-md"
                                                placeholder="Emergency contact"
                                                type="text"
                                                value={formData.emergency_contact}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <span
                                            aria-hidden="true"
                                            className="w-px h-px block"
                                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="emergency_contact_phone">Emergency contact phone</label>
                                        <div className="flex items-center">
                                            <input readOnly={isViewMode}
                                                id="emergency_contact_phone"
                                                className="w-full border border-gray-300 rounded-md"
                                                placeholder="Emergency contact phone"
                                                type="text"
                                                value={formData.emergency_contact_phone}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <span
                                            aria-hidden="true"
                                            className="w-px h-px block"
                                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 h-auto flex w-full items-center overflow-hidden color-inherit subpixel-antialiased rounded-b-large" />
                        </div>

                        <div
                            className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 shadow-medium transition-transform-background motion-reduce:transition-none rounded-[10px] p-2 mb-2"
                            tabIndex={-1}
                        >
                            <div className="title border-b pb-2 w-full flex justify-between">
                                <span className="">Hiring history</span>
                            </div>
                            <div className="relative flex w-full p-3 flex-auto flex-col place-content-inherit align-items-inherit h-auto break-words text-left overflow-y-auto subpixel-antialiased">
                                <div className="grid grid-cols-4 gap-5">
                                    <div>
                                        <label htmlFor="start_date">
                                            Start date
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex items-center">
                                            <input readOnly={isViewMode}
                                                id="start_date"
                                                className="w-full border border-gray-300 rounded-md"
                                                placeholder="Start date"
                                                type="date"
                                                value={formData.start_date}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <span
                                            aria-hidden="true"
                                            className="w-px h-px block"
                                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="end_date">
                                            End date
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex items-center">
                                            <input readOnly={isViewMode}
                                                id="end_date"
                                                className="w-full border border-gray-300 rounded-md"
                                                placeholder="End date"
                                                type="date"
                                                value={formData.end_date}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <span
                                            aria-hidden="true"
                                            className="w-px h-px block"
                                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="termination_reason">
                                            Termination reason
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="termination_reason"
                                            className="w-full border border-gray-300 rounded-md"
                                            value={formData.termination_reason}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select an option</option>
                                            <option value="Lack of Work">Lack of Work</option>
                                            <option value="Termination for Cause">Termination for Cause</option>
                                        </select>
                                        <span
                                            aria-hidden="true"
                                            className="w-px h-px block"
                                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="employment_insurance">
                                            Employment insurance
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="employment_insurance"
                                            className="w-full border border-gray-300 rounded-md"
                                            value={formData.employment_insurance}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select an option</option>
                                            <option value="Eligible">Eligible</option>
                                            <option value="Not eligible">Not eligible</option>
                                        </select>
                                        <span
                                            aria-hidden="true"
                                            className="w-px h-px block"
                                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="next_review">
                                            Next review
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex items-center">
                                            <input readOnly={isViewMode}
                                                id="next_review"
                                                className="w-full border border-gray-300 rounded-md"
                                                placeholder="Next review"
                                                type="date"
                                                value={formData.next_review}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <span
                                            aria-hidden="true"
                                            className="w-px h-px block"
                                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="last_review">
                                            Last review
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex items-center">
                                            <input readOnly={isViewMode}
                                                id="last_review"
                                                className="w-full border border-gray-300 rounded-md"
                                                placeholder="Last review"
                                                type="date"
                                                value={formData.last_review}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <span
                                            aria-hidden="true"
                                            className="w-px h-px block"
                                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 h-auto flex w-full items-center overflow-hidden color-inherit subpixel-antialiased rounded-b-large" />
                        </div>

                        <span
                            aria-hidden="true"
                            className="w-px h-px block"
                            style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                        />
                        <div className="addMore mb-2 underline underline-offset-4 decoration-dotted decoration-blue-500 decoration-2 cursor-pointer" />
                        {!isViewMode && <button
                            className={`submit-btn ${!hasFormChanged() ? 'opacity-50 cursor-not-allowed' : ''} ${loading ? 'bg-gray-400' : ''}`}
                            type="submit"
                            disabled={!hasFormChanged() || loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                                    Submitting...
                                </div>
                            ) : (
                                "Submit"
                            )}
                        </button>}
                    </div>
                </div>
            </form>
        </div>
    )
}
