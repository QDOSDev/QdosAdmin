import React, { useEffect } from "react";
import axios from 'axios';
import Cookies from 'js-cookie';
import { message, Modal, Button } from 'antd';
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Restore from "../../../public/assets/APSIcon/Restore";
import View from "../../../public/assets/APSIcon/View";
import { useSelector } from "react-redux";
import { IRootState } from "../../store";
import Tableempty from "../Tableempty";
export default function Sitetrash() {
    const [List, setList] = React.useState([]);
    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = React.useState(1);
    const [totalPages, setTotalPages] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(5);
    const [totalRecords, setTotalRecords] = React.useState(0);
    const [loading, setLoading] = React.useState<boolean>(true);
    const endpoint = import.meta.env.VITE_API_LIVEHOST;
    const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;
    const token = Cookies.get('token') || '';

  
    const getsitlist = async (page = 1, pageSize = 5) => {
        try {
            const { data } = await axios.get(`${endpoint}?route=restore/site/list&page=${page}&pageSize=${pageSize}`, {
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


    const handleRestore = async (id: any) => {
        try {

            const { data } = await axios.post(`${endpoint}?route=restore/site/delete`, { ID: id }, {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });


            if (data.status == true) {
                message.success('Site deleted successfully.');
                getsitlist(currentPage, pageSize);

            }
        } catch (error) {
            message.error('Something went wrong while deleting the site.');

        }
    }

    const handleView = (site: any) => {
        navigate(`/edit/site/${site.ID}`, { state: { site, mode: "view" } });
    }


    return (
        <>
         
                <div className="w-full">
                    <div className="rounded-lg table-wrapper">
                        <div className="border-t-8 border-[#113354]"></div>
                        <table className="data-table">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Site name</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Site status</th>
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
                                    <Tableempty length={7} />
                                ) : (
                                    List.map((entry: any, index) => {
                                        const rowIndex = (currentPage - 1) * pageSize + (index + 1);

                                        return (
                                            <tr
                                                key={entry?.ID}
                                                className="border-b last:border-b-0 hover:shadow-md hover:font-semibold"
                                            >
                                                <td className="px-4 py-3 text-gray-600 flex gap-3">{entry.site_name || '---'} </td>
                                                <td className="px-4 py-3 text-gray-600">{entry.site_status || '---'}</td>
                                                <td className="px-4 py-3 text-gray-600">{entry.contact_phone || '---'}</td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    {entry.contact_email || '---'}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">{entry.address_line_1 || '---'}</td>
                                                <td className="px-4 py-3 text-gray-600">{entry.zip_postal_code || '---'}</td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    <div className="flex gap-2">
                                                        <span className="cursor-pointer" onClick={() => handleView(entry)}>
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

                </div>
        
        </>
    );
}

