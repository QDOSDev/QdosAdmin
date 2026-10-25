import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import Swal from 'sweetalert2';
import { Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from '@nextui-org/react';
import Edit from '../../../../public/assets/APSIcon/Edit';
import Delete from '../../../../public/assets/APSIcon/delect';
import Tableempty from '../../Tableempty';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, getRestaurants } from '../../../services/qdosApi';

const VEHICLE_TYPES = ['MOTO', 'AUTO', 'CAR_ECONOMY'] as const;

const emptyForm = {
    code: '',
    description: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountValue: 0,
    minOrderValue: 0,
    maxDiscountAmount: 0,
    appliesTo: 'ORDER' as 'ORDER' | 'RIDE',
    applicableVehicleTypes: [] as string[],
    applicableRestaurants: [] as string[],
    fundedBy: 'PLATFORM' as 'PLATFORM' | 'RESTAURANT' | 'SHARED',
    platformSharePercent: 50,
    usageLimit: 0,
    validFrom: '',
    validUntil: '',
    isActive: true,
};

export default function CouponList() {
    const [list, setList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [restaurants, setRestaurants] = useState<any[]>([]);

    const modal = useDisclosure();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState(emptyForm);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchList = async (page = 1) => {
        setLoading(true);
        try {
            const res = await getCoupons({ page, limit: 10 });
            setList(res?.coupons || []);
            setCurrentPage(res?.pagination?.page ?? res?.pagination?.currentPage ?? page);
            setTotalPages(res?.pagination?.totalPages ?? res?.pagination?.pages ?? 1);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to fetch coupons.');
        }
        setLoading(false);
    };

    const fetchRestaurants = async () => {
        try {
            const res = await getRestaurants({ limit: 10000 });
            setRestaurants(res?.restaurants || []);
        } catch {
            // non-critical -- the restaurant picker just falls back to "all restaurants" only
        }
    };

    useEffect(() => {
        fetchList(1);
        fetchRestaurants();
    }, []);

    const openCreateModal = () => {
        setEditingId(null);
        setFormData(emptyForm);
        modal.onOpen();
    };

    const openEditModal = (coupon: any) => {
        setEditingId(coupon._id);
        setFormData({
            code: coupon.code || '',
            description: coupon.description || '',
            discountType: coupon.discountType || 'PERCENTAGE',
            discountValue: coupon.discountValue || 0,
            minOrderValue: coupon.minOrderValue || 0,
            maxDiscountAmount: coupon.maxDiscountAmount || 0,
            appliesTo: coupon.appliesTo || 'ORDER',
            applicableVehicleTypes: coupon.applicableVehicleTypes || [],
            applicableRestaurants: (coupon.applicableRestaurants || []).map((r: any) => (typeof r === 'string' ? r : r._id)),
            fundedBy: coupon.fundedBy || 'PLATFORM',
            platformSharePercent: coupon.platformSharePercent ?? 50,
            usageLimit: coupon.usageLimit || 0,
            validFrom: coupon.validFrom ? coupon.validFrom.slice(0, 10) : '',
            validUntil: coupon.validUntil ? coupon.validUntil.slice(0, 10) : '',
            isActive: coupon.isActive ?? true,
        });
        modal.onOpen();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingId) {
                await updateCoupon(editingId, formData);
                message.success('Coupon updated.');
            } else {
                await createCoupon(formData);
                message.success('Coupon created.');
            }
            modal.onClose();
            fetchList(currentPage);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to save coupon.');
        }
        setIsSubmitting(false);
    };

    const handleDelete = (coupon: any) => {
        Swal.fire({
            title: 'Delete this coupon?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: getComputedStyle(document.documentElement).getPropertyValue('--yellow-color').trim(),
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                await deleteCoupon(coupon._id);
                message.success('Coupon deleted.');
                fetchList(currentPage);
            } catch (error: any) {
                message.error(error?.response?.data?.message || 'Failed to delete coupon.');
            }
        });
    };

    return (
        <div className="panel">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Coupons</h2>
                <button className="submit-btn" onClick={openCreateModal}>
                    + New Coupon
                </button>
            </div>

            <div className="table-wrapper overflow-x-auto">
                <table className="data-table w-full">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="px-4 py-3 text-left">Code</th>
                            <th className="px-4 py-3 text-left">Applies To</th>
                            <th className="px-4 py-3 text-left">Funded By</th>
                            <th className="px-4 py-3 text-left">Discount</th>
                            <th className="px-4 py-3 text-left">Min Order</th>
                            <th className="px-4 py-3 text-left">Valid Until</th>
                            <th className="px-4 py-3 text-left">Active</th>
                            <th className="px-4 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="border-b">
                                    <td className="px-4 py-3" colSpan={8}>
                                        <div className="w-full rounded h-5 bg-gray-200 animate-pulse" />
                                    </td>
                                </tr>
                            ))
                        ) : list.length === 0 ? (
                            <Tableempty length={8} />
                        ) : (
                            list.map((c: any) => (
                                <tr key={c._id} className="border-b last:border-b-0 hover:shadow-sm">
                                    <td className="px-4 py-3 font-medium">{c.code}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${c.appliesTo === 'RIDE' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {c.appliesTo === 'RIDE' ? 'Ride' : 'Order'}
                                        </span>
                                        {c.appliesTo === 'RIDE' && c.applicableVehicleTypes?.length > 0 && (
                                            <div className="text-xs text-gray-400 mt-1">{c.applicableVehicleTypes.join(', ')}</div>
                                        )}
                                        {c.appliesTo === 'ORDER' && c.applicableRestaurants?.length > 0 && (
                                            <div className="text-xs text-gray-400 mt-1">{c.applicableRestaurants.length} restaurant(s)</div>
                                        )}
                                        {c.appliesTo === 'ORDER' && (!c.applicableRestaurants || c.applicableRestaurants.length === 0) && (
                                            <div className="text-xs text-gray-400 mt-1">All restaurants</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {c.appliesTo === 'RIDE' ? (
                                            <span className="text-xs text-gray-400">Platform (wallet)</span>
                                        ) : (
                                            <>
                                                <span
                                                    className={`px-2 py-1 rounded-md text-xs font-medium ${
                                                        c.fundedBy === 'RESTAURANT' ? 'bg-blue-100 text-blue-700' : c.fundedBy === 'SHARED' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                                                    }`}
                                                >
                                                    {c.fundedBy === 'RESTAURANT' ? 'Restaurant' : c.fundedBy === 'SHARED' ? 'Shared' : 'Qdos'}
                                                </span>
                                                {c.fundedBy === 'SHARED' && <div className="text-xs text-gray-400 mt-1">{c.platformSharePercent}% Qdos</div>}
                                            </>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {c.discountValue}
                                        {c.discountType === 'PERCENTAGE' ? '%' : ''}
                                    </td>
                                    <td className="px-4 py-3">{c.minOrderValue || 0}</td>
                                    <td className="px-4 py-3">{c.validUntil ? new Date(c.validUntil).toLocaleDateString() : '-'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {c.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-3">
                                            <span className="cursor-pointer" onClick={() => openEditModal(c)}>
                                                <Edit className="h-5 w-5 text-gray-500" />
                                            </span>
                                            <span className="cursor-pointer" onClick={() => handleDelete(c)}>
                                                <Delete className="h-5 w-5 text-gray-500" />
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="pagination-container">
                <div className="pagination-controls">
                    <button className="pagination-button" disabled={currentPage <= 1} onClick={() => fetchList(currentPage - 1)}>
                        ‹ Prev
                    </button>
                    <span className="px-3 text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button className="pagination-button" disabled={currentPage >= totalPages} onClick={() => fetchList(currentPage + 1)}>
                        Next ›
                    </button>
                </div>
            </div>

            <Modal isOpen={modal.isOpen} onOpenChange={modal.onOpenChange} size="2xl">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>{editingId ? 'Edit Coupon' : 'New Coupon'}</ModalHeader>
                            <ModalBody>
                                <form className="grid grid-cols-2 gap-4 pb-4" onSubmit={handleSubmit}>
                                    <div className="input-field">
                                        <label>
                                            Code <span className="text-red-500">*</span>
                                        </label>
                                        <input required className="w-full border border-gray-300 rounded-md" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
                                    </div>
                                    <div className="input-field">
                                        <label>Discount Type</label>
                                        <select
                                            className="w-full border border-gray-300 rounded-md"
                                            value={formData.discountType}
                                            onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'PERCENTAGE' | 'FIXED' })}
                                        >
                                            <option value="PERCENTAGE">Percentage</option>
                                            <option value="FIXED">Fixed</option>
                                        </select>
                                    </div>
                                    <div className="input-field">
                                        <label>Applies To</label>
                                        <select
                                            className="w-full border border-gray-300 rounded-md"
                                            value={formData.appliesTo}
                                            onChange={(e) =>
                                                setFormData({ ...formData, appliesTo: e.target.value as 'ORDER' | 'RIDE', applicableVehicleTypes: [] })
                                            }
                                        >
                                            <option value="ORDER">Food Order</option>
                                            <option value="RIDE">Ride</option>
                                        </select>
                                    </div>
                                    {formData.appliesTo === 'RIDE' && (
                                        <div className="input-field col-span-2">
                                            <label>Vehicle Types (leave all unchecked = applies to every type)</label>
                                            <div className="flex gap-4 mt-1">
                                                {VEHICLE_TYPES.map((vt) => (
                                                    <label key={vt} className="flex items-center gap-1.5 text-sm font-normal">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.applicableVehicleTypes.includes(vt)}
                                                            onChange={(e) => {
                                                                const next = e.target.checked
                                                                    ? [...formData.applicableVehicleTypes, vt]
                                                                    : formData.applicableVehicleTypes.filter((v) => v !== vt);
                                                                setFormData({ ...formData, applicableVehicleTypes: next });
                                                            }}
                                                        />
                                                        {vt}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {formData.appliesTo === 'ORDER' && (
                                        <div className="input-field col-span-2">
                                            <label>Applicable Restaurants (leave all unchecked = applies to every restaurant)</label>
                                            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2 mt-1">
                                                {restaurants.length === 0 ? (
                                                    <span className="text-sm text-gray-400">No restaurants found.</span>
                                                ) : (
                                                    restaurants.map((r: any) => (
                                                        <label key={r._id} className="flex items-center gap-1.5 text-sm font-normal py-0.5">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.applicableRestaurants.includes(r._id)}
                                                                onChange={(e) => {
                                                                    const next = e.target.checked
                                                                        ? [...formData.applicableRestaurants, r._id]
                                                                        : formData.applicableRestaurants.filter((id) => id !== r._id);
                                                                    setFormData({ ...formData, applicableRestaurants: next });
                                                                }}
                                                            />
                                                            {r.restaurantName}
                                                        </label>
                                                    ))
                                                )}
                                            </div>
                                            {formData.applicableRestaurants.length > 0 && (
                                                <p className="text-xs text-gray-400 mt-1">{formData.applicableRestaurants.length} restaurant(s) selected — this coupon will only apply to these.</p>
                                            )}
                                        </div>
                                    )}
                                    {formData.appliesTo === 'ORDER' && (
                                        <div className="input-field col-span-2">
                                            <label>Funded By</label>
                                            <div className="flex flex-col gap-2 mt-1">
                                                {(
                                                    [
                                                        { value: 'PLATFORM', label: 'Qdos-funded', hint: 'Comes off admin commission, paid from the Qdos promo wallet. If the wallet can’t cover it, this coupon simply won’t apply — the restaurant is never charged for it.' },
                                                        { value: 'RESTAURANT', label: 'Restaurant-funded', hint: 'Comes off the restaurant’s own earnings for that order. No wallet involved — always applies.' },
                                                        { value: 'SHARED', label: 'Shared', hint: 'Split between the Qdos promo wallet and the restaurant’s earnings, by the percentage below.' },
                                                    ] as const
                                                ).map((opt) => (
                                                    <label key={opt.value} className="flex items-start gap-2 text-sm font-normal">
                                                        <input
                                                            type="radio"
                                                            name="fundedBy"
                                                            className="mt-1"
                                                            checked={formData.fundedBy === opt.value}
                                                            onChange={() => setFormData({ ...formData, fundedBy: opt.value })}
                                                        />
                                                        <span>
                                                            <span className="font-medium">{opt.label}</span>
                                                            <div className="text-xs text-gray-400">{opt.hint}</div>
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                            {formData.fundedBy === 'SHARED' && (
                                                <div className="mt-2">
                                                    <label>Platform Share (%)</label>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={100}
                                                        className="w-full border border-gray-300 rounded-md"
                                                        value={formData.platformSharePercent}
                                                        onChange={(e) => setFormData({ ...formData, platformSharePercent: Number(e.target.value) })}
                                                    />
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Platform wallet covers {formData.platformSharePercent}% of the discount; the restaurant covers the remaining {100 - formData.platformSharePercent}%.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className="input-field col-span-2">
                                        <label>
                                            Description <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            required
                                            className="w-full border border-gray-300 rounded-md"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>
                                            Discount Value <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            required
                                            type="number"
                                            className="w-full border border-gray-300 rounded-md"
                                            value={formData.discountValue}
                                            onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>{formData.appliesTo === 'RIDE' ? 'Minimum Fare' : 'Min Order Value'}</label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded-md"
                                            value={formData.minOrderValue}
                                            onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>Max Discount Amount</label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded-md"
                                            value={formData.maxDiscountAmount}
                                            onChange={(e) => setFormData({ ...formData, maxDiscountAmount: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>Usage Limit</label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded-md"
                                            value={formData.usageLimit}
                                            onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>
                                            Valid From <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            required
                                            type="date"
                                            className="w-full border border-gray-300 rounded-md"
                                            value={formData.validFrom}
                                            onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>
                                            Valid Until <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            required
                                            type="date"
                                            className="w-full border border-gray-300 rounded-md"
                                            value={formData.validUntil}
                                            onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                                        />
                                    </div>
                                    {editingId && (
                                        <div className="input-field flex items-center gap-2">
                                            <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                                            <label>Active</label>
                                        </div>
                                    )}
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
