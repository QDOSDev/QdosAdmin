import { useEffect, useState } from 'react';
import { Pagination } from '@nextui-org/react';
import { Drawer, DrawerContent, DrawerBody, DrawerFooter, Button, useDisclosure, Spinner } from '@nextui-org/react';
import { RxCross2 } from 'react-icons/rx';
import Filter from './filter';
import { Eye, Trash, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import Cookies from 'js-cookie';
import Trash1 from './Trash';
import View from '../../../../public/assets/APSIcon/View';
import Edit from '../../../../public/assets/APSIcon/Edit';
import Delete from '../../../../public/assets/APSIcon/delect';
import { Table, message } from 'antd';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../store';
import Tableempty from '../../Tableempty';
interface FormData {
    Item_Name: string;
    Item_Code: string;
    Category: string;
    Description: string;
    Quantity: number;
    Price: number;
    Assignee: string;
}

const tabs = [
    {
        id: 'inventory',
        label: 'Inventory',
    },
    {
        id: 'trash',
        label: 'Trash',
    },
];
                                                   
export default function Inventory() {
    const [Userlist, getuserlist] = useState([]);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [loading, setLoading] = useState<boolean>(true);
    const [viewMode, setViewMode] = useState<boolean>(false);
    const [originalFormData, setOriginalFormData] = useState<FormData | null>(null);

    const [activeTab, setActiveTab] = useState('inventory');

    const endpoint = import.meta.env.VITE_API_LIVEHOST;
    const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;
    const token = Cookies.get('token') || '';

    const [formData, setFormData] = useState<FormData>({
        Item_Name: '',
        Item_Code: '',
        Category: '',
        Description: '',
        Quantity: 0,
        Price: 0.0,
        Assignee: '',
    });

    const [list, setList] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [PageSize, setPageSize] = useState(10);
    const [editId, setEditId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };
    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(1);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const isFormDataChanged = () => {
        if (!editId || !originalFormData) return true;
        return Object.keys(formData).some((key) => formData[key as keyof FormData] !== originalFormData[key as keyof FormData]);
    };

    const isFormValid = () => {
        const trimmedItemName = formData.Item_Name.trim();
        const trimmedItemCode = formData.Item_Code.trim();

        // Don't allow just dots or spaces
        const isValidName = trimmedItemName !== '' && !/^[.\s]+$/.test(formData.Item_Name);
        const isValidCode = trimmedItemCode !== '' && !/^[.\s]+$/.test(formData.Item_Code);

        if (!editId) {
            return isValidName && isValidCode;
        } else {
            const hasChanges = isFormDataChanged();
            const isValid = (!formData.Item_Name || isValidName) && (!formData.Item_Code || isValidCode);
            return hasChanges && isValid;
        }
    };

    const addData = async () => {
        setIsLoading(true);
        const body = { ...formData };
        try {
            const { data } = await axios.post(`${endpoint}?route=admin/add/Inventory`, body, {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.status) {
                setFormData({
                    Item_Name: '',
                    Item_Code: '',
                    Category: '',
                    Description: '',
                    Quantity: 1,
                    Price: 0.0,
                    Assignee: '',
                });
                message.success(data.message);
                getInventory();
            } else {
                message.error('Failed to add inventory.');
            }
        } catch (error) {
            toast.error('Something went wrong while adding the inventory.');
        }
        setIsLoading(false);
    };

    const getuser = async () => {
        try {
            const { data } = await axios.get(`${endpoint}?route=APS/All/Employer/Options`, {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.status) {
                getuserlist(data.Data);
            }
        } catch (error) {
            toast.error('Something went wrong while fetching inventory data.');
        }
    };

    const getInventory = async () => {
        try {
            const { data } = await axios.get(`${endpoint}?route=admin/Get/Inventory&page=${currentPage}&pageSize=${PageSize}`, {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.status) {
                setList(data.data.data);
                setLoading(false);
                setCurrentPage(data.data.currentPage);
                setTotalPages(data.data.total_pages);
            }
        } catch (error) {
            toast.error('Something went wrong while fetching inventory data.');
        }
    };

    const editData = async () => {
        if (editId === null) return;
        setIsLoading(true);

        const body = { ...formData, ID: editId };

        try {
            const { data } = await axios.post(`${endpoint}?route=admin/Edit/Inventory`, body, {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.status) {
                message.success('Inventory updated successfully!');
                setEditId(null);
                onOpenChange();
                getInventory();
            } else {
                message.error('Failed to update inventory.');
            }
        } catch (error) {
            toast.error('Something went wrong while updating the inventory.');
        }
        setIsLoading(false);
    };

    const deleteData = async (id: number) => {
        try {
            const { data } = await axios.post(
                `${endpoint}?route=admin/Trash/Inventory`,
                { ID: id },
                {
                    headers: {
                        'x-api-key': apiKey,
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (data.status == true) {
                message.success('Inventory moved to trash successfully.');
                getInventory();
            } else {
                toast.error('Failed to move inventory to trash.');
            }
        } catch (error) {
            toast.error('Something went wrong while trashing the inventory.');
        }
    };

    const openEditDrawer = (item: any) => {
        setViewMode(false);
        const newFormData = {
            Item_Name: item.item_name,
            Item_Code: item.item_code,
            Category: item.category,
            Description: item.description,
            Quantity: item.quantity,
            Price: item.cost,
            Assignee: item.assignee,
        };
        setFormData(newFormData);
        setOriginalFormData(newFormData);
        setEditId(item.id);
        onOpen();
    };

    const openEditDrawer1 = (item: any) => {
        setViewMode(true);
        setFormData({
            Item_Name: item.item_name,
            Item_Code: item.item_code,
            Category: item.category,
            Description: item.description,
            Quantity: item.quantity,
            Price: item.cost,
            Assignee: item.assignee,
        });

        onOpen();
    };

    const resetFormData = () => {
        setFormData({
            Item_Name: '',
            Item_Code: '',
            Category: '',
            Description: '',
            Quantity: 0,
            Price: 0.0,
            Assignee: '',
        });
        setEditId(null);
    };

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        if (tabId !== 'inventory') {
            resetFormData();
        }
    };
    {
        useEffect(() => {
            if (activeTab === 'inventory') {
                setLoading(true);
                getInventory()
                    .then(() => {
                        setLoading(false);
                    })
                    .catch(() => {
                        setLoading(false);
                    });
            }
        }, [activeTab, currentPage, PageSize]);

        useEffect(() => {
            if (activeTab === 'inventory') {
                getuser();
            }
        }, [activeTab]);
    }

    const openDrawerForAddingInventory = () => {
        const emptyForm = {
            Item_Name: '',
            Item_Code: '',
            Category: '',
            Description: '',
            Quantity: 1,
            Price: 0.0,
            Assignee: '',
        };
        setFormData(emptyForm);
        setOriginalFormData(null);
        setEditId(null);
        onOpen();
    };

    return (
        <>
            <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>

                    <div className="flex flex-wrap items-center justify-end gap-3">
                        {/* <Filter /> */}

                        <Button className="Insert-Button" onClick={openDrawerForAddingInventory}>
                            <Plus /> Inventory
                        </Button>
                    </div>
                </div>
                <>
                    <div className="Managepeople-Div  grid gap-3">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`whitespace-nowrap border-b-2 py-2 px-1 text-md font-medium transition-colors ${
                                            activeTab === tab.id ? 'border-[#F5A524] text-[#F5A524]' : 'border-transparent text-black-500 hover:border-black-500 hover:text-black-700'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="inventory-table mt-4 ">
                            <div className="table-wrapper">
                                <div className="border-t-8 border-[#113354]"></div>
                                <table className="table-data">
                                    <thead>
                                        <tr className="border-b bg-gray-50">
                                            <th className="px-4 py-3 text-left font-medium text-gray-500">S.No</th>
                                            <th className="px-4 py-3 text-left font-medium text-gray-500">Item Name</th>
                                            <th className="px-4 py-3 text-left font-medium text-gray-500">Item Code</th>
                                            <th className="px-4 py-3 text-left font-medium text-gray-500">Price</th>
                                            <th className="px-4 py-3 text-left font-medium text-gray-500">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Skeleton Loader */}
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
                                                        <div className="flex gap-2 ">
                                                            <div className="w-5 rounded h-5 bg-gray-300 "></div>
                                                            <div className="w-5 rounded h-5 bg-gray-300 "></div>
                                                            <div className="w-5 rounded h-5 bg-gray-300 "></div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : list.length === 0 ? (
                                            <Tableempty length={5} />
                                        ) : (
                                            list.map((entry: any, index: number) => (
                                                <tr key={index} className="border-b last:border-b-0 hover:shadow-md hover:font-semibold">
                                                    <td className="px-4 py-3">{index + 1}</td>
                                                    <td className="px-4 py-3 text-gray-600">{entry.item_name || '---'}</td>
                                                    <td className="px-4 py-3 text-gray-600">{entry.item_code || '---'}</td>
                                                    <td className="px-4 py-3 text-gray-600">{entry.cost || '---'}</td>
                                                    <td className="px-4 py-3 text-gray-600">
                                                        <div className="flex gap-2">
                                                            <span onClick={() => openEditDrawer1(entry)} className="cursor-pointer">
                                                                <View className="h-5 w-5 text-gray-400" />
                                                            </span>

                                                            <span onClick={() => openEditDrawer(entry)} className="cursor-pointer">
                                                                <Edit className="h-5 w-5 text-gray-500" />
                                                            </span>

                                                            <span
                                                                className="cursor-pointer"
                                                                onClick={() => {
                                                                    if (entry.id) {
                                                                        Swal.fire({
                                                                            title: 'Are you sure?',
                                                                            icon: 'warning',
                                                                            showCancelButton: true,
                                                                            confirmButtonColor: getComputedStyle(document.documentElement).getPropertyValue('--yellow-color').trim(),
                                                                            cancelButtonColor: '#d33',
                                                                            confirmButtonText: 'Yes, delete it!',
                                                                        }).then((result) => {
                                                                            if (result.isConfirmed) {
                                                                                deleteData(entry.id);
                                                                                Swal.fire('Deleted!', 'Your item has been deleted.', 'success');
                                                                            }
                                                                        });
                                                                    }
                                                                }}
                                                            >
                                                                <Delete className="h-5 w-5 text-red-500" />
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="pagination-container">
                                <div className="pagination-controls flex items-center gap-2">
                                    <button
                                        className="pagination-button px-3 py-1 rounded-md border text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1} // Disable when on first page
                                    >
                                        ‹ Prev
                                    </button>

                                    {/* Page Numbers */}
                                    {[...Array(totalPages)].map((_, pageIndex) => {
                                        const page = pageIndex + 1;
                                        return (
                                            <button
                                                key={page}
                                                className={`h-8 w-8 flex items-center justify-center rounded-md text-sm 
                                ${page === currentPage ? 'bg-yellow-500 text-white' : 'hover:bg-gray-100'}
                            `}
                                                onClick={() => handlePageChange(page)}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}

                                    <button
                                        className="pagination-button px-3 py-1 rounded-md border text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages} // Disable when on last page
                                    >
                                        Next ›
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Items per page</span>
                                    <select className="h-8 rounded-md border border-gray-300 bg-white p-1 text-sm text-gray-600" onChange={handlePageSizeChange}>
                                        <option value="10">10</option>
                                        <option value="20">20</option>
                                        <option value="50">50</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="trash">
                            <Trash1 />
                        </div>
                    </div>

                    <Drawer isOpen={isOpen} onOpenChange={onOpenChange} size="xl" className="h-screen" shouldBlockScroll={true}>
                        <DrawerContent>
                            {(onClose) => (
                                <>
                                    <DrawerBody>
                                        <div className="grid gap-4">
                                            <h3 className="Drawer-header">{viewMode ? 'View Inventory' : editId ? 'Edit Inventory' : 'Add Inventory'}</h3>
                                            <div className="space-y-2 mt-1">
                                                <div className="input-field">
                                                    <label htmlFor="itemName" className="Form-label">
                                                        Item Name<span className="text-red-500">{editId ? '' : '*'}</span>
                                                    </label>
                                                    <input
                                                        id="itemName"
                                                        type="text"
                                                        name="Item_Name"
                                                        disabled={viewMode}
                                                        value={formData.Item_Name}
                                                        onChange={handleChange}
                                                        placeholder="Item Name"
                                                        required={!editId}
                                                        className="w-full border border-gray-300 rounded-md"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-5">
                                                    <div className="input-field">
                                                        <label htmlFor="itemCode">
                                                            Item Code<span className="text-red-500">{editId ? '' : '*'}</span>
                                                        </label>
                                                        <input
                                                            id="itemCode"
                                                            type="text"
                                                            name="Item_Code"
                                                            value={formData.Item_Code}
                                                            disabled={viewMode}
                                                            onChange={handleChange}
                                                            placeholder="Item Code"
                                                            required
                                                            className="w-full border border-gray-300 rounded-md"
                                                        />
                                                    </div>
                                                    <div className="input-field">
                                                        <label htmlFor="category">Category</label>
                                                        <input
                                                            id="category"
                                                            type="text"
                                                            name="Category"
                                                            value={formData.Category}
                                                            disabled={viewMode}
                                                            onChange={handleChange}
                                                            placeholder="Category"
                                                            className="w-full border border-gray-300 rounded-md"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="input-field">
                                                    <label htmlFor="description">Description</label>
                                                    <textarea
                                                        id="description"
                                                        name="Description"
                                                        value={formData.Description}
                                                        onChange={handleChange}
                                                        disabled={viewMode}
                                                        placeholder="Description"
                                                        rows={6}
                                                        className="w-full mt-1 border border-gray-300 rounded-md p-4"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-5">
                                                    <div className="input-field">
                                                        <label htmlFor="quantityInStock">Quantity in Stock</label>
                                                        <input
                                                            id="quantityInStock"
                                                            type="number"
                                                            name="Quantity"
                                                            value={formData.Quantity}
                                                            disabled={viewMode}
                                                            onChange={handleChange}
                                                            placeholder="Quantity"
                                                            required
                                                            className="w-full mt-1 border border-gray-300 rounded-md"
                                                        />
                                                    </div>
                                                    <div className="input-field">
                                                        <label htmlFor="costPrice">Cost Price</label>
                                                        <input
                                                            id="costPrice"
                                                            type="number"
                                                            name="Price"
                                                            value={formData.Price}
                                                            disabled={viewMode}
                                                            onChange={handleChange}
                                                            placeholder="Cost Price"
                                                            className="w-full mt-1 border border-gray-300 rounded-md"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="input-field">
                                                    <label htmlFor="assignee">Assignee</label>

                                                    <select
                                                        id="assignee"
                                                        name="Assignee"
                                                        value={formData.Assignee}
                                                        disabled={viewMode}
                                                        onChange={handleChange}
                                                        className="w-full border border-gray-300 rounded-md"
                                                    >
                                                        <option value="">Select Assignee</option>
                                                        {Userlist.map((user: any) => (
                                                            <option key={user.ID} value={user.ID}>
                                                                {user.first_name} {user.last_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {/* <input
                                                        id="assignee"
                                                        type="text"
                                                        name="Assignee"
                                                        value={formData.Assignee}
                                                        disabled={viewMode}
                                                        onChange={handleChange}
                                                        placeholder="Assignee"
                                                        className="w-full mt-1 border border-gray-300 rounded-md"
                                                    /> */}
                                                </div>
                                            </div>
                                        </div>
                                    </DrawerBody>

                                    <DrawerFooter className="flex justify-start gap-1 mt-3">
                                        <button className="Close-btn" onClick={onClose}>
                                            Close
                                        </button>
                                        {!viewMode && (
                                            <button
                                                className="submit-btn"
                                                onClick={async () => {
                                                    setIsLoading(true);
                                                    if (editId) {
                                                        await editData();
                                                    } else {
                                                        await addData();
                                                    }
                                                    setIsLoading(false);
                                                }}
                                                disabled={isLoading || !isFormValid()}
                                            >
                                                {isLoading ? 'Processing...' : editId ? 'Update' : 'Submit'}
                                            </button>
                                        )}
                                    </DrawerFooter>
                                </>
                            )}
                        </DrawerContent>
                    </Drawer>
                </>
            </div>
        </>
    );
}
