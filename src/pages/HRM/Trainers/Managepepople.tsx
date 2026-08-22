import {  useState } from "react"
import { Button, useDisclosure } from "@nextui-org/react"

import Rolelist from "./Roleslist"

import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import type {  IRootState } from "../../../store"
import { RxCross2 } from "react-icons/rx"
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react"

const tabs = [
  {
    id: "add-guard",
    label: "Employee",
  },
]

export default function Managepepople() {
  const [activeTab, setActiveTab] = useState("add-guard")
  const [isLicenseDropdownOpen, setIsLicenseDropdownOpen] = useState(false)
  const [customDays, setCustomDays] = useState("")
  const [selectedDuration, setSelectedDuration] = useState<string>("")
  const [selectedDays, setSelectedDays] = useState<number | null>(null)

  const handleSearch = () => {
    const days = selectedDuration === "custom" ? Number.parseInt(customDays) : Number.parseInt(selectedDuration)
    if (!isNaN(days)) {
      setSelectedDays(days)
      setIsLicenseDropdownOpen(false)
    }
  }

  const removeLicenseFilter = () => {
    setSelectedDays(null)
    setSelectedDuration("")
    setCustomDays("")
  }

  const initialFilters = {
    first_name: "",
    status: "",
    role: "",
    email: "",
    mobile_phone: "",
  }

  const [filters, setFilters] = useState(initialFilters)

  const removeFilter = (key: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: "",
    }))
  }
  
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

 
  const navigate = useNavigate()
  const handleClick = () => {
    navigate(`/add/user`)
  }
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="">
          <h1 className="text-2xl font-bold text-gray-800">Trainers</h1>
          <div className="flex flex-wrap gap-3 items-center mt-3">
            {Object.entries(filters)
              .filter(([key, value]) => value)
              .map(([key, value]) => {
             

                return (
                  <Button key={key} className="yellow-color" onClick={() => removeFilter(key)}>
                    <RxCross2 />
                  </Button>
                )
              })}

            {selectedDays !== null && (
              <Button className="yellow-color" onClick={removeLicenseFilter}>
                {` ${selectedDays} days`} <RxCross2 />
              </Button>
            )}

            {(Object.values(filters).some((value) => value) || selectedDays !== null) && (
              <h5
                className="text-yellow cursor-pointer"
                onClick={() => {
                  setFilters(initialFilters)
                  removeLicenseFilter()
                }}
              >
                Clear all filters
              </h5>
            )}
          </div>
        </div>
       
          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="relative">
              <Dropdown isOpen={isLicenseDropdownOpen} onOpenChange={setIsLicenseDropdownOpen}>
                <DropdownTrigger>
                  <Button
                    variant="flat"
                    className="bg-white border border-gray-200 px-6 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 shadow-sm transition-all duration-200 flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 2a2 2 0 00-2 2v1H5a2 2 0 00-2 2v11a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-3V4a2 2 0 00-2-2zm-7 9a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Guard License Status
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Guard License Status"
                  className="w-80 p-2 rounded-xl shadow-lg border border-gray-100"
                >
                  <DropdownItem
                    key="license-filter"
                    className="py-3 px-4 hover:bg-gray-50 rounded-lg transition-colors"
                    isReadOnly
                  >
                    <div className="flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-between items-center">
                        <Button
                          size="sm"
                          className={`${selectedDuration === "30" ? "bg-yellow-100" : "bg-gray-50"}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedDuration("30")
                          }}
                        >
                          30 Days
                        </Button>
                        <Button
                          size="sm"
                          className={`${selectedDuration === "15" ? "bg-yellow-100" : "bg-gray-50"}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedDuration("15")
                          }}
                        >
                          15 Days
                        </Button>
                        <Button
                          size="sm"
                          className={`${selectedDuration === "custom" ? "bg-yellow-100" : "bg-gray-50"}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedDuration("custom")
                          }}
                        >
                          Custom
                        </Button>
                      </div>
                      {selectedDuration === "custom" && (
                        <input
                          type="number"
                          value={customDays}
                          onChange={(e) => setCustomDays(e.target.value)}
                          placeholder="Enter number of days"
                          className="w-full p-2 border border-gray-200 rounded-lg"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <Button
                        className="w-full bg-[#F5A524] text-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSearch()
                        }}
                      >
                        Search
                      </Button>
                    </div>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>

   

            <Button className="Insert-Button" onClick={handleClick}>
              <img src="./assets/Icon/Add_user.svg" alt="Adduser" /> Add User
            </Button>
          </div>
      
      </div>

      <div className="Managepeople-Div mt-4 grid gap-3">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap border-b-2 py-2 px-1 text-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-[#F5A524] text-[#F5A524]"
                    : "border-transparent text-black-500 hover:border-black-500 hover:text-black-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === "add-guard" ? (
          <div className="User-table ">
          
          </div>
        ) : (
          <div className="Role-table">
            <Rolelist role="roles" isOpen={isOpen} onOpen={onOpen} onOpenChange={onOpenChange} />
          </div>
        )}
      </div>
    </>
  )
}
