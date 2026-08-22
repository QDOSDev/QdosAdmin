import React, { useEffect, useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/react";
import { Filter } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch, IRootState } from '../../../store';
import { useSelector } from 'react-redux';

interface GuardFilters {
    first_name: string;
    status: string;
    role: string;
    email: string;
    mobile_phone: string;
}

export default function FilterComponent({ onFilterChange }: { onFilterChange: (filters: GuardFilters) => void }) {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [filters, setFilters] = useState<GuardFilters>({ first_name: '', status: '', role: '', email: '', mobile_phone: '' });
    const dispatch: AppDispatch = useDispatch();
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        onFilterChange(filters);
        setIsPopoverOpen(false);
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

                    {/* First Name Filter */}
                    <div className="input-field mb-3">
                        <label className="block text-gray-700">First Name</label>
                        <input
                            type="text"
                            name="first_name"
                            className="w-full border border-gray-300 rounded-md"
                            value={filters.first_name}
                            onChange={handleChange}
                        />
                    </div>
                    {/* Email Filter */}
                    <div className="input-field mb-3">
                        <label className="block text-gray-700">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="w-full border border-gray-300 rounded-md"
                            value={filters.email}
                            onChange={handleChange}
                        />
                    </div>
                    {/* Status Filter */}
                    <div className="input-field mb-3">
                        <label className="block font-medium text-gray-700">Status</label>
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

                    {/* Role Filter */}
                    <div className="input-field mb-3">
                        <label className="block font-medium text-gray-700">Role</label>
                        <select
                            name="role"
                            className="w-full mt-1 border border-gray-300 rounded-md"
                            value={filters.role}
                            onChange={handleChange}
                        >
                            <option value="">Select Role</option>
                       

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
