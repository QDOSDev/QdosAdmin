import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import { Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from '@nextui-org/react';
import Edit from '../../../../public/assets/APSIcon/Edit';
import Tableempty from '../../Tableempty';
import { getRideFarePlans, upsertRideFarePlan } from '../../../services/qdosApi';

const VEHICLE_TYPES = ['MOTO', 'AUTO', 'CAR_ECONOMY'];

const emptyForm = {
    vehicleType: 'MOTO',
    city: '',
    baseFare: 0,
    perKmRate: 0,
    perMinuteRate: 0,
    minimumFare: 0,
    bookingFee: 0,
    maxSurgeMultiplier: 2,
    isActive: true,
};

export default function RideFareList() {
    const [list, setList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const modal = useDisclosure();
    const [formData, setFormData] = useState(emptyForm);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchList = async () => {
        setLoading(true);
        try {
            const res = await getRideFarePlans();
            setList(res?.data || []);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to fetch ride fare plans.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchList();
    }, []);

    const openCreateModal = () => {
        setFormData(emptyForm);
        modal.onOpen();
    };

    const openEditModal = (plan: any) => {
        setFormData({
            vehicleType: plan.vehicleType,
            city: plan.city || '',
            baseFare: plan.baseFare || 0,
            perKmRate: plan.perKmRate || 0,
            perMinuteRate: plan.perMinuteRate || 0,
            minimumFare: plan.minimumFare || 0,
            bookingFee: plan.bookingFee || 0,
            maxSurgeMultiplier: plan.maxSurgeMultiplier || 2,
            isActive: plan.isActive ?? true,
        });
        modal.onOpen();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await upsertRideFarePlan({ ...formData, city: formData.city || null });
            message.success('Ride fare plan saved.');
            modal.onClose();
            fetchList();
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to save ride fare plan.');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="panel">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Ride Fare Plans</h2>
                <button className="submit-btn" onClick={openCreateModal}>
                    + New / Upsert Plan
                </button>
            </div>

            <div className="table-wrapper overflow-x-auto">
                <table className="data-table w-full">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="px-4 py-3 text-left">Vehicle</th>
                            <th className="px-4 py-3 text-left">City</th>
                            <th className="px-4 py-3 text-left">Base Fare</th>
                            <th className="px-4 py-3 text-left">Per Km</th>
                            <th className="px-4 py-3 text-left">Per Min</th>
                            <th className="px-4 py-3 text-left">Min Fare</th>
                            <th className="px-4 py-3 text-left">Active</th>
                            <th className="px-4 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <tr key={i} className="border-b">
                                    <td className="px-4 py-3" colSpan={8}>
                                        <div className="w-full rounded h-5 bg-gray-200 animate-pulse" />
                                    </td>
                                </tr>
                            ))
                        ) : list.length === 0 ? (
                            <Tableempty length={8} />
                        ) : (
                            list.map((p: any) => (
                                <tr key={p._id} className="border-b last:border-b-0 hover:shadow-sm">
                                    <td className="px-4 py-3 font-medium">{p.vehicleType}</td>
                                    <td className="px-4 py-3">{p.city || 'Global default'}</td>
                                    <td className="px-4 py-3">{p.baseFare}</td>
                                    <td className="px-4 py-3">{p.perKmRate}</td>
                                    <td className="px-4 py-3">{p.perMinuteRate}</td>
                                    <td className="px-4 py-3">{p.minimumFare}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {p.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="cursor-pointer" onClick={() => openEditModal(p)}>
                                            <Edit className="h-5 w-5 text-gray-500" />
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={modal.isOpen} onOpenChange={modal.onOpenChange} size="2xl">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Upsert Ride Fare Plan</ModalHeader>
                            <ModalBody>
                                <form className="grid grid-cols-2 gap-4 pb-4" onSubmit={handleSubmit}>
                                    <div className="input-field">
                                        <label>
                                            Vehicle Type <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            required
                                            className="w-full border border-gray-300 rounded-md"
                                            value={formData.vehicleType}
                                            onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                                        >
                                            {VEHICLE_TYPES.map((v) => (
                                                <option key={v} value={v}>
                                                    {v}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="input-field">
                                        <label>City (blank = global default)</label>
                                        <input className="w-full border border-gray-300 rounded-md" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                                    </div>
                                    <div className="input-field">
                                        <label>Base Fare</label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded-md"
                                            value={formData.baseFare}
                                            onChange={(e) => setFormData({ ...formData, baseFare: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>Per Km Rate</label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded-md"
                                            value={formData.perKmRate}
                                            onChange={(e) => setFormData({ ...formData, perKmRate: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>Per Minute Rate</label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded-md"
                                            value={formData.perMinuteRate}
                                            onChange={(e) => setFormData({ ...formData, perMinuteRate: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>Minimum Fare</label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded-md"
                                            value={formData.minimumFare}
                                            onChange={(e) => setFormData({ ...formData, minimumFare: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>Booking Fee</label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded-md"
                                            value={formData.bookingFee}
                                            onChange={(e) => setFormData({ ...formData, bookingFee: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>Max Surge Multiplier</label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded-md"
                                            value={formData.maxSurgeMultiplier}
                                            onChange={(e) => setFormData({ ...formData, maxSurgeMultiplier: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="input-field flex items-center gap-2">
                                        <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                                        <label>Active</label>
                                    </div>
                                    <div className="flex justify-start gap-2 mt-2 col-span-2">
                                        <button type="button" className="Close-btn" onClick={onClose}>
                                            Cancel
                                        </button>
                                        <button disabled={isSubmitting} className="submit-btn" type="submit">
                                            {isSubmitting ? 'Wait...' : 'Save'}
                                        </button>
                                    </div>
                                </form>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
