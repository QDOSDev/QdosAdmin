import React, { useState, useEffect } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/react";
import { Filter } from 'lucide-react';
import { useSelector } from 'react-redux';
import { AppDispatch, IRootState } from '../../store';
import { useDispatch } from 'react-redux';

interface ShiftFilters {
    guard: string;
    site_name: string;
}

interface Guards {
    ID: number;
    first_name: string;
    last_name: string;
}

interface Site {
    ID: number;
    site_name: string;
}

export default function FilterComponent({ onFilterChange }: { onFilterChange: (filters: ShiftFilters) => void }) {
    const dispatch: any = useDispatch();



    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");


    const [filters, setFilters] = useState<ShiftFilters>({
        guard: '',
        site_name: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        onFilterChange(filters);
        setIsPopoverOpen(false);
    };

    // useEffect(() => {
    //     dispatch(fetchGaurd());
    //     dispatch(fetchCustomersSite({ customerId: '' }));
    // }, [dispatch]);

    return (
        <Popover isOpen={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger>
                <button className="Filter-button gap-2">
                    <Filter className='w-[20px]' /> Filters
                </button>
            </PopoverTrigger>

            <PopoverContent
                className="items-stretch w-[500px]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-4 py-3">
                    <div className="mb-3 text-xl flex gap-2">
                        Filters <Filter className='w-[20px]' />
                    </div>

                    {/* Customer Name */}
                    <div className="input-field mb-3">
                        <label className="block text-gray-700">Guard Name</label>
                        <select
                            id="guard"
                            name='guard'
                            className={`w-full border rounded-md `}
                            value={filters.guard}
                            onChange={handleChange}
                        >
                            <option value="">Select a Guard</option>
                     
                        </select>
                    </div>

                    {/* Site Name */}
                    <div className="input-field mb-3">
                        <label className="block text-gray-700">Site Name</label>
                        <select
                            id="site_name"
                            name='site_name'
                            className={`w-full border rounded-md `}
                            value={filters.site_name}
                            onChange={handleChange}
                        >
                            <option value="">Select a Site</option>
                    
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
