import React, { useEffect, useState } from 'react'
import { Button, Tabs, Tab } from "@nextui-org/react";
import { RxCross2 } from 'react-icons/rx';
import Filter from './filter';
// import Customeradd from './AddCustomer';
import { Plus, UserRoundCog } from 'lucide-react';

import Addservices from './Add_services';
import { useSelector } from 'react-redux';
import { AppDispatch, IRootState } from '../../store';
import { useDispatch } from 'react-redux';
const tabs = [
    {
        id: 'add-services',
        label: 'Services'
    },
    {
        id: 'trash',
        label: 'Trash'
    },

]


export default function Manageservices() {
    const initialFilters = { name: "", status: "" };
    const dispatch: AppDispatch = useDispatch();
    const [filters, setFilters] = useState(initialFilters);
    const [activeTab, setActiveTab] = useState('add-services');
    const [refreshKey, setRefreshKey] = useState(0); // Add this line
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]));



    const removeFilter = (key: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: '', // Remove the specific filter by setting it to empty
        }));
    };

     const {  services  }: any = useSelector((state: IRootState) => state.customerConfig)

  

    const handleServiceAdded = () => {
        setRefreshKey(prev => prev + 1); // Add this function
    };

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-3 " >
                {/* Left Section: Title and Breadcrumbs */}
                <h1 className="text-2xl font-bold text-gray-800">Manage Services</h1>


                <div className="flex flex-wrap items-center justify-end gap-3">
                    {/* <Filter onFilterChange={setFilters} /> */}
                 
                        <Addservices onServiceAdded={handleServiceAdded} />
            
                </div >

            </div >
            <div className="flex flex-wrap gap-3 items-center mt-3">
                {Object.entries(filters)
                    .filter(([key, value]) => value) // Only show non-empty filters
                    .map(([key, value]) => {
                        // Convert role ID to role name
                        const displayValue = value;

                        return (
                            <Button key={key} className="yellow-color" onClick={() => removeFilter(key)}>
                                {displayValue} <RxCross2 />
                            </Button>
                        );
                    })}


                {Object.values(filters).some(value => value) && (
                    <h5
                        className="text-yellow cursor-pointer"
                        onClick={() => setFilters(initialFilters)} // Use dynamic initial state
                    >
                        Clear all filters
                    </h5>
                )}
            </div>

            <div className='Managepeople-Div grid gap-3' >

                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`whitespace-nowrap border-b-2 py-2 px-1 text-md font-medium transition-colors ${activeTab === tab.id
                                    ? 'border-[#F5A524] text-[#F5A524]'
                                    : 'border-transparent text-black-500 hover:border-black-500 hover:text-black-700'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>


                </div>



                <div className='User-table '>
                   

                </div>


            </div >

        </>

    )
}
