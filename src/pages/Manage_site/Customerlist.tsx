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

export default function App() {
    const [List, setList] = React.useState([]);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedEntry, setSelectedEntry] = React.useState<any>(null);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [loading, setLoading] = React.useState<boolean>(true);
    const endpoint = import.meta.env.VITE_API_LIVEHOST;
    const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;
    const token = Cookies.get('token') || '';
    const initialFormData = {
        ID: "",
        Customer: "",
        Status: "Active",
        Phone: "",
        Email: "",
        Address1: "",
        Address2: "",
        City: "",
        Country: "",
        PostalCode: "",
        StateProvince: "",
    };
    const [formData, setFormData] = useState<any>(initialFormData);
    const [originalFormData, setOriginalFormData] = useState<any>(initialFormData);
    const [isFormChanged, setIsFormChanged] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalRecords, setTotalRecords] = useState(0);
    const { isToggled } = useSelector((state: any) => state.customerConfig);



    const handleChange = (e: any) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    useEffect(() => {
        const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalFormData);
        setIsFormChanged(hasChanges);
    }, [formData, originalFormData]);

    const openModal = (entry: any, viewMode = false) => {
        setIsViewMode(viewMode);
        const newFormData = {
            ID: entry.id,
            Customer: entry.customer_name,
            Status: entry.status || "Active",
            Phone: entry.phone,
            Email: entry.email,
            Address1: entry.address_1,
            Address2: entry.address_2,
            City: entry.city,
            Country: entry.country,
            PostalCode: entry.postal_code,
            StateProvince: entry.state_province,
        };
        setFormData(newFormData);
        setOriginalFormData(newFormData);
        setIsFormChanged(false);
        onOpenChange();
    };

    const getCustomerlist = async (page = 1, pageSize = 5) => {
        try {
            const { data } = await axios.get(`${endpoint}?route=admin/Get/Customer&page=${page}&pageSize=${pageSize}`, {
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

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const response = await axios.post(`${endpoint}?route=admin/Edit/Customer`, formData, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.data.status === true) {
                message.success(response.data.Message);
                setFormData(initialFormData);
                getCustomerlist()
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


    const handleView = (entry: any) => {
        openModal(entry, true);
    };

    const handleDelete = async (id: any) => {
        try {

            const { data } = await axios.post(`${endpoint}?route=delete/customer/data`, { ID: id }, {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });


            if (data.status == true) {
                message.success('Site deleted successfully.');
                getCustomerlist(currentPage, pageSize);

            }
        } catch (error) {
            message.error('Something went wrong while deleting the site.');

        }
    }





    return (
        <>
                <div className="w-full">
                    <div className="rounded-lg table-wrapper">
                        <div className="border-t-8 border-[#113354]"></div>
                        <table className="data-table">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Customer name</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Mobile number</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Address</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Postal code</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Action</th>
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
                                            <td className="px-4 py-3 text-gray-600">
                                                <div className="w-12 rounded h-5 bg-gray-300 "></div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                <div className="w-12 rounded h-5 bg-gray-300 "></div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                <div className="flex gap-2">
                                                    <div className="w-5 rounded h-5 bg-gray-300 "></div>
                                                    <div className="w-5 rounded h-5 bg-gray-300 "></div>
                                                    <div className="w-5 rounded h-5 bg-gray-300 "></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : List.length === 0 ? (
                                    <Tableempty length={6} />
                                ) : (
                                    List.map((entry: any, index) => {
                                        const rowIndex = (currentPage - 1) * pageSize + (index + 1);

                                        return (
                                            <tr
                                                key={entry?.ID}
                                                className="border-b last:border-b-0 hover:shadow-md hover:font-semibold"
                                            >
                                                <td className="px-4 py-3 text-gray-600">{entry.customer_name || '---'} </td>
                                                <td className="px-4 py-3 text-gray-600">{entry.phone || '---'}</td>
                                                <td className="px-4 py-3 text-gray-600">{entry.email || '---'}</td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    <div className="grid grid-cols-1 gap-2">
                                                        <p>Address 1 : {entry.address_1 || ' '}</p>
                                                        <p>Address 2 : {entry.address_2 || ''}</p>
                                                    </div>

                                                </td>
                                                <td className="px-4 py-3 text-gray-600">{entry.postal_code || '---'}</td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    <div className="flex gap-2">
                                                        <span className="cursor-pointer" onClick={() => handleView(entry)}>
                                                            <View className="h-5 w-5 text-gray-500"  />
                                                        </span>
                                                        <span>
                                                           
                                                                <span onClick={() => openModal(entry)} className="cursor-pointer">
                                                                    <Edit className="h-5 w-5 text-gray-500" />
                                                                </span>
                                                        
                                                        </span>
                                           
                                                            <span className="cursor-pointer"
                                                                onClick={() => {
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
                                                                            handleDelete(entry.id);
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
                                    <ModalHeader className="flex flex-col gap-1">
                                        {isViewMode ? "View Customer Details" : "Edit Customer"}
                                    </ModalHeader>
                                    <ModalBody>
                                        <form className="grid gap-3" onSubmit={handleSubmit}>
                                            <div className="grid  grid-cols-2 gap-5">
                                                <div className="input-field">
                                                    <label htmlFor="Customer" className="">
                                                        Customer <span className="text-red-500"></span>
                                                    </label>
                                                    <input
                                                        id="Customer"
                                                        type="text"
                                                        placeholder="Customer"
                                                        value={formData.Customer}
                                                        onChange={(e) => setFormData({ ...formData, Customer: e.target.value })}
                                                        required
                                                        className="w-full border border-gray-300 rounded-md"
                                                        readOnly={isViewMode}
                                                    />
                                                </div>
                                                <div className="input-field">
                                                    <label htmlFor="category" className="">
                                                        Category
                                                    </label>
                                                    <select
                                                        className='w-full border border-gray-300 rounded-md'
                                                        id="Status"
                                                        name="Status"
                                                        value={formData.Status}
                                                        onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
                                                        disabled={isViewMode}
                                                    >
                                                        <option key="Active" value="Active">
                                                            Active
                                                        </option>
                                                        <option key="Inactive" value="Inactive">
                                                            Inactive
                                                        </option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid  grid-cols-2 gap-3">
                                                <div className="input-field">
                                                    <label htmlFor="Phone" className="">
                                                        Phone
                                                    </label>
                                                    <input
                                                        id="Phone"
                                                        type="text"
                                                        placeholder="Phone"
                                                        value={formData.Phone}
                                                        onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
                                                        className="w-full border border-gray-300 rounded-md" // Increased padding and font size
                                                        readOnly={isViewMode}
                                                    />
                                                </div>
                                                <div className="input-field">
                                                    <label htmlFor="itemCode" className="">
                                                        Email
                                                    </label>
                                                    <input
                                                        id="Email"
                                                        type="text"
                                                        placeholder="Email"
                                                        value={formData.Email}
                                                        onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                                                        className="w-full border border-gray-300 rounded-md" // Increased padding and font size
                                                        readOnly={isViewMode}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid  grid-cols-2 gap-5">
                                                <div className="input-field">
                                                    <label htmlFor="itemCode" className="">
                                                        Address 1
                                                    </label>
                                                    <input
                                                        id="Address1"
                                                        type="text"
                                                        placeholder="Address 1"
                                                        value={formData.Address1}
                                                        onChange={handleChange}
                                                        className="w-full border border-gray-300 rounded-md" // Increased padding and font size
                                                        readOnly={isViewMode}
                                                    />
                                                </div>
                                                <div className="input-field">
                                                    <label htmlFor="category" className="">
                                                        Address 2
                                                    </label>
                                                    <input
                                                        id="Address2"
                                                        type="text"
                                                        placeholder="Address 2"
                                                        value={formData.Address2}
                                                        onChange={handleChange}
                                                        className="w-full border border-gray-300 rounded-md" // Increased padding and font size
                                                        readOnly={isViewMode}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid  grid-cols-2 gap-5">
                                                <div className="input-field">
                                                    <label htmlFor="itemCode" className="">
                                                        City
                                                    </label>
                                                    <input
                                                        id="City"
                                                        type="text"
                                                        placeholder="City Name"
                                                        value={formData.City}
                                                        onChange={(e) => setFormData({ ...formData, City: e.target.value })}
                                                        className="w-full border border-gray-300 rounded-md" // Increased padding and font size
                                                        readOnly={isViewMode}
                                                    />
                                                </div>
                                                <div className="input-field">
                                                    <label htmlFor="category" className="">
                                                        State/Province
                                                    </label>
                                                    <input
                                                        id="State/Province"
                                                        type="text"
                                                        placeholder="State/Province"
                                                        value={formData.StateProvince}
                                                        onChange={(e) => setFormData({ ...formData, StateProvince: e.target.value })}
                                                        className="w-full border border-gray-300 rounded-md" // Increased padding and font size
                                                        readOnly={isViewMode}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid  grid-cols-2 gap-5">
                                                <div className="input-field">
                                                    <label htmlFor="itemCode" className="">
                                                        Postal code
                                                    </label>
                                                    <input
                                                        id="Postal code"
                                                        type="text"
                                                        placeholder="Postal code"
                                                        value={formData.PostalCode}
                                                        onChange={(e) => setFormData({ ...formData, PostalCode: e.target.value })}
                                                        className="w-full border border-gray-300 rounded-md" // Increased padding and font size
                                                        readOnly={isViewMode}
                                                    />
                                                </div>
                                                <div className="input-field">
                                                    <label htmlFor="category" className="">
                                                        Country
                                                    </label>
                                                    <input
                                                        id="Country"
                                                        type="text"
                                                        placeholder="Country"
                                                        value={formData.Country}
                                                        onChange={(e) => setFormData({ ...formData, Country: e.target.value })}
                                                        className="w-full border border-gray-300 rounded-md" // Increased padding and font size
                                                        readOnly={isViewMode}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-start gap-1 mt-3">
                                                <button
                                                    type='button'
                                                    className="Close-btn"
                                                    onClick={onClose}
                                                >
                                                    {isViewMode ? "Close" : "Cancel"}
                                                </button>
                                                {!isViewMode && (
                                                    <button
                                                        disabled={isSubmitting || !isFormChanged}
                                                        className={`submit-btn ${(isSubmitting || !isFormChanged) ? "opacity-50 cursor-not-allowed" : ""}`}
                                                        type='submit'
                                                    >
                                                        {isSubmitting ? "Wait..." : "Update"}
                                                    </button>
                                                )}
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

