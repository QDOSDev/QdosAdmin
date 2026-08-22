import React, { useEffect, useState } from "react";
import View from '../../../public/assets/APSIcon/View';
import Edit from '../../../public/assets/APSIcon/Edit';
import Delete from '../../../public/assets/APSIcon/delect';
import axios from 'axios';
import Cookies from 'js-cookie';
import { message } from 'antd';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
} from "@nextui-org/react";
import Swal from "sweetalert2";
import Restore from "../../../public/assets/APSIcon/Restore";
import { useSelector } from "react-redux";
import { IRootState } from "../../store";



const colorPalette = [
    ["#9D174D", "#5B21B6", "#1D4ED8", "#0F766E", "#15803D", "#65A30D", "#C2410C", "#B91C1C", "#7C2D12", "#1F2937"],
    ["#DB2777", "#7C3AED", "#3B82F6", "#06B6D4", "#059669", "#84CC16", "#F97316", "#EF4444", "#92400E", "#4B5563"],
    ["#F472B6", "#A78BFA", "#60A5FA", "#22D3EE", "#34D399", "#A3E635", "#FB923C", "#FCA5A5", "#B45309", "#6B7280"],
    ["#FBCFE8", "#DDD6FE", "#93C5FD", "#67E8F9", "#6EE7B7", "#D9F99D", "#FED7AA", "#FEE2E2", "#D97706", "#9CA3AF"],
    ["#FCE7F3", "#EDE9FE", "#BFDBFE", "#A5F3FC", "#A7F3D0", "#ECFCCB", "#FFEDD5", "#FEE2E2", "#FDBA74", "#E5E7EB"],
];

export default function ServiceTrash() {
    const [List, setList] = React.useState([]);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [totalPages, setTotalPages] = React.useState(1);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [pageSize, setPageSize] = React.useState(5);
    const [totalRecords, setTotalRecords] = React.useState(0);
    const [loading, setLoading] = React.useState<boolean>(true);
    const endpoint = import.meta.env.VITE_API_LIVEHOST;
    const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;
    const token = Cookies.get('token') || '';
    const [selectedColor, setSelectedColor] = useState("");
    const [ColorOpen, setcolorOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);


   
    const initialFormData = {
        ID: "",
        ServiceName: "",
        Status: "Active",
        ServicesColor: "",
    };

    const [formData, setFormData] = useState(initialFormData);

    const openModal = (entry: any) => {
        setFormData({
            ID: entry.ID,
            ServiceName: entry.Service_name,
            Status: entry.Service_status,
            ServicesColor: entry.Service_color,
        });
        setSelectedColor(entry.Service_color);
        onOpenChange();
    };



    const getserviceslist = async (page = 1, pageSize = 5) => {
        try {
            const { data } = await axios.get(`${endpoint}?route=restore/service/list&page=${page}&pageSize=${pageSize}`, {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.status) {
                setList(data.Data);
                setCurrentPage(data.Pagination.currentPage);
                setTotalPages(data.Pagination.totalPages);
                setTotalRecords(data.Pagination.totalRecords);
                setLoading(false);
            }
        } catch (error) {
            message.error('Something went wrong while fetching inventory data.');
        }
    };



    
            useEffect(() => {
                getserviceslist(currentPage, pageSize);
            }, [currentPage, pageSize])


    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handlePageClick = (page: any) => {
        if (page !== currentPage) {
            setCurrentPage(page);
        }
    };

    const handlePageSizeChange = (e: any) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(1);
    };

    const handleRestore = async (ID: any) => {
        try {

            const { data } = await axios.post(`${endpoint}?route=restore/service/data`, { ID }, {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });


            if (data.status == true) {
                message.success('Site restored successfully.');
                getserviceslist()


            }
        } catch (error) {
            message.error('Something went wrong while deleting the site.');

        }
    }

    const [selectedCustomer, setSelectedCustomer] = useState<any>("");
    const handleView = (entry: any) => {
        setSelectedCustomer(entry)
        onOpenChange()
    }



    return (
        <>
          
                <div className="w-full">
                    <div className="table-wrapper">
                        <div className="border-t-8 border-[#113354]"></div>
                        <table className="data-table">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Services name</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Services status</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    [...Array(5)].map((_, index) => (
                                        <tr key={index} className="border-b last:border-b-0">
                                            <td className="px-4 py-3">
                                                <div className="w-12 rounded h-5 bg-gray-300 animate-pulse"></div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                <div className="w-24 rounded h-5 bg-gray-300 animate-pulse"></div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                <div className="w-16 rounded h-5 bg-gray-300 animate-pulse"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : List.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-6">
                                            <div className="flex flex-col items-center justify-center">
                                                <img src="/assets/images/Empty_table.png" alt="No data available" className="" />
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    List.map((entry: any, index) => {
                                        const rowIndex = (currentPage - 1) * pageSize + (index + 1);

                                        return (
                                            <tr
                                                key={entry?.ID}
                                                className="border-b last:border-b-0 hover:shadow-md hover:font-semibold"
                                            >
                                                <td className="px-4 py-3 text-gray-600 flex gap-3">
                                                    <p
                                                        className="border h-5 w-5 rounded-full cursor-pointer hover:scale-110 transition-transform"
                                                        style={{ backgroundColor: entry.Service_color }}
                                                    />
                                                    {entry.Service_name || '---'}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">{entry.Service_status || '---'}</td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    <div className="flex gap-2">
                                                        <span className="cursor-pointer" onClick={() => openModal(entry)}>
                                                            <View className="h-5 w-5 text-gray-400" />
                                                        </span>
                                              
                                                            <span className="cursor-pointer"
                                                                title="Restore"
                                                                onClick={() => {
                                                                    Swal.fire({
                                                                        title: 'Are you sure?',

                                                                        icon: 'question',
                                                                        showCancelButton: true,
                                                                        confirmButtonColor: getComputedStyle(document.documentElement).getPropertyValue('--yellow-color').trim(),
                                                                        cancelButtonColor: '#d33',
                                                                        confirmButtonText: 'Yes, restore it!',
                                                                        cancelButtonText: 'Cancel',
                                                                    }).then((result) => {
                                                                        if (result.isConfirmed) {
                                                                            handleRestore(entry.ID);
                                                                            Swal.fire('Restored!', 'The item has been successfully restored.', 'success');
                                                                        }
                                                                    });
                                                                }}
                                                            ><Restore className="h-5 w-5 text-gray-500" /></span>
                                               
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex items-center justify-between px-1">
                        <div></div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handlePreviousPage}
                                className="flex h-8 items-center justify-center rounded-md px-3 text-sm disabled:opacity-50"
                                disabled={currentPage === 1}
                            >
                                ‹ Prev
                            </button>
                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => handlePageClick(index + 1)}
                                    className={`flex h-8 w-8 items-center justify-center rounded-md text-sm ${index + 1 === currentPage ? "bg-yellow text-white" : "hover:bg-gray-100"}`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            <button
                                onClick={handleNextPage}
                                className="flex h-8 items-center justify-center rounded-md px-3 text-sm disabled:opacity-50"
                                disabled={currentPage === totalPages}
                            >
                                Next ›
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Items per page</span>
                            <select
                                className="h-8 rounded-md border border-gray-300 bg-white p-1 text-sm text-gray-600"
                                value={pageSize}
                                onChange={handlePageSizeChange}
                            >
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                        </div>
                    </div>

                    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
                        <ModalContent>
                            {(onClose) => (
                                <>
                                    <ModalHeader className="flex flex-col gap-1">Add Services</ModalHeader>
                                    <ModalBody>
                                        <form className="grid gap-3" >
                                            <div className="grid grid-cols-4 gap-4">
                                                <div className="input-field col-span-2">
                                                    <label htmlFor="ServiceName">
                                                        Services Name <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        id="ServiceName"
                                                        type="text"
                                                        placeholder="Services Name"
                                                        value={formData.ServiceName}

                                                        required
                                                        className="w-full border border-gray-300 rounded-md"
                                                    />
                                                </div>
                                                <div className="input-field col-span-2">
                                                    <label htmlFor="category">Status</label>
                                                    <select
                                                        className="w-full border border-gray-300 rounded-md"
                                                        id="Status"
                                                        name="Status"
                                                        value={formData.Status}

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


                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-start gap-1 mt-3">
                                                <button type="button" className="Close-btn" onClick={onClose}>
                                                    Cancel
                                                </button>
                                                {/* <button
                                            disabled={isSubmitting}
                                            className={`submit-btn ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                                            type="submit"
                                        >
                                            {isSubmitting ? "Wait..." : "Submit"}
                                        </button> */}
                                            </div>
                                        </form>
                                    </ModalBody>
                                </>
                            )}
                        </ModalContent>
                    </Modal>
                </div>
   
        </>
    );
}
