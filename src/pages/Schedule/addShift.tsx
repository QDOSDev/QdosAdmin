import { message } from 'antd';
import axios from 'axios';
import Cookies from 'js-cookie';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AppDispatch, IRootState } from '../../store';
import { Drawer, DrawerContent, DrawerBody, DrawerFooter, Button, useDisclosure, Spinner } from '@nextui-org/react';
export default function addShift() {
    const endpoint = import.meta.env.VITE_API_LIVEHOST;
    const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;
    const dispatch: AppDispatch = useDispatch()
    const token = Cookies.get('token')
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    interface Customer {
        id: number,
        customer_name: string
    }
    interface Gaurds {
        ID: number,
        first_name: string,
        last_name: string
    }
    interface Services {
        ID: number,
        Service_name: string,

    }
    interface Site {
        ID: number,
        site_name: string,

    }

    const { siteId } = useParams()
   

    const [formData, setFormData] = useState({
        gaurd_name: "",
        shift_date: "",
        schedulestart: "",
        scheduleend: "",
        customer: "",
        site: "",
        service: "",
        note: "",
    });







    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));
    };


    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await axios.post(`${endpoint}?route=User/Insert/Shift`, formData, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.status === true) {
                message.success(data.message);
                setFormData({
                    gaurd_name: "",
                    shift_date: "",
                    schedulestart: "",
                    scheduleend: "",
                    customer: "",
                    site: "",
                    service: "",
                    note: "",
                })


            } else {
                message.error(data.message);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            message.error("Submission failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };



    const handleCustomerChange = (customerId: any) => {
        setFormData((prev) => ({
            ...prev,
            customer: customerId,
        }));

    };



    return (
     <>
     </>



    )
}
