import { useState, useEffect } from "react"
import { ArrowLeft, Check, ChevronDown, ChevronRight } from "lucide-react"
import "./role-editor.css"
import Cookies from "js-cookie";
import axios from "axios";
import { message } from "antd";
import { Spinner } from "@nextui-org/react";
import { useParams } from "react-router-dom";
type Permission = {
    id: string
    name: string
    description?: string
    subpageId?: string
}

type ModulePermissions = {
    id: string
    name: string
    description?: string
    permissions: Permission[]
    presets?: {
        id: string
        name: string
        permissions: string[]
    }[]
}

type Role = {
    id: string
    name: string
    permissions: Record<string, string[]>
}

export default function RoleEditor() {
    const { role_id } = useParams<{ role_id: string }>();
    const endpoint = import.meta.env.VITE_API_LIVEHOST;
    const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;
    const token = Cookies.get("token") || "";
    const secretKey = import.meta.env.VITE_DECREYPT_KEY;
    const [modules, setmodulelist] = useState<ModulePermissions[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    const [openModule, setOpenModule] = useState<string | null>(null);
    const [vailderole, setvailderole] = useState<Role>();
    const [role, setRole] = useState<Role>({
        id: "1",
        name: "Full access",
        permissions: {
            dashboard: [],
            scheduleShift: [],
            timeProcessing: [],
            company: [],
            reports: [],
            manageSite: [],
            manageServices: [],
            guardShifts: [],
        },
    })
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    })

    const rolelisting = async (forceReload = false) => {
        try {
            const { data } = await axios.get(`${endpoint}?route=Permission/Role/details&roleid=${role_id}`, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (data.status === true) {
                setRole(data.data)
                setvailderole(data.data);
            }
            setLoading(false);
        } catch (error) {
            message.error("Something went wrong while fetching roles!");
            setLoading(false);
        }
    };

    const moduleslisting = async (forceReload = false) => {
        try {
            const { data } = await axios.get(`${endpoint}?route=Permission/Module/details`, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (data.status === true) {
                setmodulelist(data.data)
            }
            // setmodulelist(data);
            setLoading(false);
        } catch (error) {
            message.error("Something went wrong while fetching roles!");
            setLoading(false);
        }
    };

    useEffect(() => {
        moduleslisting(false);
        rolelisting(false);
    }, []);

    const toggleModule = (moduleId: string) => {
        setExpandedModules((prev) => ({
            ...prev,
            [moduleId]: !prev[moduleId],
        }))
    }

    const togglePermission = (moduleId: string, permissionId: string) => {
        setRole((prev) => {
            const modulePermissions = [...(prev.permissions[moduleId] || [])]
            const permissionIndex = modulePermissions.indexOf(permissionId)

            if (permissionIndex === -1) {
                modulePermissions.push(permissionId)
            } else {
                modulePermissions.splice(permissionIndex, 1)
            }

            return {
                ...prev,
                permissions: {
                    ...prev.permissions,
                    [moduleId]: modulePermissions,
                },
            }
        })
    }

    const applyPreset = (moduleId: string, presetId: string) => {
        const module = modules.find((m) => m.id === moduleId)
        if (!module) return

        const preset = module.presets?.find((p) => p.id === presetId)
        if (!preset) return

        setRole((prev) => {
            return {
                ...prev,
                permissions: {
                    ...prev.permissions,
                    [moduleId]: [...preset.permissions],
                },
            }
        })
    }

    const hasPermission = (moduleId: string, permissionId: string) => {
        return role.permissions[moduleId]?.includes(permissionId) || false
    }

    const matchesPreset = (moduleId: string, presetId: string) => {
        const module = modules.find((m) => m.id === moduleId)
        if (!module) return false

        const preset = module.presets?.find((p) => p.id === presetId)
        if (!preset) return false

        const currentPermissions = role.permissions[moduleId] || []

        return (
            preset.permissions.length === currentPermissions.length &&
            preset.permissions.every((p) => currentPermissions.includes(p))
        )
    }

    const [Btnload, setbtnload] = useState(false);

    const updateRolePermissions = async () => {

        if (role.permissions === vailderole?.permissions) {
            message.error("No changes made to permissions!");
            return;
        }
        setbtnload(true);
        try {
            const response = await axios.post(`${endpoint}?route=Permission/Role/update`, {
                role_id: role.id,
                permissions: role.permissions,
            }, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.status) {
                message.success("Permissions updated successfully!");
            } else {
                message.error("Failed to update permissions.");
            }

        } catch (error) {
            message.error("Something went wrong while updating permissions!");
        }
        setbtnload(false);
    };

    return (
        <div className=" bg-gray-50">
            <div className=" mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                 
                    <div className="border-t-8 border-[#113354]"></div>

                    <div className="p-6">
                        <div className="flex items-center mb-6">
                            <button className="mr-4 text-gray-500 hover:text-gray-700"
                                onClick={() => window.history.back()}
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <h1 className="text-xl font-semibold">Edit Role Permissions</h1>
                        </div>

                        <div className="flex items-center mb-8">
                            <label htmlFor="roleName" className="mr-3 font-medium">
                                Role :
                            </label>
                            <input
                                type="text"
                                id="roleName"
                                value={role.name}
                                onChange={(e) => setRole({ ...role, name: e.target.value })}
                                disabled={true}
                                className="border border-gray-300 rounded px-3 py-2 w-56"
                            />
                        </div>
                        <div className="overflow-x-auto bg-gray-50 rounded-lg border border-gray-200">
                            {loading && (
                                <div className="flex items-center justify-center h-32">
                                    <Spinner color="primary" />
                                </div>
                            )}
                            {modules.map((module) => (
                                <div key={module.id} className="border-b border-gray-200 last:border-b-0">
                                    <div
                                        className={`${"py-4 px-6 hover:bg-gray-50 cursor-pointer"} 
                                                   ${expandedModules[module.id] ? "bg-gray-50 border-b border-gray-200" : ""}`}

                                        onClick={() => toggleModule(module.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                {expandedModules[module.id] ? (
                                                    <ChevronDown className="h-5 w-5 text-gray-500 mr-2" />
                                                ) : (
                                                    <ChevronRight className="h-5 w-5 text-gray-500 mr-2" />
                                                )}
                                                <span className="font-medium text-gray-800">{module.name}</span>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                {module.presets && (
                                                    <div className="flex space-x-2">
                                                        {module.presets.map(preset => (
                                                            <button
                                                                key={preset.id}
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    applyPreset(module.id, preset.id)
                                                                }}
                                                                className={`${"px-3 py-1 text-xs rounded-full border focus:outline-none focus:ring-2 focus:ring-offset-1"} 
                                                                          ${matchesPreset(module.id, preset.id)
                                                                        ? "bg-blue-50 border-blue-300 text-blue-700"
                                                                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                                                                    }`}
                                                            >
                                                                {matchesPreset(module.id, preset.id) && (
                                                                    <Check className="inline-block h-3 w-3 mr-1" />
                                                                )}
                                                                {preset.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="flex items-center text-xs text-gray-500">
                                                    {!expandedModules[module.id] && (
                                                        <div className="flex flex-wrap gap-1">
                                                            {(role.permissions[module.id] || []).length > 0 ? (
                                                                (role.permissions[module.id] || []).slice(0, 2).map(permId => {
                                                                    const perm = module.permissions.find(p => p.id === permId)
                                                                    return perm ? (
                                                                        <span key={permId} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                                                            {perm.name}
                                                                        </span>
                                                                    ) : null
                                                                })
                                                            ) : (
                                                                <span className="text-gray-400">No permissions</span>
                                                            )}
                                                            {(role.permissions[module.id] || []).length > 2 && (
                                                                <div
                                                                    className="relative cursor-pointer text-gray-500 hover:text-gray-700"
                                                                    onMouseEnter={() => setOpenModule(module.id)}
                                                                    onMouseLeave={() => setOpenModule(null)}
                                                                >
                                                                    <span>+{(role.permissions[module.id] || []).length - 2} more</span>

                                                                    {openModule === module.id && (
                                                                        <div className="absolute  right-0 top-5 bg-white shadow-lg border rounded-md p-2 text-gray-700 z-50 w-40">
                                                                            {(role.permissions[module.id] || []).slice(2).map(permId => {
                                                                                const perm = module.permissions.find(p => p.id === permId);
                                                                                return perm ? (
                                                                                    <div key={permId} className="px-3 py-1 bg-gray-50 rounded-md mb-1">
                                                                                        {perm.name}
                                                                                    </div>
                                                                                ) : null;
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {expandedModules[module.id] && (
                                        <div className="p-6 bg-white border-t border-gray-100">
                                            {/* Module permissions */}
                                            <div className="mb-6">
                                                {module.permissions.length !== 0 && <h3 className="text-sm font-medium text-gray-700 mb-3">Module Permissions</h3>}
                                                {/* <h3 className="text-sm font-medium text-gray-700 mb-3">Module Permissions</h3> */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                    {module.permissions.map((permission) => (
                                                        <div key={permission.id} className="flex items-start">
                                                            <div className="flex h-5 items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    id={`${module.id}-${permission.id}`}
                                                                    checked={hasPermission(module.id, permission.id)}
                                                                    onChange={() => togglePermission(module.id, permission.id)}
                                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                />
                                                            </div>
                                                            <div className="ml-3 text-sm">
                                                                <label htmlFor={`${module.id}-${permission.id}`} className="font-medium text-gray-700">
                                                                    {permission.name}
                                                                </label>
                                                                {permission.description && (
                                                                    <p className="text-gray-500">{permission.description}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Subpages */}

                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Action buttons */}
                        <div className="mt-8 flex justify-end gap-3">
                            {Btnload ? <Spinner color="primary" /> : <button className="submit-btn" onClick={() => updateRolePermissions()}>Save</button>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

