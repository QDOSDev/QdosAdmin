import React, { useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/react";
import { Filter } from 'lucide-react';

export default function FilterComponent({ onFilterChange }: { onFilterChange: (filters: any) => void }) {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [filters, setFilters] = useState({ name: '', status: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        onFilterChange(filters);  // Send data to parent
        setIsPopoverOpen(false);  // Close Popover
    };

    

    return (
        <Popover isOpen={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger>
                <button className="Filter-button gap-2">
                    <Filter className='w-[20px]' /> Filters
                </button>
            </PopoverTrigger>

            <PopoverContent className="items-stretch w-[500px]">
                <div className="px-4 py-3">
                    <div className="mb-3 text-xl flex gap-2">
                        Filters <Filter className='w-[20px]' />
                    </div>

                    {/* Service Name Input */}
                    <div className="input-field mb-3">
                        <label className="block text-gray-700">Service Name</label>
                        <input
                            type="text"
                            name="name"
                            className="w-full border border-gray-300 rounded-md"
                            value={filters.name}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Service Status Dropdown */}
                    <div className="input-field mb-3">
                        <label className="block font-medium text-gray-700">Service Status</label>
                        <select
                            name="status"
                            className="w-full mt-1 border border-gray-300 rounded-md"
                            value={filters.status}
                            onChange={handleChange}
                        >
                            <option value="">Select Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 mt-3">
                        <button className="reset-btn" onClick={() => setIsPopoverOpen(false)}>Cancel</button>
                        <button className="Search-btn" onClick={applyFilters}>
                            <span>Search</span>
                        </button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
