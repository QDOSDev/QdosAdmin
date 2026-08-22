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
import { useSelector } from "react-redux";
import { IRootState } from "../../store";

import Tableempty from "../Tableempty";

const colorPalette = [
    ["#9D174D", "#5B21B6", "#1D4ED8", "#0F766E", "#15803D", "#65A30D", "#C2410C", "#B91C1C", "#7C2D12", "#1F2937"],
    ["#DB2777", "#7C3AED", "#3B82F6", "#06B6D4", "#059669", "#84CC16", "#F97316", "#EF4444", "#92400E", "#4B5563"],
    ["#F472B6", "#A78BFA", "#60A5FA", "#22D3EE", "#34D399", "#A3E635", "#FB923C", "#FCA5A5", "#B45309", "#6B7280"],
    ["#FBCFE8", "#DDD6FE", "#93C5FD", "#67E8F9", "#6EE7B7", "#D9F99D", "#FED7AA", "#FEE2E2", "#D97706", "#9CA3AF"],
    ["#FCE7F3", "#EDE9FE", "#BFDBFE", "#A5F3FC", "#A7F3D0", "#ECFCCB", "#FFEDD5", "#FEE2E2", "#FDBA74", "#E5E7EB"],
];

export default function Sitelist({ filters }: { filters: { name: string; status: string } }) {
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
    const [originalFormData, setOriginalFormData] = useState(initialFormData);

    const openModal = (entry: any) => {
        const formDataToSet = {
            ID: entry.ID,
            ServiceName: entry.Service_name,
            Status: entry.Service_status || "Active",
            ServicesColor: entry.Service_color,
        };
        setFormData(formDataToSet);
        setOriginalFormData(formDataToSet);
        setSelectedColor(entry.Service_color);
        onOpenChange();
    };

    const hasFormChanged = () => {
        return JSON.stringify(formData) !== JSON.stringify(originalFormData);
    };

    const getserviceslist = async (page = 1, pageSize = 5) => {
        try {
            setLoading(true);
            let queryString = `route=Services/list/get&page=${page}&pageSize=${pageSize}`;

            if (filters.name && filters.name.trim() !== "") {
                queryString += `&filter[Service_name]=${encodeURIComponent(filters.name)}`;
            }
            if (filters.status && filters.status.trim() !== "") {
                queryString += `&filter[Service_status]=${encodeURIComponent(filters.status)}`;
            }

            const url = `${endpoint}?${queryString}`;
            const { data } = await axios.get(`${url}`, {
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
            }
        } catch (error) {
            message.error('Something went wrong while fetching inventory data.');
        }
        setLoading(false);
    };


    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const response = await axios.post(`${endpoint}?route=Services/edit`, formData, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.data.status === true) {
                message.success(response.data.Message);
                setFormData(initialFormData);
                getserviceslist(currentPage, pageSize);
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

    
            useEffect(() => {
                getserviceslist(currentPage, pageSize);
            }, [currentPage, pageSize, filters])


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

    const handleDelete = async (id: any) => {
        try {

            const { data } = await axios.post(`${endpoint}?route=delete/service/data`, { ID: id }, {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });


            if (data.status == true) {
                message.success('Site deleted successfully.');
                getserviceslist(currentPage, pageSize);

            }
        } catch (error) {
            message.error('Something went wrong while deleting the site.');
        }
    }

    return (
        <>

                <div className="table-containers">
                    <div className="rounded-lg table-wrapper">
                        <div className="border-t-8 border-[#113354]"></div>
                        <table className="data-table">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="px-4 py-3 text-left font-medium text-gray-500 sortable-header">Services name</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500 sortable-header">Services status</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500 sortable-header">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    [...Array(5)].map((_, index) => (
                                        <tr key={index} className="border-b last:border-b-0">
                                            <td className="px-4 py-3">
                                                <div className="w-12 rounded h-5 bg-gray-300 "></div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                <div className="w-24 rounded h-5 bg-gray-300 "></div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                <div className="w-16 rounded h-5 bg-gray-300 "></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : List.length === 0 ? (
                                    <Tableempty length={3} />
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
                                                
                                                            <span onClick={() => openModal(entry)} className="cursor-pointer">
                                                                <Edit className="h-5 w-5 text-gray-500" />
                                                            </span>
                                                     
                                                            <span className="cursor-pointer" onClick={() => {
                                                                Swal.fire({
                                                                    title: 'Are you sure?',
                                                                    icon: 'warning',
                                                                    showCancelButton: true,
                                                                    confirmButtonColor: getComputedStyle(document.documentElement).getPropertyValue('--yellow-color').trim(),
                                                                    cancelButtonColor: '#d33',
                                                                    confirmButtonText: 'Yes, delete it!',
                                                                    cancelButtonText: 'Cancel',
                                                                }).then((result) => {
                                                                    if (result.isConfirmed) {
                                                                        handleDelete(entry.ID);
                                                                        Swal.fire('Deleted!', 'The item has been permanently deleted.', 'success');
                                                                    }
                                                                });
                                                            }}
                                                            ><Delete className="h-5 w-5 text-gray-500" /></span>
                                                   
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="pagination-container">
                        <div className="pagination-controls">
                            <button
                                onClick={handlePreviousPage}
                                className={`pagination-button ${currentPage <= 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                                disabled={currentPage <= 1}
                            >
                                ‹ Prev
                            </button>
                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => handlePageClick(index + 1)}
                                    className={`flex h-8 w-8 items-center justify-center rounded-md text-sm 
                                    ${index + 1 === currentPage ? "bg-yellow text-white" : "hover:bg-gray-100 border border-gray-300 text-gray-600"}
                                    ${index + 1 === currentPage ? "cursor-not-allowed" : ""}`}
                                    disabled={index + 1 === currentPage}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            <button
                                onClick={handleNextPage}
                                className={`pagination-button ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
                                disabled={currentPage >= totalPages || totalPages === 0}
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
                                    <ModalHeader className="flex flex-col gap-1">Edit Service</ModalHeader>
                                    <ModalBody>
                                        <form className="grid gap-3" onSubmit={handleSubmit}>
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
                                                        onChange={(e) => setFormData({ ...formData, ServiceName: e.target.value })}
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
                                                                                                setSelectedColor(color);
                                                                                                setFormData({ ...formData, ServicesColor: color });
                                                                                                setcolorOpen(false);
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
                                                <button type="button" className="Close-btn" onClick={onClose}>
                                                    Cancel
                                                </button>
                                                <button
                                                    disabled={isSubmitting || !hasFormChanged()}
                                                    className={`submit-btn ${(isSubmitting || !hasFormChanged()) ? "opacity-50 cursor-not-allowed" : ""}`}
                                                    type="submit"
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
                </div>

        </>
    );
}
