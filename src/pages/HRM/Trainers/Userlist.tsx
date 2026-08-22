import type React from "react"
import { useEffect, useState, useRef } from "react"
import View from "../../../../public/assets/APSIcon/View"
import Edit from "../../../../public/assets/APSIcon/Edit"
import Invite from "../../../../public/assets/APSIcon/Invite"
import Cookies from "js-cookie"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { Modal, message } from "antd"
import { useSelector } from "react-redux"
import type { AppDispatch, IRootState } from "../../../store"
import { Tooltip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Checkbox, Button } from "@nextui-org/react"
import Tableempty from "../../Tableempty"
import { EllipsisVertical } from "lucide-react"
import { useDispatch } from "react-redux"
import { format } from "path"
interface Gaurds {
  ID: number
  first_name: string
  last_name: string
  expiry_date: string
}

const COLUMN_PREFERENCES_KEY = "userlist_column_preferences"

interface UserlistProps {
  filters: {
    first_name: string
    status: string
    role: string
    email: string
    mobile_phone: string
  }
  selectedDays: number | null
}

export default function Userlist({ filters, selectedDays }: UserlistProps) {
  const [loading, setLoading] = useState(false)
  const [roleslist, setRolesList] = useState<Role[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [isLicenseDropdownOpen, setIsLicenseDropdownOpen] = useState(false)
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const dispatch: AppDispatch = useDispatch()

  const defaultColumns = [
    { id: "sno", name: "S.No", visible: true },
    { id: "firstName", name: "First Name", visible: true },
    { id: "lastName", name: "Last Name", visible: true },
    { id: "role", name: "Role", visible: true },
    { id: "email", name: "Email Address", visible: true },
    { id: "phone", name: "Phone", visible: true },
    { id: "status", name: "Status", visible: true },
    { id: "action", name: "Action", visible: true },
  ]

  const [visibleColumns, setVisibleColumns] = useState(() => {
    try {
      const savedPreferences = localStorage.getItem(COLUMN_PREFERENCES_KEY)
      if (savedPreferences) {
        return JSON.parse(savedPreferences)
      }
      return defaultColumns
    } catch (error) {
      console.error("Error loading column preferences:", error)
      return defaultColumns
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(COLUMN_PREFERENCES_KEY, JSON.stringify(visibleColumns))
    } catch (error) {
      console.error("Error saving column preferences:", error)
    }
  }, [visibleColumns])


  const endpoint = import.meta.env.VITE_API_LIVEHOST
  const apiKey = import.meta.env.VITE_API_X_HEADER_KEY
  const token = Cookies.get("token")

  interface Role {
    Guard_ID: string
    id: string
    first_name: string
    last_name: string
    email: string
    mobile_phone: string
    status: string
    invite_status?: string
    expiry_date?: string
  }

  const getList = async () => {
    setLoading(true)

    try {
      const queryParams = [
        "route=APS/List/Employer",
        `page=${currentPage}`,
        `pageSize=${pageSize}`,
        "filter[delete_status]=0"
      ]

      if (selectedDays !== null) {
        queryParams.push(`EX_date=${selectedDays}`)
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.push(`filter[${key}]=${value}`)
        }
      })

      const url = `${endpoint}?${queryParams.join("&")}`

      const { data } = await axios.get(url, {
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (data.status === true) {
        setRolesList(data.Data)
        setTotalPages(Math.ceil(data.Pagination.totalRecords / pageSize))
      }
    } catch (error) {
      console.error("Error fetching the list:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getList()
  }, [filters, currentPage, pageSize, selectedDays])

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value))
    setCurrentPage(1)
  }

  const editGaurd = (id: any) => {
    navigate(`/edit/guard/${id}`)
  }

  const Statuschange = async (id: any, status: string) => {
    try {
      const { data } = await axios.get(`${endpoint}?route=APS/Employer/Status/update&ID=${id}&laststatus=${status}`, {
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      if (data.status === true) {
        getList()
      }
    } catch (error) {
      console.error("Error fetching the list:", error)
    } finally {
    }
  }

  const sendInvite = async (id: any, inviteStatus: string) => {
    if (inviteStatus === "1") {
      const modal = Modal.confirm({
        title: "User Already Invited",
        content:
          "This user has already been invited. If you reinvite, their password will be updated. Do you want to continue?",
        maskClosable: true,
        footer: (
          <>
            <div className="flex gap-2 mt-3">
              <button className="reset-btn" onClick={() => modal.destroy()}>
                Cancel
              </button>
              <button
                className="Search-btn"
                onClick={async () => {
                  modal.destroy()
                  await sendInviteRequest(id)
                }}
              >
                Re-invite
              </button>
            </div>
          </>
        ),
      })
    } else {
      await sendInviteRequest(id)
    }
  }

  const sendInviteRequest = async (id: any) => {
    try {
      const { data } = await axios.get(`${endpoint}?route=APS/Employer/Invite/Send&ID=${id}`, {
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      if (data.status) {
        message.success(data.message)
      } else {
        message.info(data.message)
      }
    } catch (error) {
      console.error("Error sending invite:", error)
      message.error("Failed to send invite. Please try again.")
    }
  }

  const handleGuardAction = (id: any, action: "view" | "edit") => {
    navigate(`/edit/user/${id}`, { state: { action } })
  }

  const [tempColumnVisibility, setTempColumnVisibility] = useState(() => {
    return visibleColumns.reduce(
      (acc: any, column: any) => {
        acc[column.id] = column.visible
        return acc
      },
      {} as Record<string, boolean>,
    )
  })

  const handleDropdownOpenChange = (isOpen: boolean) => {
    setIsDropdownOpen(isOpen)
    if (isOpen) {
      const currentVisibility = visibleColumns.reduce(
        (acc: any, column: any) => {
          acc[column.id] = column.visible
          return acc
        },
        {} as Record<string, boolean>,
      )
      setTempColumnVisibility(currentVisibility)
    }
  }

  const atLeastOneColumnVisible = Object.values(tempColumnVisibility).some((visible) => visible)

  const calculateDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getExpiryStatus = (daysLeft: number) => {
    if (daysLeft < 0) return "Expired"
    if (daysLeft <= 30) return `Expires in ${daysLeft} days`
    return `${daysLeft} days until expiry`
  }

  return (
    <div className="Role-table mt-4 table-container">
      

      <div className="table-wrapper">
        <div className="border-t-8 border-[#113354]"></div>

        <table className="data-table">
          <thead>
            <tr className="">
              {visibleColumns.find((col: any) => col.id === "sno")?.visible && (
                <th className="px-4 py-3 text-left font-medium text-gray-500 sortable-header">S.No</th>
              )}
              {visibleColumns.find((col: any) => col.id === "firstName")?.visible && (
                <th className="px-4 py-3 text-left font-medium text-gray-500 sortable-header">First Name</th>
              )}
              {visibleColumns.find((col: any) => col.id === "lastName")?.visible && (
                <th className="px-4 py-3 text-left font-medium text-gray-500 sortable-header">Last Name</th>
              )}
              {visibleColumns.find((col: any) => col.id === "role")?.visible && (
                <th className="px-4 py-3 text-left font-medium text-gray-500 sortable-header">Role</th>
              )}
              {visibleColumns.find((col: any) => col.id === "email")?.visible && (
                <th className="px-4 py-3 text-left font-medium text-gray-500 sortable-header">Email Address</th>
              )}
              {visibleColumns.find((col: any) => col.id === "phone")?.visible && (
                <th className="px-4 py-3 text-left font-medium text-gray-500 sortable-header">Phone</th>
              )}
              {visibleColumns.find((col: any) => col.id === "status")?.visible && (
                <th className="px-4 py-3 text-left font-medium text-gray-500 sortable-header">Status</th>
              )}
              {(visibleColumns.find((col: any) => col.id === "action")?.visible || true) && (
                <th className="px-4 py-3 text-left font-medium text-gray-500 relative sticky right-0 bg-white w-[140px]">
                  <div className="flex items-center justify-between">
                    {visibleColumns.find((col: any) => col.id === "action")?.visible && (
                      <span className="sortable-header">Action</span>
                    )}

                    <div ref={dropdownRef}>
                      <Dropdown isOpen={isDropdownOpen} onOpenChange={handleDropdownOpenChange}>
                        <DropdownTrigger>
                          <Button isIconOnly variant="light" className="p-0 m-0 text-gray-500 hover:text-gray-700">
                            <EllipsisVertical />
                          </Button>
                        </DropdownTrigger>

                        <DropdownMenu
                          aria-label="Column Selection"
                          className="p-2 w-[23vw] sm:min-w-[200px] max-h-[300px] overflow-y-auto z-50"
                          closeOnSelect={false}
                        >
                          <DropdownItem key="column-header" className="font-semibold text-gray-700 py-2" isReadOnly>
                            Show/Hide Columns
                          </DropdownItem>

                          <DropdownItem key="divider" className="h-px bg-gray-200 my-1" isReadOnly />
                          <>
                            {defaultColumns.map((column) => {
                              const isVisible = tempColumnVisibility[column.id];
                              const visibleCount = Object.values(tempColumnVisibility).filter(Boolean).length;
                              const isDisabled = isVisible && visibleCount <= 1;

                              return (
                                <DropdownItem key={column.id} isReadOnly className="py-1">
                                  <label className="flex items-center gap-2 cursor-pointer w-full">
                                    <Checkbox
                                      isSelected={isVisible}
                                      onChange={() => {
                                        if (!isVisible || visibleCount > 1) {
                                          setTempColumnVisibility((prev: any) => ({
                                            ...prev,
                                            [column.id]: !prev[column.id],
                                          }));
                                        }
                                      }}
                                      isDisabled={isDisabled}
                                    />
                                    <span className="truncate">{column.name}</span>
                                  </label>
                                </DropdownItem>
                              );
                            })}
                          </>

                          <DropdownItem key="divider-2" className="h-px bg-gray-200 my-1" isReadOnly />

                          <DropdownItem key="apply" className="text-center">
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={() => {
                                setVisibleColumns((prev: any) =>
                                  prev.map((col: any) => ({
                                    ...col,
                                    visible: tempColumnVisibility[col.id],
                                  })),
                                );
                                message.success("Column preferences applied successfully");
                                setIsDropdownOpen(false);
                              }}
                              style={{
                                backgroundColor: "rgb(234, 179, 8)",
                                borderColor: "#fadb14",
                                color: "white",
                                fontWeight: "bold",
                              }}
                            >
                              Apply
                            </Button>
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </div>
                </th>
              )}

            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, index) => (
                <tr key={index} className="border-b last:border-b-0">
                  {visibleColumns.find((col: any) => col.id === "sno")?.visible && (
                    <td className="px-4 py-3">
                      <div className="w-12 rounded h-5 bg-gray-300 animate-pulse"></div>
                    </td>
                  )}
                  {visibleColumns.find((col: any) => col.id === "firstName")?.visible && (
                    <td className="px-4 py-3 text-gray-600">
                      <div className="w-24 rounded h-5 bg-gray-300 animate-pulse"></div>
                    </td>
                  )}
                  {visibleColumns.find((col: any) => col.id === "lastName")?.visible && (
                    <td className="px-4 py-3 text-gray-600">
                      <div className="w-16 rounded h-5 bg-gray-300 animate-pulse"></div>
                    </td>
                  )}
                  {visibleColumns.find((col: any) => col.id === "role")?.visible && (
                    <td className="px-4 py-3 text-gray-600">
                      <div className="w-16 rounded h-5 bg-gray-300 animate-pulse"></div>
                    </td>
                  )}
                  {visibleColumns.find((col: any) => col.id === "email")?.visible && (
                    <td className="px-4 py-3 text-gray-600">
                      <div className="w-24 rounded h-5 bg-gray-300 animate-pulse"></div>
                    </td>
                  )}
                  {visibleColumns.find((col: any) => col.id === "phone")?.visible && (
                    <td className="px-4 py-3 text-gray-600">
                      <div className="w-20 rounded h-5 bg-gray-300 animate-pulse"></div>
                    </td>
                  )}
                  {visibleColumns.find((col: any) => col.id === "status")?.visible && (
                    <td className="px-4 py-3 text-gray-600">
                      <div className="w-16 rounded h-5 bg-gray-300 animate-pulse"></div>
                    </td>
                  )}
                  {visibleColumns.find((col: any) => col.id === "action")?.visible && (
                    <td className="px-4 py-3 text-gray-600">
                      <div className="flex gap-2">
                        <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
                        <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
                        <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : roleslist.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.filter((col: any) => col.visible).length} className="px-4 py-3 text-center">
                  <Tableempty length={visibleColumns.filter((col: any) => col.visible).length} />
                </td>
              </tr>
            ) : (
              roleslist.map((entry: any, index) => (
                <tr key={index} className="border-b last:border-b-0 hover:shadow-md hover:font-semibold">
                  {visibleColumns.find((col: any) => col.id === "sno")?.visible && (
                    <td className="px-4 py-3 text-gray-600">{(currentPage - 1) * pageSize + index + 1}</td>
                  )}
                  {visibleColumns.find((col: any) => col.id === "firstName")?.visible && (
                    <td className="px-4 py-3 text-gray-600">{entry.first_name || "---"}</td>
                  )}
                  {visibleColumns.find((col: any) => col.id === "lastName")?.visible && (
                    <td className="px-4 py-3 text-gray-600">{entry.last_name || "---"}</td>
                  )}
                  {visibleColumns.find((col: any) => col.id === "role")?.visible && (
                    <td className="px-4 py-3 text-gray-600">{entry.Role || "---"}</td>
                  )}
                  {visibleColumns.find((col: any) => col.id === "email")?.visible && (
                    <td className="px-4 py-3 text-gray-600">{entry.email || "---"}</td>
                  )}
                  {visibleColumns.find((col: any) => col.id === "phone")?.visible && (
                    <td className="px-4 py-3 text-gray-600">{entry.mobile_phone || "---"}</td>
                  )}
                  {visibleColumns.find((col: any) => col.id === "status")?.visible && (
                    <td
                      className="px-4 py-3 text-gray-600"
                   
                    >
                      <div className="flex items-center cursor-pointer">
                        {entry.status === "Active" && <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>}
                        {entry.status === "Inactive" && <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>}
                        {entry.status || "---"}
                      </div>
                    </td>
                  )}
                  {visibleColumns.find((col: any) => col.id === "action")?.visible && (
                    <td className="px-4 py-3 text-gray-600">
                      <div className="flex gap-2">
                        <Tooltip content={"View"}>
                          <span
                            onClick={() => handleGuardAction(entry.Guard_ID, "view")}
                            title="View"
                            className="cursor-pointer"
                          >
                            <View className="h-5 w-5 text-gray-500" />
                          </span>
                        </Tooltip>
                     
                          <Tooltip content={"Edit"}>
                            <span
                              onClick={() => handleGuardAction(entry.Guard_ID, "edit")}
                              title="Edit"
                              className="cursor-pointer"
                            >
                              <Edit className="h-5 w-5 text-gray-500" />
                            </span>
                          </Tooltip>
                      

                      
                          <Tooltip content={entry.invite_status === "1" ? "Already Invited" : "Invite"}>
                            <span
                              onClick={() => sendInvite(entry.Guard_ID, entry.invite_status)}
                              className="cursor-pointer"
                            >
                              <Invite className="h-5 w-5 text-blue-500" />
                            </span>
                          </Tooltip>
                  
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-container">
        <div className="pagination-controls">
          <button
            className="pagination-button"
            disabled={currentPage === 1 || loading}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            ‹ Prev
          </button>
          {[...Array(totalPages)].map((_, pageIndex) => (
            <button
              key={pageIndex}
              className={`flex h-8 w-8 items-center justify-center rounded-md text-sm ${currentPage === pageIndex + 1 ? "bg-yellow text-white" : "hover:bg-gray-100 border border-gray-300"}`}
              onClick={() => handlePageChange(pageIndex + 1)}
            >
              {pageIndex + 1}
            </button>
          ))}
          <button
            className="pagination-button"
            disabled={currentPage === totalPages || loading}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next ›
          </button>
        </div>

        <div className="items-per-page">
          <span className="text-sm text-gray-600">Items per page</span>
          <select className="items-select" value={pageSize} onChange={handlePageSizeChange}>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>
    </div>
  )
}
