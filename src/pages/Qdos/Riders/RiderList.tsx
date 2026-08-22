import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import Swal from 'sweetalert2';
import Tableempty from '../../Tableempty';
import { getRiders, updateRiderStatus } from '../../../services/qdosApi';

const STATUS_OPTIONS = ['pending', 'approved', 'rejected', 'blocked'];

const statusColor = (status: string) => {
    if (status === 'approved') return 'bg-green-100 text-green-700';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
};

export default function RiderList() {
    const [list, setList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('pending');

    const fetchList = async (page = 1) => {
        setLoading(true);
        try {
            const res = await getRiders({ status: (statusFilter as any) || undefined, page, limit: 10 });
            setList(res?.riders || []);
            setCurrentPage(res?.currentPage || page);
            setTotalPages(res?.totalPages || 1);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to fetch riders.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchList(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter]);

    const handleApprove = (rider: any) => {
        Swal.fire({
            title: `Approve ${rider.name}?`,
            text: 'This makes them visible to delivery/ride matching immediately.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: getComputedStyle(document.documentElement).getPropertyValue('--yellow-color').trim(),
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, approve',
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                await updateRiderStatus(rider._id, 'approved');
                message.success('Rider approved.');
                fetchList(currentPage);
            } catch (error: any) {
                message.error(error?.response?.data?.message || 'Failed to approve rider.');
            }
        });
    };

    const handleReject = (rider: any) => {
        Swal.fire({
            title: `Reject ${rider.name}?`,
            input: 'text',
            inputLabel: 'Reason (optional)',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Reject',
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                await updateRiderStatus(rider._id, 'rejected', result.value || undefined);
                message.success('Rider rejected.');
                fetchList(currentPage);
            } catch (error: any) {
                message.error(error?.response?.data?.message || 'Failed to reject rider.');
            }
        });
    };

    const handleBlock = (rider: any) => {
        Swal.fire({
            title: `Block ${rider.name}?`,
            text: 'This forces them offline immediately.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, block',
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                await updateRiderStatus(rider._id, 'blocked');
                message.success('Rider blocked.');
                fetchList(currentPage);
            } catch (error: any) {
                message.error(error?.response?.data?.message || 'Failed to block rider.');
            }
        });
    };

    return (
        <div className="panel">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-lg font-semibold">Riders</h2>
                <select className="border border-gray-300 rounded-md px-3 py-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All statuses</option>
                    {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>
            </div>

            <div className="table-wrapper overflow-x-auto">
                <table className="data-table w-full">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Phone</th>
                            <th className="px-4 py-3 text-left">Vehicle</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Online</th>
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
                            list.map((r: any) => (
                                <tr key={r._id} className="border-b last:border-b-0 hover:shadow-sm">
                                    <td className="px-4 py-3">{r.name}</td>
                                    <td className="px-4 py-3">{r.phone}</td>
                                    <td className="px-4 py-3">
                                        {r.vehicle?.type} · {r.vehicle?.number}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusColor(r.status)}`}>{r.status}</span>
                                    </td>
                                    <td className="px-4 py-3">{r.isOnline ? 'Online' : 'Offline'}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-3">
                                            {r.status === 'pending' && (
                                                <>
                                                    <button className="text-xs underline text-green-600" onClick={() => handleApprove(r)}>
                                                        Approve
                                                    </button>
                                                    <button className="text-xs underline text-red-600" onClick={() => handleReject(r)}>
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {r.status === 'approved' && (
                                                <button className="text-xs underline text-red-600" onClick={() => handleBlock(r)}>
                                                    Block
                                                </button>
                                            )}
                                            {r.status === 'blocked' && (
                                                <button className="text-xs underline text-green-600" onClick={() => handleApprove(r)}>
                                                    Re-approve
                                                </button>
                                            )}
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
        </div>
    );
}
