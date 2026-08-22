import React, { useEffect, useState } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
    Card,
    Pagination,
    Spinner,
} from "@nextui-org/react";
import { Table, Switch, Spin, message } from "antd";
import { RiUserSettingsLine } from "react-icons/ri";
import Cookies from "js-cookie";
import axios from "axios";
import { toast } from "react-toastify";
import CryptoJS from "crypto-js";
import Swal from "sweetalert2";

type RoleItem = {
    id: string;
    name: string;
    description: string;
    Active: string;
};

type RolelistProps = {
    role: string;
    isOpen: boolean;
    onOpen: () => void;
    onOpenChange: () => void;
};

export default function Rolelist({ role, isOpen, onOpen, onOpenChange }: RolelistProps) {
    const [roleslist, setRolesList] = useState<RoleItem[]>([]);
    const [formData, setFormData] = useState({ role: "", description: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    const endpoint = import.meta.env.VITE_API_LIVEHOST;
    const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;
    const token = Cookies.get("token") || "";
    const secretKey = import.meta.env.VITE_DECREYPT_KEY;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const addRole = async () => {
        if (!formData.role.trim()) {
            message.error("Role is required!");
            return;
        }

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
                setFormData({ role: "", description: "" });
                rolelisting(true);
                message.success("Role added successfully!");
            } else {
                message.error("Failed to add role.");
            }
        } catch (error) {
            setIsLoading(false);
            message.error("Something went wrong while adding the role.");
        }
    };

    const rolelisting = async (forceReload = false) => {
        try {
            if (!forceReload) {
                const encryptedRoles = localStorage.getItem("rolesList");
            
                if (encryptedRoles) {
                    const bytes = CryptoJS.AES.decrypt(encryptedRoles, secretKey);
                    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                    setRolesList(decryptedData);
                
                    setLoading(false);
                    return;
                }   
            }

            const { data } = await axios.get(`${endpoint}?route=admin/get/role`, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            setRolesList(data);
            console.log(data)
            
            const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
            localStorage.setItem("rolesList", encryptedData);
            setLoading(false);
        } catch (error) {
            toast.error("Something went wrong while fetching roles!");
            setLoading(false);
        }
    };

    const handleSwitchChange = async (id: string, currentStatus: boolean) => {
        const newStatus = currentStatus ? "0" : "1";
        const actionMessage = currentStatus ? "disable" : "enable";

        Swal.fire({
            title: `Are you sure?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: getComputedStyle(document.documentElement).getPropertyValue('--yellow-color').trim(),
            cancelButtonColor: "#d33",
            confirmButtonText: `Yes, ${actionMessage} it!`,
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const body = {
                        Role_status: newStatus,
                        Role_ID: id,
                    };

                    const { data } = await axios.post(`${endpoint}?route=Role/Active/Deactive`, body, {
                        headers: {
                            "x-api-key": apiKey,
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (data.status === true) {
                        message.success(`Role ${actionMessage}d successfully!`);
                        rolelisting(true);
                    } else {
                        message.error("Failed to update role status.");
                    }
                } catch (error) {
                    message.error("Something went wrong!");
                }
            }
        });
    };

    useEffect(() => {
        if (role === "roles") {
            rolelisting();
        }
    }, [role]);



    return (
        <>
            <div className="Role-table mt-4 ">
                <div className="rounded-lg border border-gray-200 bg-white">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="px-4 py-3 text-left font-medium text-gray-500">S.No</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500">Description</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(Array.isArray(roleslist) ? roleslist : []).map((entry, index) => (
                                <tr key={index} className="border-b last:border-b-0">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {index + 1}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{entry.name}</td>
                                    <td className="px-4 py-3 text-gray-600">{entry.description}</td>
                                    <td className="px-4 py-3 text-gray-600">
                                        <Switch
                                            checked={entry.Active === "1"}
                                            onChange={() => handleSwitchChange(entry.id, entry.Active === "1")}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>

                <div className="mt-4 flex items-center justify-between px-1">
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
                </div>
            </div>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="bg-[url('./assets/Icon/Vector.svg')] bg-center bg-no-repeat">
                <ModalContent>
                    <ModalHeader className="border-none">
                        <span className="flex gap-2">Add Role <img src="./assets/Icon/Add_rolebule.svg" alt="AddRole" /></span>
                    </ModalHeader>
                    <ModalBody>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Role<span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={formData.role}
                                    onChange={handleChange}
                                    name="role"
                                    type="text"
                                    placeholder="Enter Role"
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={handleChange}
                                    name="description"
                                    placeholder="Enter role description..."
                                    rows={5}
                                    className="w-full p-2 border rounded-lg resize-none"
                                    style={{ maxHeight: "150px" }}
                                ></textarea>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter className="justify-start">
                        <button className="Close-btn" onClick={onOpenChange}>
                            Cancel
                        </button>
                        <Button
                            className="yellow-color"
                            onPress={addRole}
                            disabled={!formData.role.trim()} // Disable button if "Role" is empty
                        >
                            {isLoading ? "Adding Role..." : "Add Role"}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
