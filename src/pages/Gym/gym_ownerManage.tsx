import React, { useEffect, useState } from 'react';
import { Button } from '@nextui-org/react';
import { RxCross2 } from 'react-icons/rx';
import { Badge } from 'antd';
import Filter from './filter';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, IRootState } from '../../store';
import PendingGymList from './gym_ownerPending';
import ApprovedGymList from './gym_ownerApproved';
import RejectedGymList from './gym_ownerRejected';
import { fetchGym, GymownerGymList } from '../../store/customerConfigSlice';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Default } from 'react-toastify/dist/utils';
import DefaultLayout from '../../components/Layouts/DefaultLayout';

export default function ManageServices() {
    const initialFilters = {
        name: '',
        email: '',
        phone: '',
        pan: '',
        license_no: '',
        address: '',
        status: '',
    };
    const dispatch: AppDispatch = useDispatch();
    const [filters, setFilters] = useState(initialFilters);
    const [activeTab, setActiveTab] = useState('pendinggym');
    const [refreshKey, setRefreshKey] = useState(0);
    const GymOwnergymCounts = useSelector((state: IRootState) => state.customerConfig.GymOwnergymCounts);
    const navigate = useNavigate()

    const removeFilter = (key: string) => {
        setFilters((prev) => ({ ...prev, [key]: '' }));
    };

    useEffect(() => {
        dispatch(GymownerGymList({ status: 'pending' }));
    }, [dispatch]);

    const clearAllFilters = () => {
        setFilters(initialFilters);
    };

    const handleServiceAdded = () => {
        setRefreshKey((prev) => prev + 1);
    };

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'pendinggym':
                return <PendingGymList key={refreshKey} filters={filters} />;
            case 'approvedgym':
                return <ApprovedGymList key={refreshKey} filters={filters} />;
            case 'rejectedgym':
                return <RejectedGymList key={refreshKey} filters={filters} />;
            default:
                return null;
        }
    };

    const handleNavigate=()=>{
        navigate('/addGym')
    }

    return (

  
        <>
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="grid gap-1">
                    <h2 className="CRM-Page-Title">Gym</h2>
                    <p className="CRM-Page-Structure">
                        Dashboard / <span className="CRM-Page-Name">Gym</span>
                    </p>

                    {Object.entries(filters).some(([_, val]) => val) && (
                        <div className="flex flex-wrap gap-3 items-center mt-3">
                            {Object.entries(filters).map(([key, value]) =>
                                value ? (
                                    <Button key={key} className="yellow-color" onClick={() => removeFilter(key)}>
                                        {`${value}`} <RxCross2 />
                                    </Button>
                                ) : null
                            )}
                            <h5 className="text-yellow cursor-pointer" onClick={clearAllFilters}>
                                Clear all filters
                            </h5>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3">
                    <Filter onSearch={(filters) => setFilters(filters)} filterValues={filters} key={JSON.stringify(filters)} />
                    <Button className="Insert-Button" onPress={handleNavigate}><Plus/>Add Gym</Button>
                </div>
            </div>

            <div className="Managepeople-Div grid gap-3">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-12">
                        <button
                            onClick={() => setActiveTab('pendinggym')}
                            className={`whitespace-nowrap border-b-2 py-2 px-3 text-md font-medium transition-colors ${
                                activeTab === 'pendinggym' ? 'border-[#F5A524] text-[#F5A524]' : 'border-transparent text-black-500 hover:border-black-500 hover:text-black-700'
                            }`}
                        >
                            <Badge count={GymOwnergymCounts.pending} style={{ marginTop: '6px', right: '-15px' }}>
                                Pending
                            </Badge>
                        </button>

                        <button
                            onClick={() => setActiveTab('approvedgym')}
                            className={`whitespace-nowrap border-b-2 py-2 px-3 text-md font-medium transition-colors ${
                                activeTab === 'approvedgym' ? 'border-[#F5A524] text-[#F5A524]' : 'border-transparent text-black-500 hover:border-black-500 hover:text-black-700'
                            }`}
                        >
                            <Badge count={GymOwnergymCounts.approved} style={{ marginTop: '6px', right: '-15px' }}>
                                Approved
                            </Badge>
                        </button>

                        <button
                            onClick={() => setActiveTab('rejectedgym')}
                            className={`whitespace-nowrap border-b-2 py-2 px-3 text-md font-medium transition-colors ${
                                activeTab === 'rejectedgym' ? 'border-[#F5A524] text-[#F5A524]' : 'border-transparent text-black-500 hover:border-black-500 hover:text-black-700'
                            }`}
                        >
                            <Badge count={GymOwnergymCounts.rejected} style={{ marginTop: '6px', right: '-15px' }}>
                                Rejected
                            </Badge>
                        </button>
                    </nav>
                </div>

                <div className="User-table">{renderActiveTab()}</div>
            </div>
        </>

    );
}
