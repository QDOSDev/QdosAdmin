import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import Tableempty from '../../Tableempty';
import { getAdminPayments, getAdminRefunds, retryPilotRefund, PaymentRecordStatus } from '../../../services/qdosApi';

const PAGE_SIZE = 20;

const PAYMENT_STATUS: Record<string, { label: string; cls: string }> = {
    SUCCESS: { label: 'Paid', cls: 'bg-green-100 text-green-700' },
    REFUNDED: { label: 'Refunded', cls: 'bg-blue-50 text-blue-700' },
    FAILED: { label: 'Failed', cls: 'bg-red-50 text-red-600' },
    CANCELLED: { label: 'Cancelled', cls: 'bg-gray-100 text-gray-600' },
    PENDING: { label: 'Pending', cls: 'bg-yellow-50 text-yellow-700' },
    CREATED: { label: 'Started', cls: 'bg-gray-100 text-gray-500' },
};

const REFUND_STATUS: Record<string, { label: string; cls: string }> = {
    REFUNDED: { label: 'Refunded', cls: 'bg-green-100 text-green-700' },
    FAILED: { label: 'Failed', cls: 'bg-red-50 text-red-600' },
    PENDING: { label: 'Pending', cls: 'bg-yellow-50 text-yellow-700' },
};

const TYPE_LABEL: Record<string, string> = { ORDER: 'Food order', PILOT_BOOKING: 'Hire a Pilot' };

const inr = (n?: number) => `₹${(n || 0).toLocaleString('en-IN')}`;
const dt = (d?: string | null) => (d ? new Date(d).toLocaleString([], { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');

function Badge({ map, status }: { map: Record<string, { label: string; cls: string }>; status: string }) {
    const s = map[status] || { label: status, cls: 'bg-gray-100 text-gray-600' };
    return <span className={`px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap ${s.cls}`}>{s.label}</span>;
}

function Pager({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
    if (totalPages <= 1) return null;
    return (
        <div className="flex items-center gap-3 mt-4 text-sm">
            <button className="px-3 py-1.5 border rounded-md disabled:opacity-40" disabled={page <= 1} onClick={() => onChange(page - 1)}>
                ‹ Prev
            </button>
            <span>
                Page {page} of {totalPages}
            </span>
            <button className="px-3 py-1.5 border rounded-md disabled:opacity-40" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
                Next ›
            </button>
        </div>
    );
}

export default function PaymentsRefunds() {
    const [tab, setTab] = useState<'payments' | 'refunds'>('payments');
    const [search, setSearch] = useState('');
    const [debounced, setDebounced] = useState('');
    const [type, setType] = useState<'' | 'ORDER' | 'PILOT_BOOKING'>('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [rows, setRows] = useState<any[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [summary, setSummary] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [retrying, setRetrying] = useState<string | null>(null);

    useEffect(() => {
        const t = setTimeout(() => setDebounced(search.trim()), 350);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        setPage(1);
    }, [tab, debounced, type, status]);

    const load = async () => {
        setLoading(true);
        try {
            if (tab === 'payments') {
                const res = await getAdminPayments({ status: (status || undefined) as PaymentRecordStatus | undefined, paymentFor: type || undefined, search: debounced || undefined, page, limit: PAGE_SIZE });
                setRows(res?.data?.payments || []);
                setSummary(res?.data?.byStatus || {});
                setTotalPages(res?.data?.totalPages || 1);
            } else {
                const res = await getAdminRefunds({ status: (status || undefined) as any, type: type || undefined, search: debounced || undefined, page, limit: PAGE_SIZE });
                setRows(res?.data?.refunds || []);
                setSummary(res?.data?.summary || {});
                setTotalPages(res?.data?.totalPages || 1);
            }
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to load.');
        }
        setLoading(false);
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, debounced, type, status, page]);

    const retry = async (r: any) => {
        setRetrying(r._id);
        try {
            await retryPilotRefund(r.referenceId);
            message.success(`Refund retried for ${r.referenceNo}.`);
            load();
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Refund retry failed.');
        }
        setRetrying(null);
    };

    const cards =
        tab === 'payments'
            ? [
                  { label: 'Paid', value: inr(summary.SUCCESS?.amount), sub: `${summary.SUCCESS?.count || 0} payments` },
                  { label: 'Refunded', value: inr(summary.REFUNDED?.amount), sub: `${summary.REFUNDED?.count || 0} payments` },
                  { label: 'Failed', value: `${summary.FAILED?.count || 0}`, sub: 'payments' },
              ]
            : [
                  { label: 'Refunded', value: inr(summary.refunded?.amount), sub: `${summary.refunded?.count || 0} refunds` },
                  { label: 'Failed — needs retry', value: inr(summary.failed?.amount), sub: `${summary.failed?.count || 0} refunds`, warn: (summary.failed?.count || 0) > 0 },
                  { label: 'Pending', value: inr(summary.pending?.amount), sub: `${summary.pending?.count || 0} refunds` },
              ];

    return (
        <div className="panel">
            <div className="mb-4">
                <h2 className="text-lg font-semibold">Payments &amp; Refunds</h2>
                <p className="text-sm text-gray-500 mt-1">Customers' online payments for food orders and Hire a Pilot. Customers see the same data in the app under Manage Payments and Your Refunds.</p>
            </div>

            <div className="inline-flex rounded-md border border-gray-300 overflow-hidden mb-4">
                {(['payments', 'refunds'] as const).map((t) => (
                    <button
                        key={t}
                        data-testid={`pr-tab-${t}`}
                        className={`px-4 py-2 text-sm font-medium ${tab === t ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'}`}
                        onClick={() => {
                            setStatus('');
                            setTab(t);
                        }}
                    >
                        {t === 'payments' ? 'Payments' : 'Refunds'}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {cards.map((c) => (
                    <div key={c.label} className={`rounded-lg border p-4 ${c.warn ? 'border-red-200 bg-red-50/50' : 'border-gray-200'}`}>
                        <div className="text-xs text-gray-500">{c.label}</div>
                        <div className="text-xl font-semibold mt-1">{c.value}</div>
                        <div className="text-xs text-gray-400">{c.sub}</div>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                <input
                    className="border border-gray-300 rounded-md text-sm py-1.5 px-3 min-w-[260px]"
                    placeholder="Search order/booking no, phone, Razorpay id"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    data-testid="pr-search"
                />
                <select className="border border-gray-300 rounded-md text-sm py-1.5" value={type} onChange={(e) => setType(e.target.value as any)}>
                    <option value="">Food orders &amp; pilot</option>
                    <option value="ORDER">Food orders</option>
                    <option value="PILOT_BOOKING">Hire a Pilot</option>
                </select>
                <select className="border border-gray-300 rounded-md text-sm py-1.5" value={status} onChange={(e) => setStatus(e.target.value)} data-testid="pr-status">
                    <option value="">All statuses</option>
                    {Object.entries(tab === 'payments' ? PAYMENT_STATUS : REFUND_STATUS).map(([k, v]) => (
                        <option key={k} value={k}>
                            {v.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="table-wrapper overflow-x-auto">
                <table className="data-table w-full">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="px-4 py-3 text-left">For</th>
                            <th className="px-4 py-3 text-left">Customer</th>
                            <th className="px-4 py-3 text-left">Amount</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            {tab === 'payments' ? (
                                <>
                                    <th className="px-4 py-3 text-left">Method</th>
                                    <th className="px-4 py-3 text-left">Razorpay</th>
                                    <th className="px-4 py-3 text-left">Date</th>
                                </>
                            ) : (
                                <>
                                    <th className="px-4 py-3 text-left">Refund ref / reason</th>
                                    <th className="px-4 py-3 text-left">Date</th>
                                    <th className="px-4 py-3 text-left">Action</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(4)].map((_, i) => (
                                <tr key={i} className="border-b">
                                    <td colSpan={7} className="px-4 py-3">
                                        <div className="h-5 rounded bg-gray-200 animate-pulse" />
                                    </td>
                                </tr>
                            ))
                        ) : rows.length === 0 ? (
                            <Tableempty length={7} />
                        ) : (
                            rows.map((r) => (
                                <tr key={r._id} className="border-b last:border-b-0" data-testid={`pr-row-${r.referenceNo || r._id}`}>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{r.referenceNo || '—'}</div>
                                        <div className="text-xs text-gray-500">{r.title || TYPE_LABEL[r.type]}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div>{r.user?.name || '—'}</div>
                                        <div className="text-xs text-gray-500">{r.user?.phone}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {inr(r.amount)}
                                        {tab === 'refunds' && r.paidAmount && r.paidAmount !== r.amount ? <div className="text-xs text-gray-400">of {inr(r.paidAmount)} paid</div> : null}
                                        {tab === 'payments' && r.refundAmount ? <div className="text-xs text-blue-600">{inr(r.refundAmount)} refunded</div> : null}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge map={tab === 'payments' ? PAYMENT_STATUS : REFUND_STATUS} status={r.status} />
                                        {tab === 'payments' && r.status === 'FAILED' && r.failureReason && <div className="text-xs text-red-500 mt-1 max-w-[180px]">{r.failureReason}</div>}
                                    </td>
                                    {tab === 'payments' ? (
                                        <>
                                            <td className="px-4 py-3">{r.method || '—'}</td>
                                            <td className="px-4 py-3 text-xs text-gray-500">{r.razorpayPaymentId || r.razorpayOrderId || '—'}</td>
                                            <td className="px-4 py-3 text-xs">{dt(r.paidAt || r.createdAt)}</td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-4 py-3 text-xs max-w-[220px]">
                                                {r.refundId || <span className={r.status === 'FAILED' ? 'text-red-500' : 'text-gray-500'}>{r.failureReason || '—'}</span>}
                                            </td>
                                            <td className="px-4 py-3 text-xs">{dt(r.refundedAt || r.initiatedAt)}</td>
                                            <td className="px-4 py-3">
                                                {r.status === 'FAILED' && r.type === 'PILOT_BOOKING' ? (
                                                    <button className="submit-btn !py-1 !px-3 text-xs" disabled={retrying === r._id} onClick={() => retry(r)} data-testid="pr-retry">
                                                        {retrying === r._id ? 'Retrying…' : 'Retry refund'}
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-300">—</span>
                                                )}
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <Pager page={page} totalPages={totalPages} onChange={setPage} />
        </div>
    );
}
