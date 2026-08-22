import React, { useState } from 'react'
import { Popover, PopoverTrigger, PopoverContent, Button } from "@nextui-org/react";
import { Filter, Search } from 'lucide-react';

export default function filter() {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const handlePopoverChange = (open: boolean) => {
        setIsPopoverOpen(open);
    };
    return (

        <Popover
            isOpen={isPopoverOpen}
            onOpenChange={handlePopoverChange}
        >
            <PopoverTrigger>
                <button className="Filter-button gap-2">
                    <Filter className='w-[20px]' /> Filters
                </button>
            </PopoverTrigger>

            <PopoverContent className="items-stretch w-[500px]">
                <div className="px-4 py-3">
                    {/* Filter Label */}
                    <div className="mb-3 text-xl flex gap-2">
                        Filters
                        <Filter className='w-[20px]' />
                    </div>

                    {/* Name Dropdown */}
                    <div className="input-field mb-3">
                        <label htmlFor="name" className="block text-gray-700">
                            Name
                        </label>
                        <input type="text" className="w-full border border-gray-300 rounded-md" />
                    </div>

                    {/* Userwise Dropdown */}
                    <div className="input-field mb-3">
                        <label htmlFor="userwise" className="block font-medium text-gray-700">
                            User wise
                        </label>
                        <select
                            id="userwise"
                            required
                            className="w-full mt-1 border border-gray-300 rounded-md"
                        >
                            <option value="">Select User</option>
                            <option value="user1">User 1</option>
                            <option value="user2">User 2</option>
                        </select>
                    </div>

                    {/* Created By Dropdown */}
                    <div className="input-field mb-3">
                        <label htmlFor="createdBy" className="block font-medium text-gray-700">
                            Created By
                        </label>
                        <select
                            id="createdBy"
                            required
                            className="w-full mt-1 border border-gray-300 rounded-md"
                        >
                            <option value="">Select Creator</option>
                            <option value="creator1">Creator 1</option>
                            <option value="creator2">Creator 2</option>
                        </select>
                    </div>

                    {/* Date Range */}
                    <div className="input-field mb-3">
                        <label htmlFor="dateRange" className="block font-medium text-gray-700">
                            Date Range
                        </label>
                        <div className="flex gap-2">
                            <input
                                id="startDate"
                                type="date"
                                className="w-full  border border-gray-300 rounded-md"
                            />
                            <input
                                id="endDate"
                                type="date"
                                className="w-full  border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex  gap-2 mt-3">
                        <button
                            className="reset-btn"
                            onClick={() => setIsPopoverOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="Search-btn "
                            onClick={() => console.log("Search clicked")}
                        >
                            <span>Search</span>
                        </button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>


    )
}