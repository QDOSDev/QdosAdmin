import React, { useEffect, useRef, useState } from 'react';
import { message } from 'antd';
import { Link } from 'react-router-dom';
import { getPilotLive } from '../../../services/qdosApi';

const REFRESH_MS = 15000;

const pad = (n: number) => String(n).padStart(2, '0');

// 3725000 -> "1h 02m 05s"
const fmtDuration = (ms: number) => {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return h > 0 ? `${h}h ${pad(m)}m ${pad(s)}s` : `${m}m ${pad(s)}s`;
};

const ago = (ms: number) => {
    if (ms < 60000) return `${Math.max(0, Math.floor(ms / 1000))}s ago`;
    if (ms < 3600000) return `${Math.floor(ms / 60000)}m ago`;
    return `${Math.floor(ms / 3600000)}h ago`;
};

const label = (v?: string) => (v ? v.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : '-');

// same billing rule as the backend's computeExtraTime: per started minute
// past the package (+ grace), at extraPerHour / 60
const liveMeter = (b: any, nowMs: number) => {
    const startedAt = new Date(b.startedAt).getTime();
    const elapsedMs = Math.max(0, nowMs - startedAt);
    const includedMinutes = Math.round((b.pricing?.hours || 0) * 60);
    const durationMinutes = Math.ceil(elapsedMs / 60000);
    const extraMinutes = Math.max(0, durationMinutes - includedMinutes - (b.pricing?.extraGraceMinutes || 0));
    const extraCharge = Math.round((extraMinutes * (b.pricing?.extraPerHour || 0)) / 60);
    const packageLeftMs = includedMinutes * 60000 - elapsedMs;
    return { elapsedMs, includedMinutes, extraMinutes, extraCharge, packageLeftMs, progress: includedMinutes ? Math.min(1, elapsedMs / (includedMinutes * 60000)) : 0 };
};

const STAGE: Record<string, { text: string; color: string }> = {
    SEARCHING: { text: 'Searching pilot', color: 'bg-yellow-100 text-yellow-700' },
    ACCEPTED_NOW: { text: 'Heading to pickup', color: 'bg-indigo-100 text-indigo-700' },
    ACCEPTED_SCHEDULED: { text: 'Upcoming (scheduled)', color: 'bg-gray-100 text-gray-700' },
    ARRIVED: { text: 'Waiting at pickup', color: 'bg-purple-100 text-purple-700' },
    ONGOING: { text: 'On trip', color: 'bg-blue-100 text-blue-700' },
};

const stageOf = (b: any) => (b.status === 'ACCEPTED' ? STAGE[b.pickupType === 'SCHEDULED' ? 'ACCEPTED_SCHEDULED' : 'ACCEPTED_NOW'] : STAGE[b.status]) || { text: label(b.status), color: 'bg-gray-100' };

export default function PilotLive() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastFetched, setLastFetched] = useState<number>(0);
    // serverTime - local clock, so timers stay right even if this PC's clock is off
    const clockOffset = useRef(0);
    const [, setTick] = useState(0);

    const fetchLive = async (showSpinner = false) => {
        if (showSpinner) setLoading(true);
        try {
            const res = await getPilotLive();
            const d = res?.data;
            if (d?.serverTime) clockOffset.current = new Date(d.serverTime).getTime() - Date.now();
            setData(d);
            setLastFetched(Date.now());
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to load live pilot data.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLive(true);
    }, []);

    useEffect(() => {
        if (!autoRefresh) return;
        const id = setInterval(() => fetchLive(), REFRESH_MS);
        return () => clearInterval(id);
    }, [autoRefresh]);

    // 1s tick for the timers
    useEffect(() => {
        const id = setInterval(() => setTick((t) => t + 1), 1000);
        return () => clearInterval(id);
    }, []);

    const nowMs = Date.now() + clockOffset.current;
    const bookings: any[] = data?.bookings || [];
    const pilots: any[] = data?.pilots || [];
    const counts = data?.counts || {};


    const freePilots = pilots.filter((p) => !p.isOnPilotJob);

    const timerCell = (b: any) => {
        if (b.status === 'ONGOING' && b.startedAt) {
            const m = liveMeter(b, nowMs);
            const inExtra = m.packageLeftMs <= 0;
            return (
                <div className="min-w-[200px]" data-testid="live-timer">
                    <div className="font-mono font-semibold" data-testid="live-elapsed">
                        {fmtDuration(m.elapsedMs)}
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded mt-1 mb-1 overflow-hidden">
                        <div className={`h-full ${inExtra ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.round(m.progress * 100)}%` }} />
                    </div>
                    {inExtra ? (
                        <div className="text-xs font-medium text-red-600" data-testid="live-extra">
                            EXTRA {m.extraMinutes} min · ₹{m.extraCharge} (cash to pilot)
                        </div>
                    ) : (
                        <div className="text-xs text-gray-500" data-testid="live-left">
                            {fmtDuration(m.packageLeftMs)} left of {b.pricing?.hours} h package
                        </div>
                    )}
                </div>
            );
        }
        if (b.status === 'ARRIVED' && b.arrivedAt) {
            return <div className="font-mono text-sm">waiting {fmtDuration(nowMs - new Date(b.arrivedAt).getTime())}</div>;
        }
        if (b.status === 'ACCEPTED') {
            if (b.pickupType === 'SCHEDULED') {
                const inMs = new Date(b.scheduledAt).getTime() - nowMs;
                return <div className="font-mono text-sm">{inMs > 0 ? `pickup in ${fmtDuration(inMs)}` : `pickup was ${fmtDuration(-inMs)} ago`}</div>;
            }
            return <div className="font-mono text-sm">accepted {fmtDuration(nowMs - new Date(b.acceptedAt).getTime())} ago</div>;
        }
        if (b.status === 'SEARCHING') {
            const left = new Date(b.expiresAt).getTime() - nowMs;
            return (
                <div className="font-mono text-sm" data-testid="live-expires">
                    {left > 0 ? `expires in ${fmtDuration(left)}` : 'expiring…'}
                </div>
            );
        }
        return '-';
    };

    // no live position on purpose — Hire a Pilot isn't a tracking feature,
    // admin sees who the pilot is and whether they're online, not where
    const pilotCell = (p: any) => {
        if (!p) return <span className="text-gray-400">Not assigned</span>;
        return (
            <>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-gray-400">{p.phone}</div>
                <div className="text-xs text-gray-500">{p.isOnline ? '● online' : '○ offline'}</div>
            </>
        );
    };

    // trip started or not, and when
    const startCell = (b: any) => {
        if (b.status === 'ONGOING' && b.startedAt) return <span className="text-green-700 font-medium">Started {new Date(b.startedAt).toLocaleTimeString()}</span>;
        if (b.status === 'ARRIVED') return <span className="text-purple-700">Pilot at pickup — not started</span>;
        if (b.status === 'ACCEPTED') return <span className="text-gray-600">Not started</span>;
        return <span className="text-gray-400">No pilot yet</span>;
    };

    const Stat = ({ title, value, color, testId }: { title: string; value: number; color: string; testId: string }) => (
        <div className="border rounded-lg p-3 bg-white">
            <div className="text-xs text-gray-500">{title}</div>
            <div className={`text-2xl font-semibold ${color}`} data-testid={testId}>
                {value ?? 0}
            </div>
        </div>
    );

    return (
        <div className="grid gap-5">
            <div className="panel">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                        <h2 className="text-lg font-semibold">Hire a Pilot — Live</h2>
                        <div className="text-xs text-gray-500">
                            {lastFetched ? `Updated ${ago(Date.now() - lastFetched)}` : 'Loading…'} · timers tick live · no driver tracking
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
                            Auto-refresh (15s)
                        </label>
                        <button className="btn btn-outline-primary btn-sm" onClick={() => fetchLive()} data-testid="live-refresh">
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                    <Stat title="Searching" value={counts.searching} color="text-yellow-600" testId="count-searching" />
                    <Stat title="Heading to pickup" value={counts.headingToPickup} color="text-indigo-600" testId="count-heading" />
                    <Stat title="Waiting at pickup" value={counts.atPickup} color="text-purple-600" testId="count-atpickup" />
                    <Stat title="On trip" value={counts.onTrip} color="text-blue-600" testId="count-ontrip" />
                    <Stat title="Upcoming scheduled" value={counts.upcoming} color="text-gray-700" testId="count-upcoming" />
                    <Stat title="Pilots online" value={counts.pilotsOnline} color="text-gray-800" testId="count-online" />
                    <Stat title="Pilots busy" value={counts.pilotsBusy} color="text-orange-600" testId="count-busy" />
                    <Stat title="Pilots free" value={counts.pilotsFree} color="text-green-600" testId="count-free" />
                </div>
            </div>

            <div className="panel">
                <h3 className="font-semibold mb-3">Live bookings ({bookings.length})</h3>
                <div className="table-wrapper overflow-x-auto">
                    <table className="data-table w-full">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="px-4 py-3 text-left">Booking</th>
                                <th className="px-4 py-3 text-left">Stage</th>
                                <th className="px-4 py-3 text-left">Timer</th>
                                <th className="px-4 py-3 text-left">Pilot</th>
                                <th className="px-4 py-3 text-left">Customer</th>
                                <th className="px-4 py-3 text-left">Trip started</th>
                                <th className="px-4 py-3 text-left">Pickup → Drop</th>
                                <th className="px-4 py-3 text-left">Car</th>
                                <th className="px-4 py-3 text-left"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(3)].map((_, i) => (
                                    <tr key={i} className="border-b">
                                        <td className="px-4 py-3" colSpan={9}>
                                            <div className="w-full rounded h-5 bg-gray-200 animate-pulse" />
                                        </td>
                                    </tr>
                                ))
                            ) : bookings.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                                        Nothing live right now.
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((b) => (
                                    <tr key={b._id} className="border-b last:border-b-0 align-top" data-testid={`live-row-${b.bookingNumber}`}>
                                        <td className="px-4 py-3 font-medium">
                                            {b.bookingNumber}
                                            <div className="text-xs text-gray-400">
                                                {b.pricing?.packageName} · {label(b.tripType)} · {label(b.transmission)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap ${stageOf(b).color}`} data-testid="live-stage">
                                                {stageOf(b).text}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{timerCell(b)}</td>
                                        <td className="px-4 py-3">{pilotCell(b.pilotId)}</td>
                                        <td className="px-4 py-3">
                                            {b.userId?.name || '-'}
                                            <div className="text-xs text-gray-400">{b.userId?.phone}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm" data-testid="live-started">
                                            {startCell(b)}
                                        </td>
                                        <td className="px-4 py-3 max-w-[280px] text-sm" data-testid="live-route">
                                            <div className="break-words">
                                                <span className="text-green-700">●</span> {b.pickup?.address || '-'}
                                            </div>
                                            <div className="break-words text-gray-600">
                                                <span className="text-red-600">●</span>{' '}
                                                {b.tripType === 'ONE_WAY' ? b.drop?.address || '-' : 'Round trip — back to pickup'}
                                            </div>
                                            {b.pickupType === 'SCHEDULED' && <div className="text-xs text-gray-400">for {new Date(b.scheduledAt).toLocaleString()}</div>}
                                        </td>
                                        <td className="px-4 py-3 text-sm">{[b.car?.model, b.car?.number].filter(Boolean).join(' · ') || '-'}</td>
                                        <td className="px-4 py-3">
                                            <Link className="text-xs underline text-blue-600" to={`/qdos/pilot-bookings?search=${encodeURIComponent(b.bookingNumber)}`}>
                                                Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="panel">
                <h3 className="font-semibold mb-3">Pilots online / on a job ({pilots.length})</h3>
                <div className="table-wrapper overflow-x-auto">
                    <table className="data-table w-full">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="px-4 py-3 text-left">Pilot</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Drives</th>
                                <th className="px-4 py-3 text-left">Next scheduled job</th>
                                <th className="px-4 py-3 text-left">Trips done</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!loading && pilots.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                        No pilots online.
                                    </td>
                                </tr>
                            ) : (
                                [...pilots.filter((p) => p.isOnPilotJob), ...freePilots].map((p) => (
                                    <tr key={p._id} className="border-b last:border-b-0" data-testid={`live-pilot-${p.phone}`}>
                                        <td className="px-4 py-3">{pilotCell(p)}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`px-2 py-1 rounded-md text-xs font-medium ${p.isOnPilotJob ? 'bg-orange-100 text-orange-700' : p.isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                                                data-testid="live-pilot-status"
                                            >
                                                {p.isOnPilotJob ? 'On a job' : p.isBusy ? 'Busy (ride/delivery)' : p.isOnline ? 'Free' : 'Offline'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{p.pilotProfile?.transmissions?.map(label).join(', ') || '-'}</td>
                                        <td className="px-4 py-3 text-sm">
                                            {p.nextBooking ? (
                                                <>
                                                    {p.nextBooking.bookingNumber}
                                                    <div className="text-xs text-gray-400">{new Date(p.nextBooking.scheduledAt).toLocaleString()}</div>
                                                </>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                        <td className="px-4 py-3">{p.stats?.totalPilotTrips ?? 0}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
