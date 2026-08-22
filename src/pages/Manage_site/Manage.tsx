import React, { useState } from 'react'
import { Button } from "@nextui-org/react";
import Filter from './filter';
import Customeradd from './AddCustomer';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SiteTrash from './sitetrash';
import Sitelist from './sitelist';
import { useSelector } from 'react-redux';
import { IRootState } from '../../store';

const tabs = [
    {
        id: 'add-Site',
        label: 'Add Site'
    },
    {
        id: 'trash',
        label: 'Trash'
    }
]

export default function Managepepople() {
    const [activeTab, setActiveTab] = useState('add-Site')
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]))
    const navigate = useNavigate();
    const handleClick = () => {
        navigate(`/add/site`);
    };
 
    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-3 p-4" >
              
                < div className="grid gap-3" >
                    <h1 className="text-2xl font-bold mb-6 text-gray-800">Manage Sites</h1>
                    {/* <h2 className="CRM-Page-Title">
                        Manage Sites
                    </h2>
                    <p className='CRM-Page-Sturcture'>Dashboard / HRM / <span className='CRM-Page-Name'> Manage Sites</span></p>
                    <div className="flex flex-wrap gap-3 items-center mt-3">

                    </div> */}
                </div >
                <div className="flex flex-wrap items-center justify-end gap-3">
                    {/* <Filter /> */}

              
                        <Button className="Insert-Button" onClick={handleClick}>
                            <Plus /> Add Site
                        </Button>
               

                    {/* {activeTab === 'customer' && checkPermission("managecustomer", "add") && (
                        <Customeradd />
                    )} */}
                </div>

            </div >


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

                {
                    activeTab === 'add-Site' ?
                        <div className='User-table '>
                            <Sitelist />
                        </div>
                        :
                        <div className='Role-table'>
                            <SiteTrash />
                        </div >
                }

            </div >

        </>

    )
}
