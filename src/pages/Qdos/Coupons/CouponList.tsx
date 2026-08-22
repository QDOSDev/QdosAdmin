import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import Swal from 'sweetalert2';
import { Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from '@nextui-org/react';
import Edit from '../../../../public/assets/APSIcon/Edit';
import Delete from '../../../../public/assets/APSIcon/delect';
import Tableempty from '../../Tableempty';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '../../../services/qdosApi';

const emptyForm = {
    code: '',
    description: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountValue: 0,
    minOrderValue: 0,
    maxDiscountAmount: 0,
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

    useEffect(() => {
        fetchList(1);
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
                                    <td className="px-4 py-3" colSpan={6}>
                                        <div className="w-full rounded h-5 bg-gray-200 animate-pulse" />
                                    </td>
                                </tr>
                            ))
                        ) : list.length === 0 ? (
                            <Tableempty length={6} />
                        ) : (
                            list.map((c: any) => (
                                <tr key={c._id} className="border-b last:border-b-0 hover:shadow-sm">
                                    <td className="px-4 py-3 font-medium">{c.code}</td>
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
                                        <label>Min Order Value</label>
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
