import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import Swal from 'sweetalert2';
import { Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from '@nextui-org/react';
import { MapContainer, TileLayer, Marker, CircleMarker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ViewIcon from '../../../../public/assets/APSIcon/View';
import Tableempty from '../../Tableempty';
import { getRiders, getRiderById, updateRiderStatus } from '../../../services/qdosApi';

// same fix as Viewgym.tsx — Leaflet's default marker icon paths break under
// Vite's bundling, so point them at the CDN copies instead
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STATUS_OPTIONS = ['pending', 'approved', 'rejected', 'blocked'];

const SERVICE_OPTIONS: { value: string; label: string }[] = [
    { value: 'delivery', label: 'Delivery' },
    { value: 'cab', label: 'Cab' },
    { value: 'parcel', label: 'Parcel' },
    { value: 'pilot', label: 'Hire a Pilot' },
];

// Hire a Pilot drivers drive the CUSTOMER'S car — a pilot-only partner has no vehicle of their own
const vehicleText = (r: any) => {
    if (!r?.vehicle?.type) return r?.services?.pilot ? 'No vehicle (pilot only)' : '-';
    return `${r.vehicle.type}${r.vehicle.type === 'car' ? ` (${r.vehicle.isAC ? 'AC' : 'Non-AC'})` : ''} · ${r.vehicle.number || ''}`;
};

const serviceList = (r: any) => SERVICE_OPTIONS.filter((s) => r?.services?.[s.value]).map((s) => s.label);

const statusDotColor = (status: string) => {
    if (status === 'approved') return 'bg-green-500';
    if (status === 'pending') return 'bg-yellow-500';
    return 'bg-red-500';
};

const MODE_LABEL: Record<string, { label: string; color: string }> = {
    on_ride: { label: 'Cab', color: 'bg-blue-100 text-blue-700' },
    delivering: { label: 'Delivery', color: 'bg-purple-100 text-purple-700' },
    mixed: { label: 'Cab + Delivery', color: 'bg-indigo-100 text-indigo-700' },
    on_pilot: { label: 'On Pilot', color: 'bg-orange-100 text-orange-700' },
    idle: { label: 'Idle', color: 'bg-gray-100 text-gray-600' },
};

const modeBadge = (availability: string) => MODE_LABEL[availability] || MODE_LABEL.idle;

// our backend stores GeoJSON coordinates as [lng, lat]; Leaflet wants [lat, lng]
const toLatLng = (coordinates?: number[] | null): [number, number] | null => {
    if (!coordinates || coordinates.length !== 2) return null;
    const [lng, lat] = coordinates;
    if (lng === 0 && lat === 0) return null; // never-updated default, not a real position
    return [lat, lng];
};

function FitBoundsOnLoad({ points }: { points: [number, number][] }) {
    const map = useMap();
    useEffect(() => {
        const t = setTimeout(() => {
            map.invalidateSize();
            if (points.length > 1) {
                map.fitBounds(points as any, { padding: [40, 40] });
            } else if (points.length === 1) {
                map.setView(points[0], 14);
            }
        }, 100);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map]);
    return null;
}

function RiderLiveMap({ rider }: { rider: any }) {
    const riderPos = toLatLng(rider?.location?.coordinates);

    const stops: { pos: [number, number]; kind: 'pickup' | 'drop'; label: string }[] = [];

    if (rider?.activeRide?.rideId) {
        const ride = rider.activeRide.rideId;
        const pickup = toLatLng(ride.pickup?.coordinates);
        const drop = toLatLng(ride.drop?.coordinates);
        if (pickup) stops.push({ pos: pickup, kind: 'pickup', label: ride.pickup?.address || 'Pickup' });
        if (drop) stops.push({ pos: drop, kind: 'drop', label: ride.drop?.address || 'Drop' });
    }

    rider?.activeDeliveries?.forEach((d: any) => {
        if (!d.orderId) return;
        const pickup = toLatLng(d.orderId.restaurantId?.location?.coordinates);
        const drop = toLatLng(d.orderId.address?.coordinates);
        if (pickup) stops.push({ pos: pickup, kind: 'pickup', label: d.orderId.restaurantId?.restaurantName || 'Restaurant' });
        if (drop) stops.push({ pos: drop, kind: 'drop', label: d.orderId.address?.fullAddress || 'Delivery address' });
    });

    const allPoints = [...(riderPos ? [riderPos] : []), ...stops.map((s) => s.pos)];

    if (allPoints.length === 0) {
        return <div className="text-gray-500 text-sm">No location on file for this rider yet.</div>;
    }

    return (
        <div className="h-72 rounded-lg overflow-hidden border border-gray-200">
            <MapContainer center={allPoints[0]} zoom={14} style={{ height: '100%', width: '100%' }}>
                <FitBoundsOnLoad points={allPoints} />
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                {riderPos && (
                    <Marker position={riderPos}>
                        <Popup>{rider.name} (rider)</Popup>
                    </Marker>
                )}
                {stops.map((s, i) => (
                    <CircleMarker key={i} center={s.pos} radius={9} pathOptions={{ color: s.kind === 'pickup' ? '#16a34a' : '#dc2626', fillOpacity: 0.8 }}>
                        <Popup>
                            {s.kind === 'pickup' ? 'Pickup' : 'Drop'}: {s.label}
                        </Popup>
                    </CircleMarker>
                ))}
                {riderPos && stops.length > 0 && <Polyline positions={[riderPos, ...stops.map((s) => s.pos)]} pathOptions={{ color: '#E2AD17', weight: 3, dashArray: '6 6' }} />}
            </MapContainer>
        </div>
    );
}

export default function RiderList() {
    const [list, setList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [serviceFilter, setServiceFilter] = useState('');

    const viewModal = useDisclosure();
    const [activeRider, setActiveRider] = useState<any>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const fetchList = async (page = 1) => {
        setLoading(true);
        try {
            const res = await getRiders({ status: (statusFilter as any) || undefined, service: (serviceFilter as any) || undefined, page, limit: 10 });
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
    }, [statusFilter, serviceFilter]);

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
                <div className="flex flex-wrap gap-3">
                    <select className="border border-gray-300 rounded-md px-3 py-2" value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)} data-testid="rider-service-filter">
                        <option value="">All services</option>
                        {SERVICE_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                    <select className="border border-gray-300 rounded-md px-3 py-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} data-testid="rider-status-filter">
                        <option value="">All statuses</option>
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </div>
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
                            <th className="px-4 py-3 text-left">Mode</th>
                            <th className="px-4 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="border-b">
                                    <td className="px-4 py-3" colSpan={7}>
                                        <div className="w-full rounded h-5 bg-gray-200 animate-pulse" />
                                    </td>
                                </tr>
                            ))
                        ) : list.length === 0 ? (
                            <Tableempty length={7} />
                        ) : (
                            list.map((r: any) => (
                                <tr key={r._id} className="border-b last:border-b-0 hover:shadow-sm">
                                    <td className="px-4 py-3">{r.name}</td>
                                    <td className="px-4 py-3">{r.phone}</td>
                                    <td className="px-4 py-3">
                                        {vehicleText(r)}
                                        <div className="text-xs text-gray-400">{serviceList(r).join(' · ')}</div>
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
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${modeBadge(r.availability).color}`}>{modeBadge(r.availability).label}</span>
                                    </td>
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
                                                {activeRider?.vehicle?.type === 'car' && <Field label="AC" value={activeRider?.vehicle?.isAC ? 'Yes' : 'No'} />}
                                                <Field label="Vehicle Number" value={activeRider?.vehicle?.number} />
                                                <Field label="Vehicle Model" value={activeRider?.vehicle?.model} />
                                                {!activeRider?.vehicle?.type && <Field label="Vehicle" value={vehicleText(activeRider)} />}
                                                <Field label="Delivery" value={activeRider?.services?.delivery ? 'Yes' : 'No'} />
                                                <Field label="Cab" value={activeRider?.services?.cab ? 'Yes' : 'No'} />
                                                <Field label="Parcel" value={activeRider?.services?.parcel ? 'Yes' : 'No'} />
                                                <Field label="Hire a Pilot" value={activeRider?.services?.pilot ? 'Yes' : 'No'} />
                                                {activeRider?.services?.pilot && (
                                                    <>
                                                        <Field label="Pilot Drives" value={activeRider?.pilotProfile?.transmissions?.join(', ')} />
                                                        <Field label="Driving Experience" value={activeRider?.pilotProfile?.experienceYears != null ? `${activeRider.pilotProfile.experienceYears} yrs` : undefined} />
                                                        <Field label="Pilot Trips" value={activeRider?.stats?.totalPilotTrips ?? 0} />
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="border-t pt-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="font-medium">Current Activity</div>
                                                <span className={`px-2 py-1 rounded-md text-xs font-medium ${modeBadge(activeRider?.availability).color}`}>
                                                    {modeBadge(activeRider?.availability).label}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-gray-600 mb-3">
                                                <Field label="Coordinates" value={activeRider?.location?.coordinates ? activeRider.location.coordinates.join(', ') : undefined} />
                                                <Field
                                                    label="Location Last Updated"
                                                    value={activeRider?.location?.lastUpdated ? new Date(activeRider.location.lastUpdated).toLocaleString() : undefined}
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <RiderLiveMap rider={activeRider} />
                                                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <span className="h-2 w-2 rounded-full bg-green-600 inline-block" /> Pickup
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <span className="h-2 w-2 rounded-full bg-red-600 inline-block" /> Drop
                                                    </span>
                                                </div>
                                            </div>

                                            {activeRider?.activeRide?.rideId && (
                                                <div className="rounded-md border border-blue-200 bg-blue-50 p-3 mb-3">
                                                    <div className="text-xs font-medium text-blue-700 mb-2">On a ride</div>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                        <Field label="Ride #" value={activeRider.activeRide.rideId.rideNumber} />
                                                        <Field label="Ride Status" value={activeRider.activeRide.rideId.status} />
                                                        <Field label="Vehicle Type" value={activeRider.activeRide.rideId.vehicleType} />
                                                        <Field label="Passenger" value={activeRider.activeRide.rideId.userId?.name || activeRider.activeRide.rideId.userId?.phone} />
                                                        <Field label="Fare" value={activeRider.activeRide.rideId.fare?.total !== undefined ? `₹${activeRider.activeRide.rideId.fare.total}` : undefined} />
                                                        <Field label="Started" value={activeRider.activeRide.startedAt ? new Date(activeRider.activeRide.startedAt).toLocaleString() : undefined} />
                                                        <Field label="Pickup" value={activeRider.activeRide.rideId.pickup?.address} />
                                                        <Field label="Drop" value={activeRider.activeRide.rideId.drop?.address} />
                                                    </div>
                                                </div>
                                            )}

                                            {activeRider?.activeDeliveries?.length > 0 && (
                                                <div className="rounded-md border border-purple-200 bg-purple-50 p-3">
                                                    <div className="text-xs font-medium text-purple-700 mb-2">Active deliveries ({activeRider.activeDeliveries.length})</div>
                                                    <div className="grid gap-2">
                                                        {activeRider.activeDeliveries.map((d: any) => (
                                                            <div key={d._id} className="rounded-md bg-white border border-purple-100 p-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                                                                {d.orderId ? (
                                                                    <>
                                                                        <Field label="Order #" value={d.orderId.orderNumber} />
                                                                        <Field label="Order Status" value={d.orderId.status} />
                                                                        <Field label="Restaurant" value={d.orderId.restaurantId?.restaurantName} />
                                                                        <Field label="Total" value={d.orderId.pricing?.total !== undefined ? `₹${d.orderId.pricing.total}` : undefined} />
                                                                    </>
                                                                ) : (
                                                                    <span className="text-gray-500 col-span-2 md:col-span-4">Order no longer available.</span>
                                                                )}
                                                                <Field label="Picked Up" value={d.picked ? 'Yes' : 'No'} />
                                                                <Field label="Delivered" value={d.delivered ? 'Yes' : 'No'} />
                                                                <Field label="Assigned" value={d.assignedAt ? new Date(d.assignedAt).toLocaleString() : undefined} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {activeRider?.activePilotBooking?.bookingId && (
                                                <div className="rounded-md border border-orange-200 bg-orange-50 p-3 mb-3">
                                                    <div className="text-xs font-medium text-orange-700 mb-2">On a Hire a Pilot booking</div>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                        <Field label="Booking #" value={activeRider.activePilotBooking.bookingId.bookingNumber} />
                                                        <Field label="Status" value={activeRider.activePilotBooking.bookingId.status} />
                                                        <Field label="Package" value={activeRider.activePilotBooking.bookingId.pricing?.packageName} />
                                                        <Field label="Customer" value={activeRider.activePilotBooking.bookingId.userId?.name || activeRider.activePilotBooking.bookingId.userId?.phone} />
                                                        <Field label="Car" value={[activeRider.activePilotBooking.bookingId.car?.model, activeRider.activePilotBooking.bookingId.car?.number].filter(Boolean).join(' · ')} />
                                                        <Field label="Pilot Earns" value={activeRider.activePilotBooking.bookingId.pricing?.pilotEarning !== undefined ? `₹${activeRider.activePilotBooking.bookingId.pricing.pilotEarning}` : undefined} />
                                                        <Field label="Pickup" value={activeRider.activePilotBooking.bookingId.pickup?.address} />
                                                    </div>
                                                </div>
                                            )}

                                            {activeRider?.availability === 'idle' && <div className="text-gray-500">Not currently on a ride or delivery.</div>}
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
