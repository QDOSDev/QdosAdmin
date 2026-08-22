import React, { useEffect, useState } from "react";
import {
    Pagination,
    DrawerContent,
    Drawer,
    DrawerBody,
    DrawerFooter,
    Spinner,
} from "@nextui-org/react";
import { toast } from "react-toastify";
import axios from "axios";
import Cookies from "js-cookie";
import { ArchiveRestore, Eye, Trash } from "lucide-react";
import { Table, message, Pagination as AntdPagination, DatePicker } from "antd";
import Swal from "sweetalert2";
import View from '../../../../public/assets/APSIcon/View';
import Restore from '../../../../public/assets/APSIcon/Restore';
import Delete from '../../../../public/assets/APSIcon/delect';
import { useSelector } from "react-redux";
import { IRootState } from "../../../store";
import Tableempty from "../../Tableempty";
export default function TrashList() {
    const endpoint = import.meta.env.VITE_API_LIVEHOST;
    const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;
    const token = Cookies.get('token') || '';
    const [deleteList, setDeleteList] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pagesize, setpagesize] = useState<number>(10);
    const [totalItems, setTotalItems] = useState<number>(0);

  

    const getdeletedata = async (page: number, size: number) => {
        try {
            console.log(page, size);
            const { data } = await axios.get(`${endpoint}?route=admin/Get/Trash/Inventory&pagesize=${size}&currentpage=${page}`, {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            if (data.status === true) {
                setDeleteList(data.Data);

                setTotalItems(data.Pagination.totalRecords)
                setLoading(false)
            }
        } catch (error) {
            toast.error('Something went wrong while fetching deleted data.');
        }
    };

    const restoreData = async (id: number) => {
        try {
            const { data } = await axios.post(`${endpoint}?route=admin/Restore/Inventory`, { ID: id }, {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.status == true) {
                message.success('Inventory moved to trash successfully!');
                getdeletedata(currentPage, pagesize);
            } else {
                toast.error('Failed to move inventory to trash.');
            }
        } catch (error) {
            toast.error('Something went wrong while fetching deleted data.');
        }
    }

    const permanentDelete = async (id: number) => {
        try {
            const { data } = await axios.post(`${endpoint}?route=admin/permanent/Inventory`, { ID: id }, {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            if (data.status == true) {
                message.success(data.message || 'Inventory moved to trash successfully!');
                getdeletedata(currentPage, pagesize);
            } else {
                message.error(data.message || 'Failed to move inventory to trash.');
            }

        } catch (error) {
            message.error('Something went wrong while fetching deleted data.');
        }

    }



    const handleOpenDrawer = (item: any) => {
        setSelectedItem(item);
        setIsOpen(true);
    };


    const handleCloseDrawer = () => {
        setIsOpen(false);
        setSelectedItem(null);
    };


    const handlePageChange = (page: number, size?: number) => {
        setCurrentPage(page);
        if (size) {
            setpagesize(size);
        }
        getdeletedata(page, size || pagesize);
    };


    return (
        <>
            {/* Table Section */}
            
                <div className="trash-table mt-4">

                    <div className="rounded-lg border border-gray-200 bg-white">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">S.No</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Item Name</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Description</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Trashed At</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? ([...Array(5)].map((_, index) => (
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
                                            <div className="flex gap-2 ">
                                                <div className="w-5 rounded h-5 bg-gray-300 "></div>
                                                <div className="w-5 rounded h-5 bg-gray-300 "></div>
                                                <div className="w-5 rounded h-5 bg-gray-300 "></div>
                                            </div>
                                        </td>
                                    </tr>
                                )))
                                    : deleteList.length === 0 ? (
                                        <Tableempty length={5} />
                                    ) :
                                        (deleteList.map((entry, index) => (
                                            <tr key={index} className="border-b last:border-b-0 hover:shadow-md hover:font-semibold">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {index + 1}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">{entry.item_name || '---'}</td>
                                                <td className="px-4 py-3 text-gray-600">{entry.description || '---'}</td>
                                                <td className="px-4 py-3 text-gray-600">{entry.updated_at || '---'}</td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    <div className='flex gap-2'>
                                                        <span onClick={() => handleOpenDrawer(entry)} ><View className="h-5 w-5 text-gray-400" /></span>
                                                       
                                                            <span
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
                                                                            permanentDelete(entry.id);
                                                                            Swal.fire('Deleted!', 'The item has been permanently deleted.', 'success');
                                                                        }
                                                                    });
                                                                }}
                                                            ><Delete className="h-5 w-5 text-gray-500" /></span>
                                                 
                                                       
                                                            <span
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
                                                                            restoreData(entry.id);
                                                                            Swal.fire('Restored!', 'The item has been successfully restored.', 'success');
                                                                        }
                                                                    });
                                                                }}
                                                            ><Restore className="h-5 w-5 text-gray-500" /></span>
                                                      
                                                    </div>
                                                </td>
                                            </tr>
                                        )))}
                            </tbody>
                        </table>
                    </div>


                    {/* <div className="mt-4 flex items-center justify-between px-1">
                        <div></div>
                        <div className="flex items-center gap-1">
                            <button className="flex h-8 items-center justify-center rounded-md px-3 text-sm disabled:opacity-50">
                                ‹ Prev
                            </button>
                            {[1, 2, 3, 4, 5].map((page) => (
                                <button
                                    key={page}
                                    className={`flex h-8 w-8 items-center justify-center rounded-md text-sm ${page === 1 ? "bg-yellow text-white" : "hover:bg-gray-100"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button className="flex h-8 items-center justify-center rounded-md px-3 text-sm">
                                Next ›
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Items per page</span>
                            <select
                                className="h-8 rounded-md border border-gray-300 bg-white p-1 text-sm text-gray-600"

                            >
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>

                        </div>
                    </div> */}


                </div>
     

            {/* Pagination Component */}




            {/* Drawer for Editing or Adding */}
            <Drawer isOpen={isOpen} onOpenChange={() => setIsOpen(!isOpen)} size="xl" className="top-[100px]" shouldBlockScroll={true}>
                <DrawerContent>
                    {(onClose) => (
                        <>
                            <DrawerBody>
                                <div className="grid gap-4">
                                    <h3 className="Drawer-header">{selectedItem ? 'Edit Item' : 'Add Item'}</h3>

                                    <div className="space-y-2 mt-1">
                                        {/* Item Name */}
                                        <div className="input-field">
                                            <label htmlFor="itemName" className="Form-label">Item Name</label>
                                            <input
                                                id="itemName"
                                                type="text"
                                                name="Item_Name"
                                                value={selectedItem ? selectedItem.item_name : ''}
                                                readOnly
                                                className="w-full border border-gray-300 rounded-md"
                                            />
                                        </div>

                                        {/* Item Code */}
                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="input-field">
                                                <label htmlFor="itemCode">Item Code</label>
                                                <input
                                                    id="itemCode"
                                                    type="text"
                                                    name="Item_Code"
                                                    value={selectedItem ? selectedItem.item_code : ''}
                                                    readOnly
                                                    className="w-full border border-gray-300 rounded-md"
                                                />
                                            </div>
                                            <div className="input-field">
                                                <label htmlFor="category">Category</label>
                                                <input
                                                    id="category"
                                                    type="text"
                                                    name="Category"
                                                    value={selectedItem ? selectedItem.category : ''}
                                                    readOnly
                                                    className="w-full border border-gray-300 rounded-md"
                                                />
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="input-field">
                                            <label htmlFor="description">Description</label>
                                            <textarea
                                                id="description"
                                                name="Description"
                                                value={selectedItem ? selectedItem.description : ''}
                                                readOnly
                                                className="w-full mt-1 border border-gray-300 rounded-md p-4"
                                            />
                                        </div>

                                        {/* Quantity */}
                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="input-field">
                                                <label htmlFor="quantityInStock">Quantity in Stock</label>
                                                <input
                                                    id="quantityInStock"
                                                    type="number"
                                                    name="Quantity"
                                                    value={selectedItem ? selectedItem.quantity_in_stock : ''}
                                                    readOnly
                                                    className="w-full mt-1 border border-gray-300 rounded-md"
                                                />
                                            </div>
                                            <div className="input-field">
                                                <label htmlFor="costPrice">Cost Price</label>
                                                <input
                                                    id="costPrice"
                                                    type="number"
                                                    name="Price"
                                                    value={selectedItem ? selectedItem.cost_price : ''}
                                                    readOnly
                                                    className="w-full mt-1 border border-gray-300 rounded-md"
                                                />
                                            </div>
                                        </div>

                                        {/* Assignee */}
                                        <div className="input-field">
                                            <label htmlFor="assignee">Assignee</label>
                                            <input
                                                id="assignee"
                                                type="text"
                                                name="Assignee"
                                                value={selectedItem ? selectedItem.assignee : ''}
                                                readOnly
                                                className="w-full mt-1 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </DrawerBody>
                            <DrawerFooter className="flex justify-start gap-1 mt-3">
                                <button className="Close-btn" onClick={handleCloseDrawer}>Close</button>
                            </DrawerFooter>
                        </>
                    )}
                </DrawerContent>
            </Drawer>
        </>
    );
}