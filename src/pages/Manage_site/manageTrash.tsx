import React, { useState } from 'react'
import { Button } from "@nextui-org/react";
import Filter from '../Filters/filter';
import Customeradd from './AddCustomer';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomerTrash from './customertrash';
import Customer from './Customerlist';
import { useSelector } from 'react-redux';
import { IRootState } from '../../store';
const tabs = [
    {
        id: 'customer',
        label: 'Customer'
    },
    {
        id: 'trash',
        label: 'Trash'
    }
]

export default function ManageTrash() {
    const [activeTab, setActiveTab] = useState('customer')
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]))
    const navigate = useNavigate();

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-3" >

                < div className="grid gap-3" >
                    <h1 className="text-2xl font-bold mb-6 text-gray-800">Manage Customer</h1>
                    {/* <h2 className="CRM-Page-Title">
                        Trash Bin
                    </h2>
                    <p className='CRM-Page-Sturcture'>Dashboard / <span className='CRM-Page-Name'>Trash Bin</span></p>
                    <div className="flex flex-wrap gap-3 items-center mt-3">

                    </div> */}
                </div >

                <div className="flex flex-wrap items-center justify-end gap-3">
                
                        <Customeradd />
              
                    {/* <Filter /> */}


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
                    activeTab === 'customer' ?
                        <div className=''>
                            <Customer />
                        </div>
                        :
                        <div className='Role-table'>
                            <CustomerTrash />
                        </div >
                }

            </div >

        </>

    )
}
