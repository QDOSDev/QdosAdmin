import { message } from 'antd';
import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const colorPalette = [
    ["#9D174D", "#5B21B6", "#1D4ED8", "#0F766E", "#15803D", "#65A30D", "#C2410C", "#B91C1C", "#7C2D12", "#1F2937"],
    ["#DB2777", "#7C3AED", "#3B82F6", "#06B6D4", "#059669", "#84CC16", "#F97316", "#EF4444", "#92400E", "#4B5563"],
    ["#F472B6", "#A78BFA", "#60A5FA", "#22D3EE", "#34D399", "#A3E635", "#FB923C", "#FCA5A5", "#B45309", "#6B7280"],
    ["#FBCFE8", "#DDD6FE", "#93C5FD", "#67E8F9", "#6EE7B7", "#D9F99D", "#FED7AA", "#FEE2E2", "#D97706", "#9CA3AF"],
    ["#FCE7F3", "#EDE9FE", "#BFDBFE", "#A5F3FC", "#A7F3D0", "#ECFCCB", "#FFEDD5", "#FEE2E2", "#FDBA74", "#E5E7EB"],
]

export default function AddSite() {
    const endpoint = import.meta.env.VITE_API_LIVEHOST;
    const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;
    const token = Cookies.get('token')
    const [loading, setLoading] = useState(false);
    interface Customer {
        id: number,
        customer_name: string
    }
    const location = useLocation();
    const navigate = useNavigate();
    const { siteId } = useParams()
    const [customerList, setCustomerList] = useState<Customer[]>([])
    const [selectedColor, setSelectedColor] = useState("")
    const [ColorOpen, setColorOpen] = useState(false);

    const { site, mode } = location.state || { site: {}, mode: "edit" }; 
    const isViewMode = mode === "view";

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

    interface FormDataType {
        ID: any;
        site_name: string;
        site_status: string;
        customer_name: string;
        site_color: string;
        contact_phone: string;
        contact_email: string;
        site_supervisor_sms: string;
        site_supervisor_email: string;
        address_line_1: string;
        address_line_2: string;
        city: string;
        state_province: string;
        zip_postal_code: string;
        country: string;
    }


                         
    const [initialFormData, setInitialFormData] = useState<FormDataType>({
        ID: site?.ID || null,
        site_name: site?.site_name || "",
        site_status: site?.site_status || "",
        customer_name: site?.customer_name || "",
        site_color: site?.site_color || "",
        contact_phone: site?.contact_phone || "",
        contact_email: site?.contact_email || "",
        site_supervisor_sms: site?.site_supervisor_sms || "",
        site_supervisor_email: site?.site_supervisor_email || "",
        address_line_1: site?.address_line_1 || "",
        address_line_2: site?.address_line_2 || "",
        city: site?.city || "",
        state_province: site?.state_province || "",
        zip_postal_code: site?.zip_postal_code || "",
        country: site?.country || ""
    });

    const [formData, setFormData] = useState<FormDataType>({
        ID: site?.ID || null,
        site_name: site?.site_name || "",
        site_status: site?.site_status || "",
        customer_name: site?.customer_name || "",
        site_color: site?.site_color || "",
        contact_phone: site?.contact_phone || "",
        contact_email: site?.contact_email || "",
        site_supervisor_sms: site?.site_supervisor_sms || "",
        site_supervisor_email: site?.site_supervisor_email || "",
        address_line_1: site?.address_line_1 || "",
        address_line_2: site?.address_line_2 || "",
        city: site?.city || "",
        state_province: site?.state_province || "",
        zip_postal_code: site?.zip_postal_code || "",
        country: site?.country || ""
    });

    const validateField = (value: string) => {
        const trimmedValue = value.trim();
        return trimmedValue.length > 0 && !/^[.\s]+$/.test(value);
    };

    const hasFormChanged = () => {
        const requiredFieldsFilled = 
            validateField(formData.site_name) && 
            formData.site_status && 
            formData.customer_name;
        
        if (!requiredFieldsFilled) return false;
        
        return Object.keys(formData).some(key => {
            const currentValue = typeof formData[key as keyof FormDataType] === 'string' ? formData[key as keyof FormDataType]?.trim() : formData[key as keyof FormDataType];
            const initialValue = typeof initialFormData[key as keyof FormDataType] === 'string' ? initialFormData[key as keyof FormDataType]?.trim() : initialFormData[key as keyof FormDataType];
            return currentValue !== initialValue;
        });
    };

    const customer = async () => {
        try {
            const { data } = await axios.get(`${endpoint}?route=Api/Customer`, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.status === true) {
                setCustomerList(data.Data)


            } else if (data.status === false) {
                message.error(data.message);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            message.error("Submission failed. Please try again.");
        }
    }

    useEffect(() => {
        customer()
    }, [])


    const handleChange = (e: any) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleColorSelect = (color: any) => {
        setSelectedColor(color)
        setFormData({ ...formData, site_color: color });
        setColorOpen(false);
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        try {

            const url = siteId
                ? `${endpoint}?route=Update/site/data`
                : `${endpoint}?route=admin/add/Site`;
            const response = await axios.post(url, formData, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.status === true) {
                message.success(response.data.message);

                if (!siteId) {
                    setFormData({
                        ID: null,
                        site_name: "",
                        site_status: "",
                        customer_name: "",
                        site_color: "",
                        contact_phone: "",
                        contact_email: "",
                        site_supervisor_sms: "",
                        site_supervisor_email: "",
                        address_line_1: "",
                        address_line_2: "",
                        city: "",
                        state_province: "",
                        zip_postal_code: "",
                        country: ""
                    });
                } else {
                    navigate('/manage_site', { state: { refresh: true } });
                }

            } else {
                message.error(response.data.message);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            message.error("Submission failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <form onSubmit={handleSubmit} >
            <div
                className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 shadow-medium rounded-large transition-transform-background motion-reduce:transition-none"
                tabIndex={-1}
            >
                <div className="relative flex w-full p-3 flex-auto flex-col place-content-inherit align-items-inherit h-auto break-words text-left overflow-y-auto subpixel-antialiased">
                    <h2 className="uppercase text-xl">{isViewMode ? "View Site" : siteId ? "Edit Site" : "Add Site"}</h2>
                    <span
                        aria-hidden="true"
                        className="w-px h-px block"
                        style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                    />
                    <div className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 shadow-medium transition-transform-background motion-reduce:transition-none rounded-[10px] p-2 mb-2">
                        <div className="title border-b pb-2 w-full flex justify-between">
                            <span className="">General info</span>
                        </div>

                        <div className="relative flex w-full p-3 flex-auto flex-col place-content-inherit align-items-inherit h-auto break-words text-left overflow-y-auto subpixel-antialiased">
                            <div className="grid grid-cols-4 gap-5">
                          
                                <div>
                                    <label htmlFor="site_name">
                                        Site name
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center">
                                        <input
                                            id="site_name"
                                            className={`w-full border rounded-md ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                            placeholder="Site name"
                                            type="text"
                                            disabled={isViewMode}
                                            value={formData.site_name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="site_status">
                                        Site Status
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="site_status"
                                        className={`w-full border rounded-md ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                        value={formData.site_status}
                                        disabled={isViewMode}

                                        onChange={handleChange}
                                    >
                                        <option value="">Select an option</option>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="customer_name">
                                        Customer Name
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="customer_name"
                                        className={`w-full border rounded-md ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                        value={formData.customer_name}
                                        disabled={isViewMode}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select a customer</option>
                                        {customerList?.map((customer) => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.customer_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="site_color">Service color</label>
                                    <div>
                                        <button
                                            id="site_color"
                                            type="button"
                                            onClick={() => setColorOpen(!ColorOpen)}
                                            disabled={isViewMode}
                                            className="w-full p-[16px] text-left border rounded-md flex items-center bg-white"
                                        >
                                            {formData.site_color ? (
                                                <>
                                                    <div
                                                        className="h-4 w-4 rounded-full mr-2"
                                                        style={{ backgroundColor: formData.site_color }}
                                                    />
                                                    <span className="text-gray-600">{formData.site_color}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg
                                                        className="w-4 h-4 mr-2"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
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
                                                <div
                                                    className="inset-0 z-40"
                                                    onClick={() => setColorOpen(false)}
                                                    aria-hidden="true"
                                                />

                                                {/* Color picker container */}
                                                <div className="z-50 mt-1 p-3 bg-white border rounded-md shadow-lg fixed">
                                                    <div className="grid grid-cols-10 gap-1">
                                                        {colorPalette.map((row, rowIndex) => (
                                                            <div key={rowIndex} className="contents">
                                                                {row.map((color) => (
                                                                    <button
                                                                        key={color}
                                                                        className={`h-5 w-5 rounded-full cursor-pointer hover:scale-110 transition-transform ${formData.site_color === color ? "ring-2 ring-offset-2 ring-blue-500" : ""}`}
                                                                        style={{ backgroundColor: color }}
                                                                        onClick={() => handleColorSelect(color)}
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
                                    <label htmlFor="address_line_1">Address line 1</label>
                                    <div className="flex items-center">
                                        <input
                                            id="address_line_1"
                                            className={`w-full border rounded-md ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                            placeholder="Address line 1"
                                            type="text"
                                            disabled={isViewMode}
                                            value={formData.address_line_1}
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
                                    <label htmlFor="address_line_2">Address line 2</label>
                                    <div className="flex items-center">
                                        <input
                                            id="address_line_2"
                                            className={`w-full border rounded-md ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                            placeholder="Address line 2"
                                            type="text"
                                            disabled={isViewMode}
                                            value={formData.address_line_2}
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
                                        <input
                                            id="city"
                                            className={`w-full border rounded-md ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                            placeholder="City"
                                            type="text"
                                            disabled={isViewMode}
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
                                    <label htmlFor="state_province">State/Province</label>
                                    <select
                                        id="state_province"
                                        name="state_province"
                                        value={formData.state_province}
                                        disabled={isViewMode}
                                        onChange={handleChange}
                                        className={`w-full border rounded-md ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
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
                                        <input
                                            id="zip_postal_code"
                                            className={`w-full border rounded-md ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                            placeholder="Zip/Postal code"
                                            disabled={isViewMode}
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
                                        className={`w-full border rounded-md ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                        value={formData.country}
                                        disabled={isViewMode}
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
                                    <label htmlFor="contact_phone">Contact phone</label>
                                    <div className="flex items-center">
                                        <input
                                            id="contact_phone"
                                            className={`w-full border rounded-md ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                            placeholder="Contact phone"
                                            disabled={isViewMode}
                                            type="text"
                                            value={formData.contact_phone}
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
                                    <label htmlFor="contact_email">Contact Email</label>
                                    <div className="flex items-center">
                                        <input
                                            id="contact_email"
                                            className={`w-full border rounded-md ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                            placeholder="Contact email"
                                            disabled={isViewMode}
                                            type="email"
                                            value={formData.contact_email}
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
                                    <label htmlFor="site_supervisor_sms">
                                        Supervisor notifications SMS number
                                    </label>
                                    <div className="flex items-center">
                                        <input
                                            id="site_supervisor_sms"
                                            className={`w-full border rounded-md ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                            placeholder="Supervisor SMS"
                                            disabled={isViewMode}
                                            type="text"
                                            value={formData.site_supervisor_sms}
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
                                    <label htmlFor="site_supervisor_email">
                                        Site supervisor notifications email
                                    </label>
                                    <div className="flex items-center">
                                        <input
                                            id="site_supervisor_email"
                                            className={`w-full border rounded-md ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                            placeholder="Supervisor Email"
                                            disabled={isViewMode}
                                            type="email"
                                            value={formData.site_supervisor_email}
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
                    {!isViewMode && (
                        <button
                            className={`submit-btn ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                            type="submit"
                            disabled={
                                !formData.site_name ||
                                !formData.site_status ||
                                !formData.customer_name ||
                                loading ||
                                !hasFormChanged()
                            }
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin mr-2">⏳</span> Processing...
                                </>
                            ) : siteId ? "Update Site" : "Add Site"}
                        </button>
                    )}

                </div>
            </div>
        </form>



    )
}
