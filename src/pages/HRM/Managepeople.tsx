import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Tabs,
    Tab,
    Card,
    Popover,
    PopoverTrigger,
    PopoverContent,
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Pagination,
} from '@nextui-org/react';
import { RiUserSettingsLine } from 'react-icons/ri';
import { AiOutlineUserAdd } from 'react-icons/ai';
import { CiFilter } from 'react-icons/ci';
import { RxCross2 } from 'react-icons/rx';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import axios from 'axios';
import { Switch } from "@nextui-org/react";
import CryptoJS from 'crypto-js';
import Filter from '../Filters/filter'

type Role = 'photos' | 'role';
type RoleItem = {
    name: string;
    description: string;
    id: any;
    Active: any

};

function ManagePeople() {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [role, setRole] = useState<Role>('photos');
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [roleslist, setRolesList] = useState<RoleItem[]>([]);
    const secretKey = import.meta.env.VITE_DECREYPT_KEY

    const handleTabSelect = (newRole: Role) => {
        setRole(newRole);
    };



    const endpoint = import.meta.env.VITE_API_LIVEHOST;
    const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;
    const token = Cookies.get('token')

    const [formData, setFormData] = React.useState<{
        role: string;
        description: string;
    }>({
        role: "",
        description: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const addRole = async () => {
        const body = {
            Role: formData.role,
            Description: formData.description,
        };
        try {
            setIsLoading(true);
            const { data } = await axios.post(`${endpoint}?route=admin/add/role`, body, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.status === true) {
                setIsLoading(false);
                setFormData({ role: '', description: '' });
                rolelisting(true);
            }
        } catch (error) {
            setIsLoading(false);
            toast.error('Something went wrong while adding role');
            setFormData({ role: '', description: '' });
        }
    };


    const rolelisting = async (forceReload = false) => {
        try {
            if (!forceReload) {
                const encryptedRoles = localStorage.getItem('rolesList');
                if (encryptedRoles) {

                    const bytes = CryptoJS.AES.decrypt(encryptedRoles, secretKey);
                    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                    setRolesList(decryptedData);
                    return;
                }
            }
            const { data } = await axios.get(`${endpoint}?route=admin/get/role`, {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            setRolesList(data);
            const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
            localStorage.setItem('rolesList', encryptedData);
        } catch (error) {
            toast.error('Something went wrong fetching roles!');
        }
    };


    const handleSwitchChange = (id: string, currentStatus: boolean) => {
        const newStatus = currentStatus ? '0' : '1';
        const actionMessage = currentStatus ? 'disable' : 'enable';
        const confirmation = window.confirm(`Are you sure you want to ${actionMessage} this role?`);
        if (confirmation) {
            status(id, newStatus);
        }
    };

    const status = async (id: any, newStatus: string) => {
        const body = {
            Role_status: newStatus,
            Role_ID: id,
        };

        try {
            const { data } = await axios.post(`${endpoint}?route=Role/Active/Deactive`, body, {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.status === true) {
                rolelisting(true);
            } else {
                toast.error('Failed to update role status.');
            }
        } catch (error) {
            toast.error('Something went wrong!');
        }
    };



    useEffect(() => {

        if (role === 'role') {
            rolelisting(true);
        }
    }, [role]);


    return (
        <div>
            {/* Header Section */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex-1 min-w-[250px]">
                    <h2 className="flex items-center uppercase font-extrabold mb-1">
                        Manage People
                    </h2>
                    <ul className="flex flex-wrap space-x-2 rtl:space-x-reverse text-sm">
                        <li>Dashboard</li>
                        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                            <span>HRM</span>
                        </li>
                        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                            <NavLink to="/dashboard" className="text-[#E2AD17]">
                                <span>Manage People</span>
                            </NavLink>
                        </li>
                    </ul>
                    <div className="flex flex-wrap gap-3 items-center mt-3">
                        <Button size="sm" className="rounded-full text-white bg-yellow-500">
                            Small <RxCross2 />
                        </Button>
                        <Button size="sm" className="rounded-full text-white bg-yellow-500">
                            Medium <RxCross2 />
                        </Button>
                        <Button size="sm" className="rounded-full text-white bg-yellow-500">
                            Large <RxCross2 />
                        </Button>
                        <h5 className="text-yellow-500 text-sm">Clear all filters</h5>
                    </div>
                </div>

                {/* Filters and Add User/Role Button */}
                <div className="flex flex-wrap items-center justify-end gap-3">
                
                     <Filter />
                    {role === 'photos' ? (
                        <Link to="/addgaurd">
                            <Button
                                className="text-white text-xs w-full md:w-auto"
                                style={{ backgroundColor: 'rgb(14, 23, 38)' }}
                            >
                                <AiOutlineUserAdd /> Add User
                            </Button>
                        </Link>
                    ) : (
                        <Button
                            className="text-white text-xs w-full md:w-auto"
                            style={{ backgroundColor: 'rgb(14, 23, 38)' }}
                            onPress={onOpen}
                        >
                            <AiOutlineUserAdd /> Add Role
                        </Button>
                    )}
                </div>
            </div>

            {/* Table Section */}
            <div className="inventory-table mt-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Tabs aria-label="Options" selectedKey={role} onSelectionChange={(key) => handleTabSelect(key as Role)}>
                    <Tab key="photos" title="Photos">
                        <Card>
                            <Table aria-label="Example static collection table" selectionMode="multiple">
                                <TableHeader>
                                    <TableColumn>Role</TableColumn>
                                    <TableColumn>Description</TableColumn>
                                    <TableColumn>Status</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    <TableRow key="1">
                                        <TableCell>Tony Reichert</TableCell>
                                        <TableCell>Admin</TableCell>
                                        <TableCell>Active</TableCell>
                                    </TableRow>
                                    <TableRow key="2">
                                        <TableCell>Tony Reichert</TableCell>
                                        <TableCell>Admin</TableCell>
                                        <TableCell>Active</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Card>
                    </Tab>
                    <Tab key="role" title="Role">
                        <Card>
                            <Table aria-label="Example static collection table" selectionMode="multiple">
                                <TableHeader>
                                    <TableColumn>Role</TableColumn>
                                    <TableColumn>Description</TableColumn>
                                    <TableColumn>Status</TableColumn>
                                </TableHeader>

                                <TableBody>
                                    {roleslist ? (
                                        roleslist.map((roleItem, index) => {

                                            return (
                                                <TableRow key={index}>
                                                    <TableCell>{roleItem.name}</TableCell>
                                                    <TableCell>{roleItem.description}</TableCell>
                                                    <TableCell>
                                                        <Switch
                                                            isSelected={roleItem.Active === '1'}
                                                            onChange={() => handleSwitchChange(roleItem.id, roleItem.Active === '1')}
                                                        />

                                                    </TableCell>

                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3}>No roles available</TableCell>
                                        </TableRow>
                                    )}

                                </TableBody>



                            </Table>

                        </Card>
                    </Tab>
                </Tabs>
                <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '10vh' }}>
                    <Pagination className="mt-3" showControls initialPage={1} total={10} />
                </div>
            </div>

            {/* Modal for Adding Role */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex items-center gap-2">
                                <RiUserSettingsLine size={20} />
                                <span>Add Role</span>
                            </ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    {/* Role Dropdown */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Select Role</label>
                                        <input
                                            value={formData.role}
                                            onChange={handleChange}
                                            name='role'
                                            type="text"
                                            placeholder="Enter Role"
                                            className="w-full p-2 border rounded-lg"
                                        />
                                    </div>

                                    {/* Description Text Area */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Description</label>
                                        <textarea

                                            value={formData.description}
                                            onChange={handleChange}
                                            name='description'

                                            placeholder="Enter role description..."
                                            rows={5}
                                            className="w-full p-2 border rounded-lg resize-none overflow-y-auto"
                                            style={{ maxHeight: '150px' }} // Ensure scrollability
                                        ></textarea>
                                    </div>
                                </div>
                            </ModalBody>

                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                                <Button className='yellow-color' onPress={addRole}>
                                    {isLoading ? "Adding Role..." : "Add Role"}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}

export default ManagePeople;
