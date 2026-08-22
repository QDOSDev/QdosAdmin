
import * as React from "react";
import { type FormEvent, useState, type ChangeEvent } from "react"
import { Link, useNavigate } from "react-router-dom";
import IconMail from "../../components/Icon/IconMail";
import IconLockDots from "../../components/Icon/IconLockDots";
import { Button } from "@nextui-org/react";
import Google_svg from "/assets/images/google.svg";
import { google_login } from "../../utils/api";
import axios from "axios";
import { toast } from "react-toastify";
import CryptoJS from "crypto-js";
import Loader from "../../components/Loader";
import Animation from "../Auth/Animation";

import Cookies from "js-cookie";
import { message } from "antd";

const Companyadd = () => {
    const [isLoading, setIsLoading] =useState<boolean>(false); 
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        companyEmail: "",
        phoneNumber: "",
        company: "",
    })

    const endpoint = import.meta.env.VITE_API_LIVEHOST;
    const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;
    const token = Cookies.get("token") || "";

    const [errors, setErrors] = useState({
        firstName: "",
        lastName: "",
        companyEmail: "",
        phoneNumber: "",
        company: "",
    })

    const validateForm = () => {
        let isValid = true
        const newErrors = {
            firstName: "",
            lastName: "",
            companyEmail: "",
            phoneNumber: "",
            company: "",
            numberOfEmployees: "",
        }

        if (!formData.firstName.trim()) {
            newErrors.firstName = "First name is required"
            isValid = false
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = "Last name is required"
            isValid = false
        }

        if (!formData.companyEmail.trim()) {
            newErrors.companyEmail = "Company email is required"
            isValid = false
        } else if (!/\S+@\S+\.\S+/.test(formData.companyEmail)) {
            newErrors.companyEmail = "Please enter a valid email"
            isValid = false
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = "Phone number is required"
            isValid = false
        }

        if (!formData.company.trim()) {
            newErrors.company = "Company name is required"
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handlePhoneChange = (value: string, country: any) => {
        const phoneNumber = value ? `+${value}` : ''; // Ensure valid phone number
        setFormData((prev) => ({
            ...prev,
            phoneNumber,
        }));
    };
    

    const addCompany = async () => {
        const body = {
            Company_name: formData.company,
            First_Name: formData.firstName,
            Last_Name: formData.lastName,
            Number: formData.phoneNumber,
            Email: formData.companyEmail
        };

        try {
            const { data } = await axios.post(`${endpoint}?route=company/add`, body, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            })

            if (data.status === true) {
                message.success(data.message);
                setFormData({
                    firstName: "",
                    lastName: "",
                    companyEmail: "",
                    phoneNumber: "",
                    company: "",
                })
            }
        } catch (error) {
            message.error('Failed to add Company')
        }
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (validateForm()) {
            setIsLoading(true);
            await addCompany();
            setIsLoading(false);
        }
    }

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-[url(/assets/images/login_bg.jpg)] bg-cover bg-center bg-no-repeat px-4 py-6 dark:bg-[#060818] sm:px-8 overflow-hidden">
            <Animation />
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <Loader />
                </div>
            )}
            <div className="relative w-full max-w-[580px] h-auto mx-2 sm:mx-4 rounded-xl bg-gradient-to-br from-[#ffffff] via-[#f1f1f1] to-[#e4e4e4] dark:bg-gradient-to-br from-[#0E1726] to-[#1A2436]  overflow-hidden shadow-lg">
                <div className="relative flex flex-col justify-center rounded-xl bg-white/90 backdrop-blur-xl dark:bg-black/90 px-1 py-8 sm:w-full h-full mx-auto shadow-2xl">
                    <div className="mx-auto w-full max-w-[480px] ">
                        <div className="mb-8 text-center">
                            <h1 className="text-2xl font-extrabold uppercase !leading-snug text-[#0d3051] md:text-2xl">Add Company Information</h1>
                            <p className="text-sm font-bold leading-normal text-gray-700 dark:text-gray-300">
                                Please fill out the form below to add your company details.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 p-8 rounded-lg shadow Bs-company-f">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md"
                                    />
                                    {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
                                </div>

                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md"
                                    />
                                    {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="companyEmail" className="block text-sm font-medium text-gray-700">
                                    Company Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="companyEmail"
                                    name="companyEmail"
                                    value={formData.companyEmail}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md"
                                />
                                {errors.companyEmail && <p className="mt-1 text-sm text-red-500">{errors.companyEmail}</p>}
                            </div>

                            <div>
                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-1">
                                    <input type="number" className="w-full border border-gray-300 rounded-md" name="phoneNumber" id="phoneNumber" value={formData.phoneNumber}  // Bind phone number value from state
                                        onChange={handleChange} />

                                    {(errors.phoneNumber) && (
                                        <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                                    Company <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="company"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md"
                                />
                                {errors.company && <p className="mt-1 text-sm text-red-500">{errors.company}</p>}
                            </div>

                            <div>
                                <Button
                                    type="submit"
                                    disabled={isLoading} 
                                    className="!mt-6 w-full border-0 uppercase shadow-xl bg-[#0d3051] text-white hover:bg-primary-dark active:bg-primary-dark transition"
                                >
                                    {isLoading ? "Processing..." : "Submit"} 
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Companyadd;

