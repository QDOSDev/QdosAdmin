import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import Swal from 'sweetalert2';
import { Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from '@nextui-org/react';
import Tableempty from '../../Tableempty';
import { getPilotApplications, reviewPilotApplication, PilotApplicationStatus } from '../../../services/qdosApi';

const TABS: { value: PilotApplicationStatus; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
];

const statusColor = (s: string) => (s === 'approved' ? 'bg-green-100 text-green-700' : s === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700');
const label = (v?: string) => (v ? v.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : '-');
const fmt = (d?: string) => (d ? new Date(d).toLocaleString() : '-');

// what kind of driver this is — decides how carefully to check the licence
const driverType = (a: any) => {
    if (a.isPilotOnly) return 'Pilot only (no own vehicle)';
    const services = ['delivery', 'cab', 'parcel'].filter((s) => a.services?.[s]).map(label).join(', ');
    return `Existing rider — ${a.vehicle?.type || '-'}${services ? ` · ${services}` : ''}`;
};

function DocLink({ title, doc }: { title: string; doc?: { url?: string } }) {
    if (!doc?.url) return <span className="text-xs text-gray-400">{title}: not uploaded</span>;
    return (
        <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs underline text-blue-600">
            {title}
        </a>
    );
}

export default function PilotApprovals() {
    const [tab, setTab] = useState<PilotApplicationStatus>('pending');
    const [list, setList] = useState<any[]>([]);
    const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const viewModal = useDisclosure();
    const [active, setActive] = useState<any>(null);

    const fetchList = async (page = 1) => {
        setLoading(true);
        try {
            const res = await getPilotApplications({ status: tab, search: search.trim() || undefined, page, limit: 10 });
            const d = res?.data || {};
            setList(d.applications || []);
            setCounts({ pending: 0, approved: 0, rejected: 0, ...(d.counts || {}) });
            setCurrentPage(d.currentPage || page);
            setTotalPages(d.totalPages || 1);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to load pilot applications.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchList(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab]);

    const approve = (a: any) => {
        Swal.fire({
            title: `Approve ${a.name} as a pilot?`,
            html: `They'll start getting Hire a Pilot requests for: <b>${(a.pilotProfile?.transmissions || []).map(label).join(', ')}</b>.<br/>Make sure their licence covers driving cars.${
                a.isPilotOnly && a.status === 'pending' ? '<br/><br/>This also approves their driver account.' : ''
            }`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: getComputedStyle(document.documentElement).getPropertyValue('--yellow-color').trim() || '#E2AD17',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Approve',
        }).then(async (r) => {
            if (!r.isConfirmed) return;
            try {
                await reviewPilotApplication(a._id, { status: 'approved' });
                message.success(`${a.name} is now an approved pilot.`);
                viewModal.onClose();
                fetchList(currentPage);
            } catch (error: any) {
                message.error(error?.response?.data?.message || 'Failed to approve.');
            }
        });
    };

    const reject = (a: any) => {
        Swal.fire({
            title: `Reject ${a.name}'s pilot application?`,
            text: 'The driver sees this reason and can re-apply after fixing it.',
            icon: 'warning',
            input: 'text',
            inputPlaceholder: 'e.g. Upload a licence that covers cars (LMV)',
            inputValidator: (v: string) => (!v?.trim() ? 'A reason is required' : undefined),
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Reject',
        }).then(async (r) => {
            if (!r.isConfirmed) return;
            try {
                await reviewPilotApplication(a._id, { status: 'rejected', reason: r.value });
                message.success('Application rejected.');
                viewModal.onClose();
                fetchList(currentPage);
            } catch (error: any) {
                message.error(error?.response?.data?.message || 'Failed to reject.');
            }
        });
    };

    const actions = (a: any) => (
        <div className="flex gap-3">
            <button className="text-xs underline text-blue-600" onClick={() => { setActive(a); viewModal.onOpen(); }} data-testid="app-view">
                View
            </button>
            {a.pilotStatus !== 'approved' && (
                <button className="text-xs underline text-green-600" onClick={() => approve(a)} data-testid="app-approve">
                    Approve
                </button>
            )}
            {a.pilotStatus !== 'rejected' && (
                <button className="text-xs underline text-red-600" onClick={() => reject(a)} data-testid="app-reject">
                    Reject
                </button>
            )}
        </div>
    );

    return (
        <div className="panel">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
                <h2 className="text-lg font-semibold">Hire a Pilot — Driver Approvals</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
                Pilots drive customers' own cars, so every driver who turns on Hire a Pilot is checked here first — even riders already approved for delivery or taxi. Check their licence covers
                cars before approving. Only approved pilots get requests.
            </p>

            <div className="flex flex-wrap items-center gap-2 mb-4">
                {TABS.map((t) => (
                    <button
                        key={t.value}
                        className={`px-4 py-2 rounded-md text-sm font-medium border ${tab === t.value ? 'bg-yellow-50 border-yellow-400 text-yellow-800' : 'bg-white border-gray-200 text-gray-600'}`}
                        onClick={() => setTab(t.value)}
                        data-testid={`tab-${t.value}`}
                    >
                        {t.label}
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-100" data-testid={`count-${t.value}`}>
                            {counts[t.value]}
                        </span>
                    </button>
                ))}
                <div className="flex gap-2 ml-auto">
                    <input
                        className="border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Name or phone"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchList(1)}
                        data-testid="app-search"
                    />
                    <button className="btn btn-outline-primary" onClick={() => fetchList(1)}>
                        Search
                    </button>
                </div>
            </div>

            <div className="table-wrapper overflow-x-auto">
                <table className="data-table w-full">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="px-4 py-3 text-left">Driver</th>
                            <th className="px-4 py-3 text-left">Type</th>
                            <th className="px-4 py-3 text-left">Wants to drive</th>
                            <th className="px-4 py-3 text-left">Experience</th>
                            <th className="px-4 py-3 text-left">Documents</th>
                            <th className="px-4 py-3 text-left">{tab === 'pending' ? 'Applied' : 'Reviewed'}</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(4)].map((_, i) => (
                                <tr key={i} className="border-b">
                                    <td className="px-4 py-3" colSpan={8}>
                                        <div className="w-full rounded h-5 bg-gray-200 animate-pulse" />
                                    </td>
                                </tr>
                            ))
                        ) : list.length === 0 ? (
                            <Tableempty length={8} />
                        ) : (
                            list.map((a) => (
                                <tr key={a._id} className="border-b last:border-b-0 align-top" data-testid={`app-row-${a.phone}`}>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{a.name}</div>
                                        <div className="text-xs text-gray-400">{a.phone}</div>
                                        <div className="text-xs text-gray-400">Account: {a.status}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm max-w-[220px]" data-testid="app-type">
                                        {driverType(a)}
                                    </td>
                                    <td className="px-4 py-3 text-sm">{(a.pilotProfile?.transmissions || []).map(label).join(', ') || '-'}</td>
                                    <td className="px-4 py-3 text-sm">{a.pilotProfile?.experienceYears != null ? `${a.pilotProfile.experienceYears} yrs` : '-'}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col gap-1">
                                            <DocLink title="Car licence (pilot)" doc={a.pilotProfile?.drivingLicense} />
                                            <DocLink title="Licence on file" doc={a.documents?.drivingLicense} />
                                            <DocLink title="Aadhaar" doc={a.documents?.aadharCard} />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500">{fmt(tab === 'pending' ? a.pilotProfile?.appliedAt || a.pilotProfile?.onboardedAt : a.pilotProfile?.reviewedAt)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusColor(a.pilotStatus)}`} data-testid="app-status">
                                            {label(a.pilotStatus)}
                                        </span>
                                        {a.pilotStatus === 'rejected' && a.pilotProfile?.rejectionReason && <div className="text-xs text-red-500 mt-1 max-w-[180px]">{a.pilotProfile.rejectionReason}</div>}
                                    </td>
                                    <td className="px-4 py-3">{actions(a)}</td>
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

            <Modal isOpen={viewModal.isOpen} onOpenChange={viewModal.onOpenChange} size="3xl" scrollBehavior="inside">
                <ModalContent>
                    {() =>
                        active && (
                            <>
                                <ModalHeader>
                                    <div className="flex items-center gap-3">
                                        {active.name}
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusColor(active.pilotStatus)}`}>{label(active.pilotStatus)}</span>
                                    </div>
                                </ModalHeader>
                                <ModalBody>
                                    <div className="grid gap-4 pb-4 text-sm" data-testid="app-detail">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            <div>
                                                <div className="text-gray-500">Phone</div>
                                                <div>{active.phone}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Driver type</div>
                                                <div>{driverType(active)}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Account status</div>
                                                <div>{active.status}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Wants to drive</div>
                                                <div>{(active.pilotProfile?.transmissions || []).map(label).join(', ')}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Experience</div>
                                                <div>{active.pilotProfile?.experienceYears != null ? `${active.pilotProfile.experienceYears} yrs` : '-'}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Applied</div>
                                                <div>{fmt(active.pilotProfile?.appliedAt || active.pilotProfile?.onboardedAt)}</div>
                                            </div>
                                        </div>

                                        <div className="border-t pt-3">
                                            <div className="font-medium mb-2">Documents</div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                {[
                                                    ['Car licence (pilot)', active.pilotProfile?.drivingLicense],
                                                    ['Licence on file', active.documents?.drivingLicense],
                                                    ['Aadhaar', active.documents?.aadharCard],
                                                ].map(([title, doc]: any) => (
                                                    <div key={title} className="border rounded-md p-2">
                                                        <div className="text-xs text-gray-500 mb-1">{title}</div>
                                                        {doc?.url ? (
                                                            <a href={doc.url} target="_blank" rel="noreferrer">
                                                                <img src={doc.url} alt={title} className="w-full h-32 object-cover rounded" />
                                                            </a>
                                                        ) : (
                                                            <div className="h-32 flex items-center justify-center text-xs text-gray-400 bg-gray-50 rounded">Not uploaded</div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {active.pilotStatus === 'rejected' && (
                                            <div className="border-t pt-3 text-red-600">Rejected: {active.pilotProfile?.rejectionReason}</div>
                                        )}

                                        <div className="flex justify-end gap-3 border-t pt-3">
                                            {active.pilotStatus !== 'rejected' && (
                                                <button className="btn btn-outline-danger" onClick={() => reject(active)}>
                                                    Reject
                                                </button>
                                            )}
                                            {active.pilotStatus !== 'approved' && (
                                                <button className="btn btn-primary" onClick={() => approve(active)}>
                                                    Approve as pilot
                                                </button>
                                            )}
                                        </div>
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
