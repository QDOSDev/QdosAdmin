import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import {  Button, Spinner } from "@nextui-org/react";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/react";
import { CiFilter } from "react-icons/ci";
import { RxCross2 } from "react-icons/rx";
import { PiUploadSimpleBold } from "react-icons/pi";
import { Table } from 'antd'



export default function Clock() {



    const [isPopoverOpen, setIsPopoverOpen] = useState(false); 
      const [loading, setLoading] = useState(true);

    const handlePopoverChange = (open: boolean) => {
        setIsPopoverOpen(open); 
    };


    const data = [
        {
            key: '1',
            name: 'Tony Reichert',
            role: 'CEO',
            status: 'Active',
        },
        {
            key: '2',
            name: 'Zoey Lang',
            role: 'Technical Lead',
            status: 'Paused',
        },
        {
            key: '3',
            name: 'Jane Fisher',
            role: 'Senior Developer',
            status: 'Active',
        },
        {
            key: '4',
            name: 'William Howard',
            role: 'Community Manager',
            status: 'Vacation',
        },
    ];




    return (
        <div>

            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                {/* Left Section: Title and Breadcrumbs */}
                <div className="flex-1 min-w-[250px]">
                    <h2 className="py-3 flex items-center uppercase font-extrabold mb-1">
                        Clock IN/OUT
                    </h2>
                    <ul className="flex flex-wrap space-x-2 rtl:space-x-reverse text-sm">
                        <li>Dashboard</li>
                        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                            <span>HRM</span>
                        </li>
                        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                            <NavLink to="/dashboard" className="text-[#E2AD17]">
                                <span>Clock IN/OUT</span>
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

                {/* Right Section: Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-3">
                    <Popover
                        isOpen={isPopoverOpen}
                        onOpenChange={handlePopoverChange}
                    >
                        <PopoverTrigger>
                            <Button className="bg-gray-200 text-gray-600 text-xs font-bold w-full md:w-auto">
                                <CiFilter style={{ fontWeight: "bold", fontSize: "15px" }} /> Filters
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent className="max-h-[80vh] overflow-y-auto w-full md:w-[300px] lg:w-[350px]">
                            <div className="px-4 py-3">
                                {/* Filter Label */}
                                <div className="mb-3 flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-800">
                                        Filters
                                    </span>
                                    <CiFilter style={{ fontWeight: "bold", fontSize: "15px" }} />
                                </div>

                                {/* Name Dropdown */}
                                <div className="input-field mb-3">
                                    <label htmlFor="name" className="block text-xs font-medium text-gray-700">
                                        Name
                                    </label>
                                    <select
                                        id="name"
                                        required
                                        className="w-full mt-1 p-1 text-xs border border-gray-300 rounded-md"
                                    >
                                        <option value="">Select Name</option>
                                        <option value="name1">Name 1</option>
                                        <option value="name2">Name 2</option>
                                    </select>
                                </div>

                                {/* Userwise Dropdown */}
                                <div className="input-field mb-3">
                                    <label htmlFor="userwise" className="block text-xs font-medium text-gray-700">
                                        Userwise
                                    </label>
                                    <select
                                        id="userwise"
                                        required
                                        className="w-full mt-1 p-1 text-xs border border-gray-300 rounded-md"
                                    >
                                        <option value="">Select User</option>
                                        <option value="user1">User 1</option>
                                        <option value="user2">User 2</option>
                                    </select>
                                </div>

                                {/* Created By Dropdown */}
                                <div className="input-field mb-3">
                                    <label htmlFor="createdBy" className="block text-xs font-medium text-gray-700">
                                        Created By
                                    </label>
                                    <select
                                        id="createdBy"
                                        required
                                        className="w-full mt-1 p-1 text-xs border border-gray-300 rounded-md"
                                    >
                                        <option value="">Select Creator</option>
                                        <option value="creator1">Creator 1</option>
                                        <option value="creator2">Creator 2</option>
                                    </select>
                                </div>

                                {/* Date Range */}
                                <div className="input-field mb-3">
                                    <label htmlFor="dateRange" className="block text-xs font-medium text-gray-700">
                                        Date Range
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            id="startDate"
                                            type="date"
                                            className="w-full p-1 text-xs border border-gray-300 rounded-md"
                                        />
                                        <input
                                            id="endDate"
                                            type="date"
                                            className="w-full p-1 text-xs border border-gray-300 rounded-md"
                                        />
                                    </div>
                                </div>

                                {/* Footer Buttons */}
                                <div className="flex flex-wrap justify-between gap-2 mt-3">
                                    <button
                                        className="px-3 py-1 text-xs text-blue-800 border border-blue-800 bg-transparent rounded-md hover:bg-blue-50"
                                        onClick={() => setIsPopoverOpen(false)} // Close popover
                                    >
                                        Close
                                    </button>
                                    <button
                                        className="px-3 py-1 text-xs text-white bg-orange-600 rounded-md hover:bg-blue-700 flex items-center gap-1"

                                    >
                                        Search
                                    </button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Button
                        className="text-white text-xs w-full md:w-auto"
                        style={{ backgroundColor: "rgb(14, 23, 38)" }}

                    >
                        <PiUploadSimpleBold />
                        Export
                    </Button>
                </div>
            </div>


            <div className='inventory-table mt-4' style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Table
                    dataSource={data}
                    rowKey="id"
                    columns = {[
                        {
                            title: 'S.No',
                            key: 'serial',
                            render: (_, __, index) => index + 1,
                        },
                        {
                            title: 'Name',
                            dataIndex: 'name',
                            key: 'name',
                        },
                        {
                            title: 'Role',
                            dataIndex: 'role',
                            key: 'role',
                        },
                        {
                            title: 'Status',
                            dataIndex: 'status',
                            key: 'status',
                        },
                    ]}
                    locale={{
                        emptyText: loading ? (
                            <div className="flex justify-center items-center h-96">
                                <Spinner />
                            </div>
                        ) : data.length === 0 ? (
                            <div className="flex justify-center items-center h-96">
                                <img src="/assets/images/Empty_table.png" alt="No data available" className="w-1/4 h-auto" />
                            </div>
                        ) : null,
                    }}

                    pagination={false}
                   

                />
            </div>









            {/* Filter Modal */}





        </div>
    )
}
