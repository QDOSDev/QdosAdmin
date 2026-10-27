import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrderStats, getRestaurants, getRiders, getPayouts, getUsers, getPilotLive, getPilotApplications } from '../../services/qdosApi';

// Qdos admin home — live counts from the real APIs. Each figure loads on
// its own (allSettled), so one failing endpoint shows "—" instead of
// blanking the whole dashboard.

const ACTIVE_ORDER_STATUSES = ['PLACED', 'PREPARING', 'READY', 'ASSIGNED', 'OUT_FOR_DELIVERY'];

type Stats = {
    pendingRestaurants?: number;
    pendingRiders?: number;
    pendingPilots?: number;
    pendingPayouts?: number;
    totalOrders?: number;
    activeOrders?: number;
    deliveredOrders?: number;
    grossRevenue?: number;
    adminCommission?: number;
    customers?: number;
    approvedRiders?: number;
    pilot?: any;
};

const settled = <T,>(r: PromiseSettledResult<T>): T | undefined => (r.status === 'fulfilled' ? r.value : undefined);
const show = (v?: number, prefix = '') => (v === undefined || v === null ? '—' : `${prefix}${Number(v).toLocaleString('en-IN')}`);

function Card({ title, value, to, accent = 'text-gray-800', hint, testId }: { title: string; value: string; to?: string; accent?: string; hint?: string; testId: string }) {
    const body = (
        <div className="bg-white rounded-lg p-5 shadow-sm border h-full hover:shadow-md transition-shadow">
            <p className="text-gray-500 text-sm mb-2">{title}</p>
            <p className={`text-3xl font-bold ${accent}`} data-testid={testId}>
                {value}
            </p>
            {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
        </div>
    );
    return to ? <Link to={to}>{body}</Link> : body;
}

export default function Dashboard() {
    const [stats, setStats] = useState<Stats>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const [orders, pRest, pRiders, pPilots, pPayouts, customers, approved, pilot] = await Promise.allSettled([
                getOrderStats(),
                getRestaurants({ status: 'pending', limit: 1 }),
                getRiders({ status: 'pending', limit: 1 }),
                getPilotApplications({ status: 'pending', limit: 1 }),
                getPayouts({ status: 'PENDING' as any, limit: 1 }),
                getUsers({ role: 'user', limit: 1 }),
                getRiders({ status: 'approved', limit: 1 }),
                getPilotLive(),
            ]);
            const o = settled(orders)?.data;
            setStats({
                pendingRestaurants: settled(pRest)?.data?.pagination?.total,
                pendingRiders: settled(pRiders)?.totalRiders,
                pendingPilots: settled(pPilots)?.data?.counts?.pending,
                pendingPayouts: settled(pPayouts)?.totalPayouts,
                totalOrders: o?.totalOrders,
                activeOrders: o ? ACTIVE_ORDER_STATUSES.reduce((sum, s) => sum + (o.byStatus?.[s] || 0), 0) : undefined,
                deliveredOrders: o?.revenue?.deliveredOrders,
                grossRevenue: o?.revenue?.grossRevenue,
                adminCommission: o?.revenue?.adminCommission,
                customers: settled(customers)?.totalUsers,
                approvedRiders: settled(approved)?.totalRiders,
                pilot: settled(pilot)?.data?.counts,
            });
            setLoading(false);
        })();
    }, []);

    const v = (n?: number, prefix = '') => (loading ? '…' : show(n, prefix));
    const pc = stats.pilot || {};

    return (
        <div className="grid gap-6">
            <div className="panel">
                <h2 className="text-lg font-semibold">Qdos Dashboard</h2>
                <p className="text-sm text-gray-500">Food delivery, rides, parcels and Hire a Pilot — at a glance.</p>
            </div>

            <div>
                <h3 className="font-semibold mb-3">Needs attention</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card title="Restaurants awaiting approval" value={v(stats.pendingRestaurants)} to="/qdos/restaurants" accent="text-yellow-600" testId="dash-pending-restaurants" />
                    <Card title="Riders awaiting approval" value={v(stats.pendingRiders)} to="/qdos/riders" accent="text-yellow-600" testId="dash-pending-riders" />
                    <Card title="Pilots awaiting approval" value={v(stats.pendingPilots)} to="/qdos/pilot-approvals" accent="text-yellow-600" hint="Hire a Pilot drivers" testId="dash-pending-pilots" />
                    <Card title="Withdrawal requests" value={v(stats.pendingPayouts)} to="/qdos/payouts" accent="text-orange-600" hint="Pending rider payouts" testId="dash-pending-payouts" />
                </div>
            </div>

            <div>
                <h3 className="font-semibold mb-3">Food orders</h3>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <Card title="Total orders" value={v(stats.totalOrders)} to="/qdos/orders" testId="dash-total-orders" />
                    <Card title="In progress" value={v(stats.activeOrders)} to="/qdos/orders" accent="text-blue-600" testId="dash-active-orders" />
                    <Card title="Delivered" value={v(stats.deliveredOrders)} accent="text-green-600" testId="dash-delivered" />
                    <Card title="Gross revenue" value={v(stats.grossRevenue, '₹')} hint="Delivered orders" testId="dash-revenue" />
                    <Card title="Qdos commission" value={v(stats.adminCommission, '₹')} hint="From delivered orders" accent="text-green-700" testId="dash-commission" />
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Hire a Pilot — right now</h3>
                    <Link to="/qdos/pilot-live" className="text-sm underline text-blue-600">
                        Open live view
                    </Link>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <Card title="Searching for a pilot" value={v(pc.searching)} to="/qdos/pilot-live" accent="text-yellow-600" testId="dash-pilot-searching" />
                    <Card title="On trip" value={v(pc.onTrip)} to="/qdos/pilot-live" accent="text-blue-600" testId="dash-pilot-ontrip" />
                    <Card title="Upcoming scheduled" value={v(pc.upcoming)} to="/qdos/pilot-live" testId="dash-pilot-upcoming" />
                    <Card title="Pilots online" value={v(pc.pilotsOnline)} to="/qdos/pilot-live" testId="dash-pilot-online" />
                    <Card title="Pilots free" value={v(pc.pilotsFree)} to="/qdos/pilot-live" accent="text-green-600" testId="dash-pilot-free" />
                </div>
            </div>

            <div>
                <h3 className="font-semibold mb-3">People</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card title="Customers" value={v(stats.customers)} to="/qdos/users" testId="dash-customers" />
                    <Card title="Approved riders" value={v(stats.approvedRiders)} to="/qdos/riders" testId="dash-approved-riders" />
                </div>
            </div>
        </div>
    );
}
