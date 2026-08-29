import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import Swal from 'sweetalert2';
import { Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from '@nextui-org/react';
import ViewIcon from '../../../../public/assets/APSIcon/View';
import Tableempty from '../../Tableempty';
import { getRiders, getRiderById, updateRiderStatus } from '../../../services/qdosApi';

const STATUS_OPTIONS = ['pending', 'approved', 'rejected', 'blocked'];

const statusDotColor = (status: string) => {
    if (status === 'approved') return 'bg-green-500';
    if (status === 'pending') return 'bg-yellow-500';
    return 'bg-red-500';
};

export default function RiderList() {
    const [list, setList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');

    const viewModal = useDisclosure();
    const [activeRider, setActiveRider] = useState<any>(null);
    const [detailLoading, setDetailLoading] = useState(false);

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

    const STATUS_COPY: Record<string, { title: string; text?: string; confirmColor: string; confirmText: string }> = {
        approved: {
            title: 'Approve',
            text: 'This makes them visible to delivery/ride matching immediately.',
            confirmColor: getComputedStyle(document.documentElement).getPropertyValue('--yellow-color').trim(),
            confirmText: 'Yes, approve',
        },
        pending: {
            title: 'Set back to pending',
            text: 'They will disappear from delivery/ride matching until re-approved.',
            confirmColor: '#6b7280',
            confirmText: 'Yes, set pending',
        },
        rejected: { title: 'Reject', confirmColor: '#d33', confirmText: 'Reject' },
        blocked: { title: 'Block', text: 'This forces them offline immediately.', confirmColor: '#d33', confirmText: 'Yes, block' },
    };

    const handleStatusChange = (rider: any, newStatus: string) => {
        if (newStatus === rider.status) return;
        const copy = STATUS_COPY[newStatus];

        Swal.fire({
            title: `${copy.title} ${rider.name}?`,
            text: copy.text,
            icon: newStatus === 'approved' ? 'question' : 'warning',
            input: newStatus === 'rejected' ? 'text' : undefined,
            inputLabel: newStatus === 'rejected' ? 'Reason (optional)' : undefined,
            showCancelButton: true,
            confirmButtonColor: copy.confirmColor,
            cancelButtonColor: '#6b7280',
            confirmButtonText: copy.confirmText,
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                await updateRiderStatus(rider._id, newStatus as any, newStatus === 'rejected' ? result.value || undefined : undefined);
                message.success('Rider status updated.');
                fetchList(currentPage);
            } catch (error: any) {
                message.error(error?.response?.data?.message || 'Failed to update rider status.');
            }
        });
    };

    const openViewModal = async (rider: any) => {
        viewModal.onOpen();
        setDetailLoading(true);
        try {
            const res = await getRiderById(rider._id);
            setActiveRider(res?.data || rider);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to fetch rider details.');
            setActiveRider(rider);
        }
        setDetailLoading(false);
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
                                        <div className="flex items-center gap-2">
                                            <span className={`h-2 w-2 rounded-full ${statusDotColor(r.status)}`} />
                                            <select className="border border-gray-300 rounded-md px-2 py-1 text-sm" value={r.status} onChange={(e) => handleStatusChange(r, e.target.value)}>
                                                {STATUS_OPTIONS.map((s) => (
                                                    <option key={s} value={s}>
                                                        {s}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">{r.isOnline ? 'Online' : 'Offline'}</td>
                                    <td className="px-4 py-3">
                                        <span className="cursor-pointer" onClick={() => openViewModal(r)}>
                                            <ViewIcon className="h-5 w-5 text-gray-500" />
                                        </span>
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

            {/* View modal — GET /admin/riders/:riderId, full detail */}
            <Modal isOpen={viewModal.isOpen} onOpenChange={viewModal.onOpenChange} size="3xl" scrollBehavior="inside">
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader>{activeRider?.name}</ModalHeader>
                            <ModalBody>
                                {detailLoading ? (
                                    <div className="py-8 text-center text-gray-500">Loading...</div>
                                ) : (
                                    <div className="grid gap-5 pb-4 text-sm">
                                        <div>
                                            <div className="font-medium mb-1">Basic Info</div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-gray-600">
                                                <Field label="Phone" value={activeRider?.phone} />
                                                <Field label="Email" value={activeRider?.email} />
                                                <Field label="Status" value={activeRider?.status} />
                                                <Field label="Online" value={activeRider?.isOnline ? 'Yes' : 'No'} />
                                                <Field label="Busy" value={activeRider?.isBusy ? 'Yes' : 'No'} />
                                                <Field label="Availability" value={activeRider?.availability} />
                                                <Field label="Joined" value={activeRider?.createdAt ? new Date(activeRider.createdAt).toLocaleString() : undefined} />
                                                <Field label="Updated" value={activeRider?.updatedAt ? new Date(activeRider.updatedAt).toLocaleString() : undefined} />
                                            </div>
                                        </div>

                                        <div className="border-t pt-3">
                                            <div className="font-medium mb-1">Vehicle &amp; Services</div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-gray-600">
                                                <Field label="Vehicle Type" value={activeRider?.vehicle?.type} />
                                                <Field label="Vehicle Number" value={activeRider?.vehicle?.number} />
                                                <Field label="Vehicle Model" value={activeRider?.vehicle?.model} />
                                                <Field label="Delivery" value={activeRider?.services?.delivery ? 'Yes' : 'No'} />
                                                <Field label="Cab" value={activeRider?.services?.cab ? 'Yes' : 'No'} />
                                            </div>
                                        </div>

                                        <div className="border-t pt-3">
                                            <div className="font-medium mb-1">Location</div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-gray-600">
                                                <Field label="Coordinates" value={activeRider?.location?.coordinates ? activeRider.location.coordinates.join(', ') : undefined} />
                                                <Field
                                                    label="Last Updated"
                                                    value={activeRider?.location?.lastUpdated ? new Date(activeRider.location.lastUpdated).toLocaleString() : undefined}
                                                />
                                            </div>
                                        </div>

                                        <div className="border-t pt-3">
                                            <div className="font-medium mb-1">Wallet, Earnings &amp; Rating</div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-gray-600">
                                                <Field label="Wallet Balance" value={activeRider?.wallet?.balance !== undefined ? `₹${activeRider.wallet.balance}` : undefined} />
                                                <Field label="Total Earnings" value={activeRider?.earnings?.total !== undefined ? `₹${activeRider.earnings.total}` : undefined} />
                                                <Field label="Available" value={activeRider?.earnings?.available !== undefined ? `₹${activeRider.earnings.available}` : undefined} />
                                                <Field label="Withdrawn" value={activeRider?.earnings?.withdrawn !== undefined ? `₹${activeRider.earnings.withdrawn}` : undefined} />
                                                <Field label="Pending" value={activeRider?.earnings?.pending !== undefined ? `₹${activeRider.earnings.pending}` : undefined} />
                                                <Field
                                                    label="Rating"
                                                    value={activeRider?.rating?.average !== undefined ? `${activeRider.rating.average} (${activeRider.rating.count || 0} ratings)` : undefined}
                                                />
                                            </div>
                                        </div>

                                        <div className="border-t pt-3">
                                            <div className="font-medium mb-1">Stats</div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-gray-600">
                                                <Field label="Total Orders" value={activeRider?.stats?.totalOrders} />
                                                <Field label="Completed Orders" value={activeRider?.stats?.completedOrders} />
                                                <Field label="Cancelled Orders" value={activeRider?.stats?.cancelledOrders} />
                                                <Field label="Total Rides" value={activeRider?.stats?.totalRides} />
                                            </div>
                                        </div>

                                        <div className="border-t pt-3">
                                            <div className="font-medium mb-1">Documents</div>
                                            <div className="flex flex-wrap gap-2">
                                                {['aadharCard', 'drivingLicense', 'rc', 'vehiclePhoto']
                                                    .filter((key) => activeRider?.documents?.[key]?.url)
                                                    .map((key) => (
                                                        <a
                                                            key={key}
                                                            href={activeRider.documents[key].url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="px-3 py-1 rounded-md text-xs font-medium bg-gray-100 text-blue-700 underline hover:bg-gray-200"
                                                        >
                                                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}
                                                        </a>
                                                    ))}
                                                {!['aadharCard', 'drivingLicense', 'rc', 'vehiclePhoto'].some((key) => activeRider?.documents?.[key]?.url) && (
                                                    <span className="text-gray-500">No documents on file.</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <div>
            <div className="text-gray-400 text-xs">{label}</div>
            <div>{value === undefined || value === null || value === '' ? '-' : value}</div>
        </div>
    );
}
