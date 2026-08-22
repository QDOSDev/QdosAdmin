import React, { useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/react";
import { DatePicker } from 'antd';
import { Filter } from 'lucide-react';
import dayjs from 'dayjs';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';

const { RangePicker } = DatePicker;

interface ShiftFilters {
    customer_id: string;
    site_id: string;
    service_id: string;
    BETWEENshift_date: string;
    "Guard_Schedule.guard_id": string;
}

interface FilterProps {
    onFilterChange: (filters: ShiftFilters) => void;
    allcustomers: any[];
    services: any[];
    site: any[];
    gaurds: any[];
    filters: ShiftFilters;
    setFilters: React.Dispatch<React.SetStateAction<ShiftFilters>>;
}

export default function FilterComponent({ filters, setFilters, onFilterChange, allcustomers, services, site, gaurds }: FilterProps) {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const dispatch: AppDispatch = useDispatch();



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

            <PopoverContent className="items-stretch w-[500px]" onClick={(e) => e.stopPropagation()}>
                <div className="px-4 py-3">
                    <div className="mb-3 text-xl flex gap-2">
                        Filters <Filter className='w-[20px]' />
                    </div>

                    {/* Customer Name Dropdown */}
                    <div className="input-field mb-3">
                        <label className="block text-gray-700">Customer</label>
                        <select
                            name="customer_id"
                            className="w-full border border-gray-300 rounded-md"
                            value={filters.customer_id}
                       
                        >
                            <option value="">Select Customer</option>
                            {allcustomers?.map((customer: any) => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.customer_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Site Name Dropdown */}
                    <div className="input-field mb-3">
                        <label className="block text-gray-700">Site</label>
                        <select
                            name="site_id"
                            className="w-full border border-gray-300 rounded-md"
                            value={filters.site_id}
                        
                        >
                            <option value="">Select Site</option>
                            {site?.map((s: any) => (
                                <option key={s.ID} value={s.ID}>
                                    {s.site_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Shift Date Range */}
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

                    {/* Service Name Dropdown */}
                    <div className="input-field mb-3">
                        <label className="block text-gray-700">Service</label>
                        <select
                            name="service_id"
                            className="w-full border border-gray-300 rounded-md"
                            value={filters.service_id}
                    

                        >
                            <option value="">Select Service</option>
                            {services?.map((service: any) => (
                                <option key={service.ID} value={service.ID}>
                                    {service.Service_name}
                                </option>
                            ))}
                        </select>
                    </div>

                       {/* Guard Dropdown */}
                       <div className="input-field mb-3">
                        <label className="block text-gray-700">Guard</label>
                        <select
                            name="Guard_Schedule.guard_id"
                            className="w-full border border-gray-300 rounded-md"
                            value={filters["Guard_Schedule.guard_id"]}
                        
                        >
                            <option value="">Select Guard</option>
                            {gaurds?.map((guard: any) => (
                                <option key={guard.ID} value={guard.ID}>
                                    {`${guard.first_name} ${guard.last_name}`}
                                </option>
                            ))}
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
