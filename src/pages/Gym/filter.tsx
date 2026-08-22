import React, { useState, useEffect } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/react";
import { Filter as FilterIcon } from 'lucide-react';

interface FilterProps {
  onSearch: (filters: any) => void;
  filterValues: {
    name: string;
    email: string;
    phone: string;
    pan: string;
    license_no: string;
    address: string;
    status: string;
  };
}

export default function FilterComponent({ onSearch, filterValues }: FilterProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filterValues);

  useEffect(() => {
    setLocalFilters(filterValues);
  }, [filterValues]);

  const handlePopoverChange = (open: boolean) => {
    setIsPopoverOpen(open);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    onSearch(localFilters);
    setIsPopoverOpen(false);
  };

  return (
    <Popover isOpen={isPopoverOpen} onOpenChange={handlePopoverChange}>
      <PopoverTrigger>
        <button className="Filter-button gap-2">
          <FilterIcon className='w-[20px]' /> Filters
        </button>
      </PopoverTrigger>

      <PopoverContent className="items-stretch w-[500px]">
        <div className="px-4 py-3">
          <div className="mb-3 text-xl flex gap-2">
            Filters
            <FilterIcon className='w-[20px]' />
          </div>

          {/* Name */}
          <div className="input-field mb-3">
            <label htmlFor="name" className="block text-gray-700">Name</label>
            <input name="name" type="text" value={localFilters.name} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md" />
          </div>

          {/* Email */}
          <div className="input-field mb-3">
            <label htmlFor="email" className="block text-gray-700">Email</label>
            <input name="email" type="text" value={localFilters.email} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md" />
          </div>

          {/* Phone */}
          <div className="input-field mb-3">
            <label htmlFor="phone" className="block text-gray-700">Phone</label>
            <input name="phone" type="text" value={localFilters.phone} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md" />
          </div>

          {/* PAN */}
          <div className="input-field mb-3">
            <label htmlFor="pan" className="block text-gray-700">PAN</label>
            <input name="pan" type="text" value={localFilters.pan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md" />
          </div>

          {/* License No */}
          <div className="input-field mb-3">
            <label htmlFor="license_no" className="block text-gray-700">License No</label>
            <input name="license_no" type="text" value={localFilters.license_no} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md" />
          </div>

          {/* Address */}
          <div className="input-field mb-3">
            <label htmlFor="address" className="block text-gray-700">Address</label>
            <input name="address" type="text" value={localFilters.address} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md" />
          </div>


          <div className="flex gap-2 mt-3">
            <button className="reset-btn" onClick={() => setIsPopoverOpen(false)}>Cancel</button>
            <button className="Search-btn" onClick={handleSearch}>Search</button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
