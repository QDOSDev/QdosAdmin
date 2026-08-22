import { useEffect, useMemo, useState } from 'react';
import { Button } from '@nextui-org/react';
import { CheckCheck, ShieldOff, Eye } from 'lucide-react'
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux'
import Cookies from 'js-cookie';
import { Input, Modal, message } from 'antd';
import { AppDispatch, IRootState } from '../../store';
import Filter from '../guard/filter';
import { RxCross2 } from 'react-icons/rx';
export default function RejectedShift() {
    const dispatch: AppDispatch = useDispatch()

    interface Guard {
        ShiftID: number
        Company_Name: any,
        Customer_Name: any,
        Site_Name: any,
        Service_Name: any,
        shift_date: any,
        Accept_status: any
    }

    const [filters, setFilters] = useState({

        customer_Name: '',
        site_name: '',
        shift_date: '',
        Service_name: '',
        BETWEENshift_date: '',

    });
    const endpoint = import.meta.env.VITE_API_LIVEHOST;
    const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;
    const token = Cookies.get('token') || '';
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);




    const memoizedFilters = useMemo(() => filters, [filters]);

    const { loading } = useSelector((state: IRootState) => state.customerConfig) as { loading: boolean };

   

    const handlePageChange = (page: number) => {
        if (page !== currentPage) {
            setCurrentPage(page);
        }
    };

    const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newPageSize = parseInt(event.target.value, 10);
        setPageSize(newPageSize);
        setCurrentPage(1);
    };

    const handleAction = async (ShiftID: number, ShiftStatus: string, Note = "") => {
        try {
            const payload: any = { ShiftID, ShiftStatus };

            if (ShiftStatus === "Rejected") {
                payload.Note = Note;
            }

            await axios.post(`${endpoint}?route=Guard/Shift/Accpeted`, payload, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            message.success(`Shift ${ShiftStatus.toLowerCase()} successfully!`);
          
        } catch (error) {
            message.error("Something went wrong");
        }
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    interface ShiftData {
        Company_logo: string;
        Company_Name: string;
        shift_date: string;
        schedule_start: string;
        schedule_end: string;
        created_by: string;
        Customer_Name: string;
        Site_Name: string;
        Service_Name: string;
        note: string;
        Accept_status: string;
        updated_by?: string;
    }

    const [shiftData, setShiftData] = useState<ShiftData | null>(null);

    const handleViewDetails = (entry: any) => {
        setShiftData(entry);
        setIsModalOpen(true);
    };

    const removeFilter = (key: string) => {
        setFilters((prev) => ({
            ...prev,
            [key]: '',
        }));
    };
    return (
        <>
           
        </>
    );
}