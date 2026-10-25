import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { message } from 'antd';
import Swal from 'sweetalert2';
import { Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from '@nextui-org/react';
import Tableempty from '../../Tableempty';
import { getPilotBookings, getPilotBookingById, cancelPilotBooking, retryPilotRefund } from '../../../services/qdosApi';

const STATUS_OPTIONS = ['SEARCHING', 'ACCEPTED', 'ARRIVED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'PAYMENT_PENDING'];
const FINISHED = ['COMPLETED', 'CANCELLED', 'EXPIRED'];

const statusColor = (status: string) => {
    if (status === 'COMPLETED') return 'bg-green-100 text-green-700';
    if (status === 'CANCELLED' || status === 'EXPIRED') return 'bg-red-100 text-red-700';
    if (status === 'ONGOING') return 'bg-blue-100 text-blue-700';
    if (status === 'PAYMENT_PENDING') return 'bg-gray-100 text-gray-600';
    return 'bg-yellow-100 text-yellow-700';
};

const refundColor = (status?: string) => {
    if (status === 'REFUNDED') return 'text-green-700';
    if (status === 'FAILED') return 'text-red-600';
    return 'text-gray-500';
};

const label = (v?: string) => (v ? v.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : '-');
const fmt = (d?: string) => (d ? new Date(d).toLocaleString() : '-');

const EMPTY_SUMMARY = { completed: 0, collectedOnline: 0, platformRevenue: 0, adminCommission: 0, platformFees: 0, pilotEarnings: 0, extraCollectedInCash: 0 };

function Field({ label: l, value }: { label: string; value: any }) {
    return (
        <div>
            <div className="text-gray-500">{l}</div>
            <div className="text-gray-800 break-words">{value === undefined || value === null || value === '' ? '-' : value}</div>
        </div>
    );
}

export default function PilotBookings() {
    const [list, setList] = useState<any[]>([]);
    const [summary, setSummary] = useState(EMPTY_SUMMARY);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [searchParams] = useSearchParams();
    const [statusFilter, setStatusFilter] = useState('');
    // ?search=PLT-1006 — opened from the Pilot Live page's "Details" link
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const detailModal = useDisclosure();
    const [active, setActive] = useState<any>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const fetchList = async (page = 1) => {
        setLoading(true);
        try {
            const res = await getPilotBookings({
                status: statusFilter || undefined,
                search: search.trim() || undefined,
                startDate: startDate || undefined,
                // inclusive end of the picked day
                endDate: endDate ? `${endDate}T23:59:59.999` : undefined,
                page,
                limit: 10,
            });
            const data = res?.data || {};
            setList(data.bookings || []);
            setSummary({ ...EMPTY_SUMMARY, ...(data.summary || {}) });
            setCurrentPage(data.currentPage || page);
            setTotalPages(data.totalPages || 1);
            setTotal(data.total || 0);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to fetch pilot bookings.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchList(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, startDate, endDate]);

    const openDetail = async (b: any) => {
        detailModal.onOpen();
        setActive(b);
        setDetailLoading(true);
        try {
            const res = await getPilotBookingById(b._id);
            setActive(res?.data || b);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to fetch booking.');
        }
        setDetailLoading(false);
    };

    const refreshDetail = async (bookingId: string) => {
        try {
            const res = await getPilotBookingById(bookingId);
            setActive(res?.data || null);
        } catch {
            /* list refresh below still shows the new state */
        }
    };

    const handleCancel = (b: any) => {
        const paid = b.payment?.status === 'PAID';
        const totalPaid = b.pricing?.total || 0;
        Swal.fire({
            title: `Cancel ${b.bookingNumber}?`,
            html: paid
                ? `The customer paid <b>₹${totalPaid}</b>. Enter how much to refund (full refund by default).${b.pilotId ? '<br/>The assigned pilot will be released.' : ''}`
                : 'This booking was never paid — nothing will be refunded.',
            icon: 'warning',
            input: paid ? 'number' : undefined,
            inputValue: paid ? String(totalPaid) : undefined,
            inputAttributes: paid ? { min: '0', max: String(totalPaid), step: '1' } : undefined,
            inputValidator: paid
                ? (value: string) => {
                      const n = Number(value);
                      if (value === '' || Number.isNaN(n) || n < 0 || n > totalPaid) return `Enter an amount between 0 and ${totalPaid}`;
                      return undefined;
                  }
                : undefined,
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Cancel booking',
            cancelButtonText: 'Keep it',
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            const { value: reason, isConfirmed } = await Swal.fire({
                title: 'Reason',
                input: 'text',
                inputPlaceholder: 'Shown to the customer',
                showCancelButton: true,
                confirmButtonText: 'Confirm',
            });
            if (!isConfirmed) return;
            try {
                const res = await cancelPilotBooking(b._id, { reason: reason || undefined, ...(paid && { refundAmount: Number(result.value) }) });
                const refund = res?.data?.refund;
                if (refund?.status === 'FAILED') {
                    message.warning(`Booking cancelled, but the refund failed: ${refund.failureReason || 'unknown error'}. Use "Retry refund".`);
                } else {
                    message.success(paid && Number(result.value) > 0 ? `Booking cancelled — ₹${result.value} refunded.` : 'Booking cancelled.');
                }
                fetchList(currentPage);
                if (active?._id === b._id) refreshDetail(b._id);
            } catch (error: any) {
                message.error(error?.response?.data?.message || 'Failed to cancel booking.');
            }
        });
    };

    const handleRetryRefund = async (b: any) => {
        try {
            const res = await retryPilotRefund(b._id);
            const refund = res?.data?.refund;
            if (refund?.status === 'REFUNDED') message.success(`₹${refund.amount} refunded.`);
            else message.warning(`Refund still failing: ${refund?.failureReason || 'unknown error'}`);
            fetchList(currentPage);
            if (active?._id === b._id) refreshDetail(b._id);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to retry refund.');
        }
    };

    const SummaryCard = ({ title, value, hint, testId }: { title: string; value: string; hint?: string; testId: string }) => (
        <div className="border rounded-lg p-4 bg-white">
            <div className="text-xs text-gray-500">{title}</div>
            <div className="text-xl font-semibold mt-1" data-testid={testId}>
                {value}
            </div>
            {hint && <div className="text-xs text-gray-400 mt-1">{hint}</div>}
        </div>
    );

    return (
        <div className="panel">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-lg font-semibold">Hire a Pilot — Bookings</h2>
                <span className="text-sm text-gray-500">{total} total</span>
            </div>

            {/* totals for COMPLETED bookings matching the current filters */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
                <SummaryCard title="Completed trips" value={String(summary.completed)} testId="sum-completed" />
                <SummaryCard title="Collected online" value={`₹${summary.collectedOnline}`} testId="sum-collected" />
                <SummaryCard
                    title="Platform revenue"
                    value={`₹${summary.platformRevenue}`}
                    hint={`₹${summary.adminCommission} commission + ₹${summary.platformFees} fees`}
                    testId="sum-revenue"
                />
                <SummaryCard title="Paid to pilots" value={`₹${summary.pilotEarnings}`} hint="credited to their payout" testId="sum-pilots" />
                <SummaryCard title="Extra time (cash)" value={`₹${summary.extraCollectedInCash}`} hint="collected by pilots" testId="sum-extra" />
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
                <select className="border border-gray-300 rounded-md px-3 py-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} data-testid="filter-status">
                    <option value="">All statuses</option>
                    {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                            {label(s)}
                        </option>
                    ))}
                </select>
                <input
                    className="border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Booking no. (PLT-…)"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchList(1)}
                    data-testid="filter-search"
                />
                <button className="btn btn-outline-primary" onClick={() => fetchList(1)} data-testid="filter-apply">
                    Search
                </button>
                <input type="date" className="border border-gray-300 rounded-md px-3 py-2" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <span className="text-gray-400">to</span>
                <input type="date" className="border border-gray-300 rounded-md px-3 py-2" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <div className="table-wrapper overflow-x-auto">
                <table className="data-table w-full">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="px-4 py-3 text-left">Booking</th>
                            <th className="px-4 py-3 text-left">Customer</th>
                            <th className="px-4 py-3 text-left">Pilot</th>
                            <th className="px-4 py-3 text-left">Package</th>
                            <th className="px-4 py-3 text-left">Pickup time</th>
                            <th className="px-4 py-3 text-left">Paid</th>
                            <th className="px-4 py-3 text-left">Status</th>
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
                            list.map((b) => (
                                <tr key={b._id} className="border-b last:border-b-0 hover:shadow-sm" data-testid={`booking-row-${b.bookingNumber}`}>
                                    <td className="px-4 py-3 font-medium">
                                        {b.bookingNumber}
                                        <div className="text-xs text-gray-400">{fmt(b.createdAt)}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {b.userId?.name || '-'}
                                        <div className="text-xs text-gray-400">{b.userId?.phone}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {b.pilotId?.name || <span className="text-gray-400">Not assigned</span>}
                                        <div className="text-xs text-gray-400">{b.pilotId?.phone}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {b.pricing?.packageName || `${b.pricing?.hours} Hrs`}
                                        <div className="text-xs text-gray-400">
                                            {label(b.tripType)} · {label(b.transmission)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {b.pickupType === 'NOW' ? 'Now' : fmt(b.scheduledAt)}
                                    </td>
                                    <td className="px-4 py-3">
                                        ₹{b.pricing?.total ?? '-'}
                                        {b.refund?.status && b.refund.status !== 'NONE' && (
                                            <div className={`text-xs ${refundColor(b.refund.status)}`}>
                                                refund {label(b.refund.status)} ₹{b.refund.amount}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusColor(b.status)}`} data-testid="booking-status">
                                            {label(b.status)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-3">
                                            <button className="text-xs underline text-blue-600" onClick={() => openDetail(b)} data-testid="booking-view">
                                                View
                                            </button>
                                            {!FINISHED.includes(b.status) && (
                                                <button className="text-xs underline text-red-600" onClick={() => handleCancel(b)} data-testid="booking-cancel">
                                                    Cancel
                                                </button>
                                            )}
                                            {b.refund?.status === 'FAILED' && (
                                                <button className="text-xs underline text-orange-600" onClick={() => handleRetryRefund(b)} data-testid="booking-retry-refund">
                                                    Retry refund
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

            <Modal isOpen={detailModal.isOpen} onOpenChange={detailModal.onOpenChange} size="3xl" scrollBehavior="inside">
                <ModalContent>
                    {() =>
                        active && (
                            <>
                                <ModalHeader>
                                    <div className="flex items-center gap-3">
                                        {active.bookingNumber}
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusColor(active.status)}`} data-testid="detail-status">
                                            {label(active.status)}
                                        </span>
                                    </div>
                                </ModalHeader>
                                <ModalBody>
                                    {detailLoading ? (
                                        <div className="py-8 text-center text-gray-500">Loading...</div>
                                    ) : (
                                        <div className="grid gap-5 pb-4 text-sm" data-testid="booking-detail">
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                <Field label="Customer" value={active.userId ? `${active.userId.name || '-'} · ${active.userId.phone}` : '-'} />
                                                <Field label="Pilot" value={active.pilotId ? `${active.pilotId.name} · ${active.pilotId.phone}` : 'Not assigned'} />
                                                <Field label="Pilot drives" value={active.pilotId?.pilotProfile?.transmissions?.map(label).join(', ')} />
                                                <Field label="Trip" value={`${label(active.tripType)} · ${label(active.transmission)}`} />
                                                <Field label="Pickup" value={active.pickupType === 'NOW' ? 'Now' : fmt(active.scheduledAt)} />
                                                <Field label="Car" value={[active.car?.model, active.car?.number].filter(Boolean).join(' · ')} />
                                                <Field label="Pickup address" value={active.pickup?.address} />
                                                {active.tripType === 'ONE_WAY' && <Field label="Drop address" value={active.drop?.address} />}
                                                <Field label="Notes" value={active.notes} />
                                            </div>

                                            <div className="border-t pt-3">
                                                <div className="font-medium mb-2">Money</div>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    <Field label="Package" value={`${active.pricing?.packageName} — ₹${active.pricing?.packagePrice}`} />
                                                    <Field label="Surcharges" value={`₹${(active.pricing?.tripTypeSurcharge || 0) + (active.pricing?.transmissionSurcharge || 0)}`} />
                                                    <Field label="Platform fee" value={`₹${active.pricing?.platformFee ?? 0}`} />
                                                    <Field label="Customer paid (online)" value={<b>₹{active.pricing?.total}</b>} />
                                                    <Field label={`Admin commission (${active.pricing?.commissionPercentage}%)`} value={`₹${active.pricing?.adminCommission}`} />
                                                    <Field label="Pilot earning" value={<span className="text-green-700 font-medium">₹{active.pricing?.pilotEarning}</span>} />
                                                    <Field label="Extra rate" value={`₹${active.pricing?.extraPerHour}/hr`} />
                                                    <Field label="Payment" value={`${label(active.payment?.status)}${active.payment?.razorpayPaymentId ? ` · ${active.payment.razorpayPaymentId}` : ''}`} />
                                                    {active.status === 'ONGOING' && active.meter && (
                                                        <Field
                                                            label="Live meter (at open)"
                                                            value={`${active.meter.durationMinutes} of ${active.meter.includedMinutes} min used${active.meter.extraMinutes ? ` · EXTRA ${active.meter.extraMinutes} min · ₹${active.meter.extraCharge}` : ''}`}
                                                        />
                                                    )}
                                                    {active.status === 'COMPLETED' && (
                                                        <Field
                                                            label="Extra time (cash to pilot)"
                                                            value={`${active.extraTime?.extraMinutes || 0} min · ₹${active.extraTime?.extraCharge || 0} (trip ${active.extraTime?.durationMinutes || 0} min)`}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {active.refund?.status && active.refund.status !== 'NONE' && (
                                                <div className="border-t pt-3">
                                                    <div className="font-medium mb-2">Refund</div>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                        <Field label="Status" value={<span className={refundColor(active.refund.status)}>{label(active.refund.status)}</span>} />
                                                        <Field label="Amount" value={`₹${active.refund.amount}`} />
                                                        <Field label="Razorpay refund id" value={active.refund.refundId} />
                                                        {active.refund.failureReason && <Field label="Failure reason" value={active.refund.failureReason} />}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="border-t pt-3">
                                                <div className="font-medium mb-2">Timeline</div>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    <Field label="Booked" value={fmt(active.createdAt)} />
                                                    <Field label="Paid" value={fmt(active.paidAt)} />
                                                    <Field label="Request expires" value={fmt(active.expiresAt)} />
                                                    <Field label="Accepted" value={fmt(active.acceptedAt)} />
                                                    <Field label="Arrived" value={fmt(active.arrivedAt)} />
                                                    <Field label="Started" value={fmt(active.startedAt)} />
                                                    <Field label="Completed" value={fmt(active.completedAt)} />
                                                    {(active.cancelledAt || active.expiredAt) && (
                                                        <Field
                                                            label={active.status === 'EXPIRED' ? 'Expired' : `Cancelled by ${label(active.cancelledBy)}`}
                                                            value={`${fmt(active.cancelledAt || active.expiredAt)}${active.cancelReason ? ` — ${active.cancelReason}` : ''}`}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-3 border-t pt-3">
                                                {active.refund?.status === 'FAILED' && (
                                                    <button className="btn btn-outline-warning" onClick={() => handleRetryRefund(active)}>
                                                        Retry refund
                                                    </button>
                                                )}
                                                {!FINISHED.includes(active.status) && (
                                                    <button className="btn btn-outline-danger" onClick={() => handleCancel(active)}>
                                                        Cancel booking
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </ModalBody>
                            </>
                        )
                    }
                </ModalContent>
            </Modal>
        </div>
    );
}
