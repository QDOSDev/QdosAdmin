import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import Swal from 'sweetalert2';
import { Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from '@nextui-org/react';
import Tableempty from '../../Tableempty';
import { getPayouts, completePayout, rejectPayout } from '../../../services/qdosApi';

const STATUS_OPTIONS = ['PENDING', 'COMPLETED', 'REJECTED'];

const statusColor = (status: string) => {
    if (status === 'COMPLETED') return 'bg-green-100 text-green-700';
    if (status === 'REJECTED') return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-700';
};

export default function PayoutList() {
    const [list, setList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalPayouts, setTotalPayouts] = useState(0);
    const [statusFilter, setStatusFilter] = useState('PENDING');

    const detailModal = useDisclosure();
    const [activePayout, setActivePayout] = useState<any>(null);

    const fetchList = async (page = 1) => {
        setLoading(true);
        try {
            const res = await getPayouts({ status: (statusFilter as any) || undefined, page, limit: 10 });
            setList(res?.payouts || []);
            setCurrentPage(res?.currentPage || page);
            setTotalPages(res?.totalPages || 1);
            setTotalPayouts(res?.totalPayouts || 0);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to fetch payouts.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchList(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter]);

    const openDetail = (payout: any) => {
        setActivePayout(payout);
        detailModal.onOpen();
    };

    const handleComplete = (payout: any) => {
        Swal.fire({
            title: `Mark ₹${payout.amount} to ${payout.riderId?.name || 'rider'} as paid?`,
            text: "Enter the bank transfer's UTR/reference number after you've actually sent the money.",
            icon: 'question',
            input: 'text',
            inputLabel: 'Transfer reference (UTR)',
            inputValidator: (value) => (!value ? 'A reference number is required' : undefined),
            showCancelButton: true,
            confirmButtonColor: getComputedStyle(document.documentElement).getPropertyValue('--yellow-color').trim(),
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Mark as paid',
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                await completePayout(payout._id, result.value);
                message.success('Payout marked as completed.');
                fetchList(currentPage);
            } catch (error: any) {
                message.error(error?.response?.data?.message || 'Failed to complete payout.');
            }
        });
    };

    const handleReject = (payout: any) => {
        Swal.fire({
            title: `Reject payout request for ${payout.riderId?.name || 'rider'}?`,
            text: `₹${payout.amount} will be refunded back to their available earnings.`,
            icon: 'warning',
            input: 'text',
            inputLabel: 'Reason',
            inputValidator: (value) => (!value ? 'A reason is required' : undefined),
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Reject',
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                await rejectPayout(payout._id, result.value);
                message.success('Payout rejected.');
                fetchList(currentPage);
            } catch (error: any) {
                message.error(error?.response?.data?.message || 'Failed to reject payout.');
            }
        });
    };

    return (
        <div className="panel">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Rider Payouts</h2>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
                <select className="border border-gray-300 rounded-md px-3 py-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All statuses</option>
                    {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>
                <span className="text-sm text-gray-500">{totalPayouts} total</span>
            </div>

            <div className="table-wrapper overflow-x-auto">
                <table className="data-table w-full">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="px-4 py-3 text-left">Rider</th>
                            <th className="px-4 py-3 text-left">Amount</th>
                            <th className="px-4 py-3 text-left">Bank</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Requested</th>
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
                            list.map((p: any) => (
                                <tr key={p._id} className="border-b last:border-b-0 hover:shadow-sm">
                                    <td className="px-4 py-3 font-medium">
                                        {p.riderId?.name || '-'}
                                        <div className="text-xs text-gray-400">{p.riderId?.phone}</div>
                                    </td>
                                    <td className="px-4 py-3">₹{p.amount}</td>
                                    <td className="px-4 py-3">
                                        {p.bankDetailsSnapshot?.bankName || '-'}
                                        <div className="text-xs text-gray-400">
                                            {p.bankDetailsSnapshot?.accountNumber ? `•••• ${String(p.bankDetailsSnapshot.accountNumber).slice(-4)}` : ''}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusColor(p.status)}`}>{p.status}</span>
                                    </td>
                                    <td className="px-4 py-3">{p.createdAt ? new Date(p.createdAt).toLocaleString() : '-'}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-3">
                                            <button className="text-xs underline text-blue-600" onClick={() => openDetail(p)}>
                                                View
                                            </button>
                                            {p.status === 'PENDING' && (
                                                <>
                                                    <button className="text-xs underline text-green-600" onClick={() => handleComplete(p)}>
                                                        Mark Paid
                                                    </button>
                                                    <button className="text-xs underline text-red-600" onClick={() => handleReject(p)}>
                                                        Reject
                                                    </button>
                                                </>
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

            <Modal isOpen={detailModal.isOpen} onOpenChange={detailModal.onOpenChange} size="lg">
                <ModalContent>
                    {() =>
                        activePayout && (
                            <>
                                <ModalHeader>Payout Request</ModalHeader>
                                <ModalBody>
                                    <div className="grid gap-3 pb-4 text-sm">
                                        <div className="flex justify-between">
                                            <span className="font-medium">₹{activePayout.amount}</span>
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusColor(activePayout.status)}`}>{activePayout.status}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 border-t pt-2">
                                            <div>
                                                <div className="text-gray-500">Rider</div>
                                                <div>{activePayout.riderId?.name || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Phone</div>
                                                <div>{activePayout.riderId?.phone || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Account Holder</div>
                                                <div>{activePayout.bankDetailsSnapshot?.accountHolderName || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Account Number</div>
                                                <div>{activePayout.bankDetailsSnapshot?.accountNumber || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">IFSC</div>
                                                <div>{activePayout.bankDetailsSnapshot?.ifscCode || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Bank</div>
                                                <div>{activePayout.bankDetailsSnapshot?.bankName || '-'}</div>
                                            </div>
                                            {activePayout.bankDetailsSnapshot?.upiId && (
                                                <div>
                                                    <div className="text-gray-500">UPI ID</div>
                                                    <div>{activePayout.bankDetailsSnapshot.upiId}</div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            Bank details shown above are frozen from when this payout was requested — they won't reflect any changes the rider has made since.
                                        </div>
                                        {activePayout.status === 'COMPLETED' && (
                                            <div className="border-t pt-2">
                                                <div className="text-gray-500">Reference</div>
                                                <div>{activePayout.referenceId}</div>
                                            </div>
                                        )}
                                        {activePayout.status === 'REJECTED' && (
                                            <div className="border-t pt-2">
                                                <div className="text-gray-500">Rejection Reason</div>
                                                <div>{activePayout.rejectionReason}</div>
                                            </div>
                                        )}
                                    </div>
                                </ModalBody>
                            </>
                        )
                    }
                </ModalContent>
            </Modal>
        </div>
    );
}
