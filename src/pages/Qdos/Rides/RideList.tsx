import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import { Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from '@nextui-org/react';
import Tableempty from '../../Tableempty';
import ChatViewerModal from '../../ChatViewerModal';
import { getRides, getRideById, RideListParams } from '../../../services/qdosApi';

// Every cab and parcel ride: who booked it, who is actually travelling
// (booked for someone else) or sending/receiving a parcel, the rider, fare
// split and timeline. Read-only.

const TABS: { key: string; label: string }[] = [
    { key: '', label: 'All' },
    { key: 'REQUESTED', label: 'Searching' },
    { key: 'ACTIVE', label: 'Active' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'CANCELLED', label: 'Cancelled' },
];

const VEHICLES = ['MOTO', 'AUTO', 'CAR_ECONOMY', 'CAR_AC', 'TEMPO'];

const statusColor = (status: string) => {
    if (status === 'COMPLETED') return 'bg-green-100 text-green-700';
    if (status === 'CANCELLED') return 'bg-red-100 text-red-700';
    if (status === 'REQUESTED') return 'bg-yellow-100 text-yellow-700';
    return 'bg-blue-100 text-blue-700';
};

const fmt = (d?: string) => (d ? new Date(d).toLocaleString() : '-');
const money = (n?: number) => (n === undefined || n === null ? '-' : `₹${Number(n).toLocaleString('en-IN')}`);
const mapLink = (p?: any) => (p?.coordinates?.length === 2 ? `https://www.google.com/maps?q=${p.coordinates[1]},${p.coordinates[0]}` : null);
const person = (p?: any) => (p?.name || p?.phone ? `${p.name || '-'}${p.phone ? ` · ${p.phone}` : ''}` : '-');

function Field({ label, value, className = '' }: { label: string; value: React.ReactNode; className?: string }) {
    return (
        <div className={className}>
            <div className="text-gray-500">{label}</div>
            <div>{value ?? '-'}</div>
        </div>
    );
}

export default function RideList() {
    const [list, setList] = useState<any[]>([]);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [revenue, setRevenue] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [status, setStatus] = useState('');
    const [bookingType, setBookingType] = useState('');
    const [vehicleType, setVehicleType] = useState('');
    const [forSomeoneElse, setForSomeoneElse] = useState(false);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const detailModal = useDisclosure();
    const chatModal = useDisclosure();
    const [activeRide, setActiveRide] = useState<any>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
        return () => clearTimeout(t);
    }, [search]);

    const fetchList = async (p = 1) => {
        setLoading(true);
        try {
            const params: RideListParams = {
                status: (status || undefined) as RideListParams['status'],
                bookingType: (bookingType || undefined) as RideListParams['bookingType'],
                vehicleType: (vehicleType || undefined) as RideListParams['vehicleType'],
                forSomeoneElse: forSomeoneElse || undefined,
                search: debouncedSearch || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                page: p,
                limit: 15,
            };
            const res = await getRides(params);
            setList(res?.data?.rides || []);
            setCounts(res?.data?.counts || {});
            setRevenue(res?.data?.revenue || null);
            setPage(res?.data?.pagination?.page || p);
            setTotalPages(res?.data?.pagination?.totalPages || 1);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to fetch rides.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchList(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, bookingType, vehicleType, forSomeoneElse, debouncedSearch, startDate, endDate]);

    const openDetail = async (rideId: string) => {
        detailModal.onOpen();
        setDetailLoading(true);
        setActiveRide(null);
        try {
            const res = await getRideById(rideId);
            setActiveRide(res?.data || null);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to fetch ride details.');
        }
        setDetailLoading(false);
    };

    const r = activeRide;

    return (
        <div className="panel">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Rides &amp; Parcels</h2>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                {TABS.map((t) => (
                    <button
                        key={t.key || 'all'}
                        data-testid={`ride-tab-${t.key || 'ALL'}`}
                        className={`px-3 py-1.5 rounded-md text-sm border ${status === t.key ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-300 text-gray-700'}`}
                        onClick={() => setStatus(t.key)}
                    >
                        {t.label}{' '}
                        <span className="ml-1 text-xs opacity-80" data-testid={`ride-count-${t.key || 'ALL'}`}>
                            {counts[t.key || 'ALL'] ?? 0}
                        </span>
                    </button>
                ))}
            </div>

            {revenue && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="rounded-lg border border-gray-200 p-3">
                        <div className="text-xs text-gray-500">Completed rides</div>
                        <div className="text-xl font-semibold">{revenue.completedRides}</div>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-3">
                        <div className="text-xs text-gray-500">Fare collected (cash)</div>
                        <div className="text-xl font-semibold">{money(revenue.fareCollected)}</div>
                    </div>
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                        <div className="text-xs text-green-600">Rider earnings</div>
                        <div className="text-xl font-semibold text-green-700">{money(revenue.riderEarnings)}</div>
                    </div>
                    <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                        <div className="text-xs text-orange-600">Coupon discounts (Qdos-funded)</div>
                        <div className="text-xl font-semibold text-orange-700">{money(revenue.couponDiscount)}</div>
                    </div>
                </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mb-4">
                <select className="border border-gray-300 rounded-md px-3 py-2" value={bookingType} onChange={(e) => setBookingType(e.target.value)} data-testid="ride-type">
                    <option value="">Cab + Parcel</option>
                    <option value="PASSENGER">Cab rides</option>
                    <option value="PARCEL">Parcels</option>
                </select>
                <select className="border border-gray-300 rounded-md px-3 py-2" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
                    <option value="">All vehicles</option>
                    {VEHICLES.map((v) => (
                        <option key={v} value={v}>
                            {v.replace(/_/g, ' ')}
                        </option>
                    ))}
                </select>
                <input type="date" className="border border-gray-300 rounded-md px-3 py-2" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <span className="text-gray-400">to</span>
                <input type="date" className="border border-gray-300 rounded-md px-3 py-2" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                <input
                    type="text"
                    className="border border-gray-300 rounded-md px-3 py-2 min-w-[240px]"
                    placeholder="Search ride #, name or phone"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    data-testid="ride-search"
                />
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={forSomeoneElse} onChange={(e) => setForSomeoneElse(e.target.checked)} data-testid="ride-someone-else" />
                    Booked for someone else only
                </label>
            </div>

            <div className="table-wrapper overflow-x-auto">
                <table className="data-table w-full">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="px-4 py-3 text-left">Ride #</th>
                            <th className="px-4 py-3 text-left">Type</th>
                            <th className="px-4 py-3 text-left">Booked By</th>
                            <th className="px-4 py-3 text-left">Passenger / Parcel</th>
                            <th className="px-4 py-3 text-left">Pickup → Drop</th>
                            <th className="px-4 py-3 text-left">Rider</th>
                            <th className="px-4 py-3 text-left">Fare</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Booked</th>
                            <th className="px-4 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="border-b">
                                    <td className="px-4 py-3" colSpan={10}>
                                        <div className="w-full rounded h-5 bg-gray-200 animate-pulse" />
                                    </td>
                                </tr>
                            ))
                        ) : list.length === 0 ? (
                            <Tableempty length={10} />
                        ) : (
                            list.map((x: any) => (
                                <tr key={x._id} className="border-b last:border-b-0 hover:shadow-sm" data-testid={`ride-row-${x.rideNumber}`}>
                                    <td className="px-4 py-3 font-medium">{x.rideNumber}</td>
                                    <td className="px-4 py-3">
                                        <div>{x.bookingType === 'PARCEL' ? 'Parcel' : 'Cab'}</div>
                                        <div className="text-xs text-gray-500">{x.vehicleType?.replace(/_/g, ' ')}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div>{x.bookedBy?.name || '-'}</div>
                                        <div className="text-xs text-gray-500">{x.bookedBy?.phone}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {x.bookingType === 'PARCEL' ? (
                                            <div className="text-xs">
                                                <div>To: {person(x.receiver)}</div>
                                                {x.parcelDetails?.category && <div className="text-gray-500">{x.parcelDetails.category}</div>}
                                            </div>
                                        ) : (
                                            <>
                                                <div>{x.passenger?.name || '-'}</div>
                                                <div className="text-xs text-gray-500">{x.passenger?.phone}</div>
                                                {x.isBookedForSomeoneElse && (
                                                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-[11px] font-medium">For someone else</span>
                                                )}
                                            </>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-xs max-w-[260px]">
                                        <div className="truncate" title={x.pickup?.address}>
                                            🟢 {x.pickup?.address || '-'}
                                        </div>
                                        <div className="truncate" title={x.drop?.address}>
                                            🔴 {x.drop?.address || '-'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div>{x.riderId?.name || '-'}</div>
                                        <div className="text-xs text-gray-500">{x.riderId?.phone}</div>
                                    </td>
                                    <td className="px-4 py-3">{money(x.fare?.payable ?? x.fare?.total)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusColor(x.status)}`}>{x.status}</span>
                                    </td>
                                    <td className="px-4 py-3 text-xs">{fmt(x.createdAt)}</td>
                                    <td className="px-4 py-3">
                                        <button className="text-xs underline text-blue-600" onClick={() => openDetail(x._id)} data-testid={`ride-view-${x.rideNumber}`}>
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="pagination-container">
                <div className="pagination-controls">
                    <button className="pagination-button" disabled={page <= 1} onClick={() => fetchList(page - 1)}>
                        ‹ Prev
                    </button>
                    <span className="px-3 text-sm text-gray-600">
                        Page {page} of {totalPages}
                    </span>
                    <button className="pagination-button" disabled={page >= totalPages} onClick={() => fetchList(page + 1)}>
                        Next ›
                    </button>
                </div>
            </div>

            <Modal isOpen={detailModal.isOpen} onOpenChange={detailModal.onOpenChange} size="2xl" scrollBehavior="inside">
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader>Ride Details</ModalHeader>
                            <ModalBody>
                                {detailLoading || !r ? (
                                    <div className="py-8 text-center text-gray-500">Loading...</div>
                                ) : (
                                    <div className="grid gap-3 pb-4 text-sm" data-testid="ride-detail">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">
                                                {r.rideNumber} · {r.bookingType === 'PARCEL' ? 'Parcel' : 'Cab'} · {r.vehicleType?.replace(/_/g, ' ')}
                                            </span>
                                            <div className="flex items-center gap-3">
                                                {r.riderId && (
                                                    <button className="text-xs underline text-blue-600" onClick={() => chatModal.onOpen()}>
                                                        View Chat
                                                    </button>
                                                )}
                                                <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusColor(r.status)}`}>{r.status}</span>
                                            </div>
                                        </div>

                                        <div className={`border rounded-md p-3 ${r.isBookedForSomeoneElse ? 'border-purple-200 bg-purple-50' : 'border-gray-200'}`} data-testid="ride-people">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium">People</span>
                                                {r.isBookedForSomeoneElse && (
                                                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-xs font-medium">Booked for someone else</span>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Field label="Booked By (account)" value={person(r.bookedBy)} />
                                                {r.bookingType === 'PARCEL' ? (
                                                    <>
                                                        <Field label="Sender (at pickup)" value={r.sender?.phone ? person(r.sender) : `${person(r.bookedBy)} (account)`} />
                                                        <Field label="Receiver (at drop)" value={person(r.receiver)} />
                                                    </>
                                                ) : (
                                                    <Field label="Passenger" value={person(r.passenger)} />
                                                )}
                                                <Field
                                                    label="Rider"
                                                    value={r.riderId ? `${person(r.riderId)}${r.riderId.vehicle?.number ? ` · ${r.riderId.vehicle.number}` : ''}` : 'Not assigned'}
                                                />
                                            </div>
                                        </div>

                                        <div className="border rounded-md p-3 border-gray-200">
                                            <div className="font-medium mb-2">Route</div>
                                            <div className="grid gap-2">
                                                <div>
                                                    <div className="text-gray-500">Pickup</div>
                                                    <div>{r.pickup?.address || '-'}</div>
                                                    {mapLink(r.pickup) && (
                                                        <a className="text-xs underline text-blue-600" href={mapLink(r.pickup)!} target="_blank" rel="noreferrer">
                                                            Open in Google Maps
                                                        </a>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-gray-500">Drop</div>
                                                    <div>{r.drop?.address || '-'}</div>
                                                    {mapLink(r.drop) && (
                                                        <a className="text-xs underline text-blue-600" href={mapLink(r.drop)!} target="_blank" rel="noreferrer">
                                                            Open in Google Maps
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <Field label="Distance" value={r.distance?.distanceKm !== undefined ? `${r.distance.distanceKm} km` : '-'} />
                                                    <Field label="Est. time" value={r.distance?.durationText || (r.distance?.durationMinutes ? `${r.distance.durationMinutes} min` : '-')} />
                                                    <Field label="City" value={r.city || '-'} />
                                                </div>
                                            </div>
                                        </div>

                                        {r.bookingType === 'PARCEL' && r.parcelDetails && (
                                            <div className="border rounded-md p-3 border-gray-200">
                                                <div className="font-medium mb-2">Parcel</div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Field label="Category" value={r.parcelDetails.category || '-'} />
                                                    <Field label="Weight" value={r.parcelDetails.weightBucket?.replace(/_/g, ' ') || (r.parcelDetails.weightKg ? `${r.parcelDetails.weightKg} kg` : '-')} />
                                                    {r.parcelDetails.size && <Field label="Size" value={r.parcelDetails.size} />}
                                                    {r.parcelDetails.description && <Field label="Description" value={r.parcelDetails.description} />}
                                                    {r.parcelDetails.specialInstructions && <Field label="Instructions" value={r.parcelDetails.specialInstructions} className="col-span-2" />}
                                                </div>
                                            </div>
                                        )}

                                        <div className="border-t pt-2">
                                            <div className="font-medium mb-1">Fare</div>
                                            <div className="grid grid-cols-2 gap-y-1 text-gray-600">
                                                <span>Base fare</span>
                                                <span className="text-right">{money(r.fare?.baseFare)}</span>
                                                <span>Distance charge</span>
                                                <span className="text-right">{money(r.fare?.distanceCharge)}</span>
                                                <span>Time charge</span>
                                                <span className="text-right">{money(r.fare?.timeCharge)}</span>
                                                {(r.fare?.bookingFee || 0) > 0 && (
                                                    <>
                                                        <span>Booking fee</span>
                                                        <span className="text-right">{money(r.fare.bookingFee)}</span>
                                                    </>
                                                )}
                                                {(r.fare?.parcelSurcharge || 0) > 0 && (
                                                    <>
                                                        <span>Parcel surcharge</span>
                                                        <span className="text-right">{money(r.fare.parcelSurcharge)}</span>
                                                    </>
                                                )}
                                                {(r.fare?.surgeMultiplier || 1) > 1 && (
                                                    <>
                                                        <span>Surge</span>
                                                        <span className="text-right">×{r.fare.surgeMultiplier}</span>
                                                    </>
                                                )}
                                                <span>Total fare</span>
                                                <span className="text-right">{money(r.fare?.total)}</span>
                                                {(r.coupon?.discountAmount || 0) > 0 && (
                                                    <>
                                                        <span>Coupon {r.coupon.code ? `(${r.coupon.code})` : ''}</span>
                                                        <span className="text-right text-red-600">−{money(r.coupon.discountAmount)}</span>
                                                    </>
                                                )}
                                                <span className="font-medium text-gray-800">Customer pays ({r.payment?.method || 'COD'})</span>
                                                <span className="text-right font-medium text-gray-800">{money(r.fare?.payable ?? r.fare?.total)}</span>
                                            </div>
                                        </div>

                                        <div className="border-t pt-2">
                                            <div className="font-medium mb-1">Who Gets What</div>
                                            <div className="grid grid-cols-2 gap-2 text-center">
                                                <div className="rounded-md bg-green-50 border border-green-200 p-2">
                                                    <div className="text-xs text-green-600">Rider</div>
                                                    <div className="font-semibold text-green-700">{money(r.commission?.rider)}</div>
                                                </div>
                                                <div className="rounded-md bg-orange-50 border border-orange-200 p-2">
                                                    <div className="text-xs text-orange-600">Admin</div>
                                                    <div className="font-semibold text-orange-700">{money(r.commission?.admin)}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t pt-2">
                                            <div className="font-medium mb-1">Timeline</div>
                                            <div className="grid grid-cols-2 gap-y-1 text-gray-600">
                                                <span>Booked</span>
                                                <span className="text-right">{fmt(r.createdAt)}</span>
                                                <span>Accepted</span>
                                                <span className="text-right">{fmt(r.acceptedAt)}</span>
                                                <span>Arrived at pickup</span>
                                                <span className="text-right">{fmt(r.arrivedAt)}</span>
                                                <span>Ride started</span>
                                                <span className="text-right">{fmt(r.startedAt)}</span>
                                                <span>Completed</span>
                                                <span className="text-right">{fmt(r.completedAt)}</span>
                                                {r.rejectedCount > 0 && (
                                                    <>
                                                        <span>Riders who declined</span>
                                                        <span className="text-right">{r.rejectedCount}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {r.status === 'CANCELLED' && (
                                            <div className="border-t pt-2">
                                                <div className="text-gray-500">Cancelled by {r.cancelledBy || '-'}</div>
                                                <div>{r.cancelReason || '-'}</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <ChatViewerModal disclosure={chatModal} refType="Ride" refId={r?._id || null} />
        </div>
    );
}
