import React, { useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/react";
import { DatePicker } from 'antd';  // Import Ant Design DatePicker
import { Filter } from 'lucide-react';
import dayjs from 'dayjs'; // Import for formatting dates

const { RangePicker } = DatePicker;

interface ShiftFilters {

    customer_Name: string;
    site_name: string;
    shift_date: string;
    Service_name: string;
    BETWEENshift_date: string;
}

export default function FilterComponent({ onFilterChange }: { onFilterChange: (filters: ShiftFilters) => void }) {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [filters, setFilters] = useState<ShiftFilters>({
        customer_Name: '',
            site_name: '',
            shift_date: '',
            Service_name: '',
            BETWEENshift_date: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {interface ShiftFilters {
        company_name: string;
        Customer_Name: string;
        site_name: string;
        shift_date: string;
        service_name: string;
        BETWEENshift_date: string;
    }
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateRangeChange = (dates: any, dateStrings: [string, string]) => {
        setFilters((prev) => ({
            ...prev,
            BETWEENshift_date: dateStrings[0] && dateStrings[1] ? `${dateStrings[0]},${dateStrings[1]}` : ''
        }));
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
                        <label className="block text-gray-700">Customer Name</label>
                        <input 
                            type="text" 
                            name="customer_Name" 
                            className="w-full border border-gray-300 rounded-md" 
                            value={filters.customer_Name} 
                            onChange={handleChange}
                        />
                    </div>

                    {/* Site Name */}
                    <div className="input-field mb-3">
                        <label className="block text-gray-700">Site Name</label>
                        <input 
                            type="text" 
                            name="site_name" 
                            className="w-full border border-gray-300 rounded-md" 
                            value={filters.site_name} 
                            onChange={handleChange}
                        />
                    </div>

                    <div className="input-field mb-3">
                        <label className="block text-gray-700">Shift Date Range</label>
                        <RangePicker
                            format="YYYY-MM-DD"
                            onChange={handleDateRangeChange}
                            value={filters.BETWEENshift_date 
                                ? [dayjs(filters.BETWEENshift_date.split(',')[0]), dayjs(filters.BETWEENshift_date.split(',')[1])]
                                : null}
                            className="w-full border border-gray-300 rounded-md"
                            getPopupContainer={(trigger) => trigger.parentElement!} 
                        />
                    </div>

                    {/* Service Name */}
                    <div className="input-field mb-3">
                        <label className="block text-gray-700">Service Name</label>
                        <input 
                            type="text" 
                            name="Service_name" 
                            className="w-full border border-gray-300 rounded-md" 
                            value={filters.Service_name} 
                            onChange={handleChange}
                        />
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
