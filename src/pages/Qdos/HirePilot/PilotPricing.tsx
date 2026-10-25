import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import Swal from 'sweetalert2';
import { Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from '@nextui-org/react';
import Tableempty from '../../Tableempty';
import {
    getPilotSettings,
    updatePilotSettings,
    getPilotPackages,
    createPilotPackage,
    updatePilotPackage,
    deletePilotPackage,
    PilotSettings,
    PilotPackage,
    PilotTripType,
    PilotTransmission,
} from '../../../services/qdosApi';

const TRIP_TYPES: { value: PilotTripType; label: string }[] = [
    { value: 'ONE_WAY', label: 'One-Way Drop' },
    { value: 'ROUND_TRIP', label: 'Round Trip' },
];

const TRANSMISSIONS: { value: PilotTransmission; label: string }[] = [
    { value: 'MANUAL', label: 'Manual Gear' },
    { value: 'AUTOMATIC', label: 'Automatic' },
    { value: 'LUXURY', label: 'Luxury / SUV' },
];

// number fields on the settings form, in display order
const SETTING_FIELDS: { key: keyof PilotSettings; label: string; hint: string; suffix?: string }[] = [
    { key: 'extraPerHour', label: 'Extra per hour', suffix: '₹/hr', hint: 'Charged per minute beyond the package. Paid by the customer to the pilot in cash.' },
    { key: 'extraGraceMinutes', label: 'Grace minutes', suffix: 'min', hint: 'Free minutes past the package before the extra meter starts.' },
    { key: 'platformFee', label: 'Platform & safety fee', suffix: '₹', hint: 'Flat fee added to every booking. Kept by the platform.' },
    { key: 'commissionPercentage', label: 'Admin commission', suffix: '%', hint: 'Platform cut of the pilot fare (package + surcharges). The pilot gets the rest.' },
    { key: 'requestValidityMinutes', label: 'Request valid for', suffix: 'min', hint: 'How long a paid request stays open for pilots before it expires and is refunded in full.' },
    { key: 'searchRadiusKm', label: 'Search radius', suffix: 'km', hint: 'Pilots within this distance of the pickup point get the request.' },
    { key: 'cancellationFee', label: 'Cancellation fee', suffix: '₹', hint: 'Kept from the refund when the customer cancels after a pilot accepted.' },
    { key: 'minScheduleLeadMinutes', label: 'Min. schedule lead', suffix: 'min', hint: 'Earliest a scheduled pickup can be, from now.' },
    { key: 'maxAdvanceBookingDays', label: 'Max. advance booking', suffix: 'days', hint: 'Furthest ahead a pickup can be scheduled.' },
];

const EMPTY_PACKAGE = { name: '', hours: '', kmLimit: '', price: '', badge: '', extraPerHour: '', displayOrder: '0', isActive: true };
type PackageForm = typeof EMPTY_PACKAGE;

const toNumberOrUndefined = (v: string) => (v === '' || v === null || v === undefined ? undefined : Number(v));

export default function PilotPricing() {
    const [settings, setSettings] = useState<PilotSettings | null>(null);
    const [savingSettings, setSavingSettings] = useState(false);
    const [packages, setPackages] = useState<PilotPackage[]>([]);
    const [loading, setLoading] = useState(true);

    const packageModal = useDisclosure();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<PackageForm>(EMPTY_PACKAGE);
    const [savingPackage, setSavingPackage] = useState(false);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [s, p] = await Promise.all([getPilotSettings(), getPilotPackages()]);
            setSettings(s?.data || null);
            setPackages(p?.data || []);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to load Hire a Pilot pricing.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const setSetting = (key: keyof PilotSettings, value: any) => setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));

    const setSurcharge = (group: 'tripTypeSurcharge' | 'transmissionSurcharge', option: string, value: string) =>
        setSettings((prev) => (prev ? { ...prev, [group]: { ...(prev as any)[group], [option]: value } } : prev));

    const handleSaveSettings = async () => {
        if (!settings) return;
        const payload: Record<string, any> = { isEnabled: settings.isEnabled };
        for (const f of SETTING_FIELDS) {
            const n = Number((settings as any)[f.key]);
            if ((settings as any)[f.key] === '' || Number.isNaN(n)) {
                message.error(`${f.label} must be a number`);
                return;
            }
            payload[f.key] = n;
        }
        for (const group of ['tripTypeSurcharge', 'transmissionSurcharge'] as const) {
            payload[group] = Object.fromEntries(Object.entries(settings[group] || {}).map(([k, v]) => [k, Number(v) || 0]));
        }
        setSavingSettings(true);
        try {
            const res = await updatePilotSettings(payload);
            setSettings(res?.data || settings);
            message.success('Pilot settings saved. They apply to new bookings.');
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to save settings.');
        }
        setSavingSettings(false);
    };

    const openCreate = () => {
        setEditingId(null);
        setForm(EMPTY_PACKAGE);
        packageModal.onOpen();
    };

    const openEdit = (p: PilotPackage) => {
        setEditingId(p._id);
        setForm({
            name: p.name || '',
            hours: String(p.hours ?? ''),
            kmLimit: p.kmLimit != null ? String(p.kmLimit) : '',
            price: String(p.price ?? ''),
            badge: p.badge || '',
            extraPerHour: p.extraPerHour != null ? String(p.extraPerHour) : '',
            displayOrder: String(p.displayOrder ?? 0),
            isActive: p.isActive,
        });
        packageModal.onOpen();
    };

    const handleSavePackage = async (onClose: () => void) => {
        if (!form.hours || Number(form.hours) < 1) return message.error('Hours must be at least 1');
        if (form.price === '' || Number(form.price) < 0) return message.error('Price is required');
        const payload = {
            name: form.name.trim() || (editingId ? null : undefined),
            hours: Number(form.hours),
            kmLimit: toNumberOrUndefined(form.kmLimit),
            price: Number(form.price),
            badge: form.badge.trim() || (editingId ? null : undefined),
            // blank = use the global extra-per-hour rate
            extraPerHour: form.extraPerHour === '' ? (editingId ? null : undefined) : Number(form.extraPerHour),
            displayOrder: Number(form.displayOrder) || 0,
            isActive: form.isActive,
        };
        setSavingPackage(true);
        try {
            if (editingId) await updatePilotPackage(editingId, payload);
            else await createPilotPackage(payload);
            message.success(editingId ? 'Package updated.' : 'Package created.');
            onClose();
            fetchAll();
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to save package.');
        }
        setSavingPackage(false);
    };

    const toggleActive = async (p: PilotPackage) => {
        try {
            await updatePilotPackage(p._id, { isActive: !p.isActive });
            message.success(p.isActive ? 'Package hidden from customers.' : 'Package is live.');
            fetchAll();
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to update package.');
        }
    };

    const handleDelete = (p: PilotPackage) => {
        Swal.fire({
            title: `Delete the ${p.name || `${p.hours} Hrs`} package?`,
            text: 'Customers will no longer see it. Existing bookings keep their own price.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Delete',
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                await deletePilotPackage(p._id);
                message.success('Package deleted.');
                fetchAll();
            } catch (error: any) {
                message.error(error?.response?.data?.message || 'Failed to delete package.');
            }
        });
    };

    // what a booking on this package works out to with the current settings
    // (base trip type / transmission, i.e. no surcharge)
    const breakdown = (p: PilotPackage) => {
        if (!settings) return null;
        const commission = Math.round((p.price * (Number(settings.commissionPercentage) || 0)) / 100);
        return {
            customerPays: p.price + (Number(settings.platformFee) || 0),
            pilotEarns: p.price - commission,
            commission,
            extraPerHour: p.extraPerHour ?? settings.extraPerHour,
        };
    };

    const inputClass = 'border border-gray-300 rounded-md px-3 py-2 w-full';

    return (
        <div className="grid gap-5">
            {/* ---------- Packages ---------- */}
            <div className="panel">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
                    <h2 className="text-lg font-semibold">Hire a Pilot — Packages</h2>
                    <button className="btn btn-primary" onClick={openCreate} data-testid="add-package">
                        + Add Package
                    </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                    The duration cards customers pick from (e.g. 6 / 12 / 24 Hrs). "Pilot earns" and "Customer pays" use the current commission and platform fee below, for a booking with no
                    surcharge.
                </p>

                <div className="table-wrapper overflow-x-auto">
                    <table className="data-table w-full">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="px-4 py-3 text-left">Package</th>
                                <th className="px-4 py-3 text-left">Km limit</th>
                                <th className="px-4 py-3 text-left">Price</th>
                                <th className="px-4 py-3 text-left">Customer pays</th>
                                <th className="px-4 py-3 text-left">Pilot earns</th>
                                <th className="px-4 py-3 text-left">Extra / hr</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(3)].map((_, i) => (
                                    <tr key={i} className="border-b">
                                        <td className="px-4 py-3" colSpan={8}>
                                            <div className="w-full rounded h-5 bg-gray-200 animate-pulse" />
                                        </td>
                                    </tr>
                                ))
                            ) : packages.length === 0 ? (
                                <Tableempty length={8} />
                            ) : (
                                packages.map((p) => {
                                    const b = breakdown(p);
                                    return (
                                        <tr key={p._id} className="border-b last:border-b-0" data-testid={`package-row-${p.hours}`}>
                                            <td className="px-4 py-3 font-medium">
                                                {p.name || `${p.hours} Hrs`}
                                                {p.badge && <span className="ml-2 px-2 py-0.5 rounded-md text-xs bg-orange-100 text-orange-700">{p.badge}</span>}
                                                <div className="text-xs text-gray-400">{p.hours} hours · order {p.displayOrder}</div>
                                            </td>
                                            <td className="px-4 py-3">{p.kmLimit != null ? `${p.kmLimit} km` : '-'}</td>
                                            <td className="px-4 py-3">₹{p.price}</td>
                                            <td className="px-4 py-3" data-testid="customer-pays">
                                                {b ? `₹${b.customerPays}` : '-'}
                                            </td>
                                            <td className="px-4 py-3" data-testid="pilot-earns">
                                                {b ? (
                                                    <>
                                                        <span className="font-medium text-green-700">₹{b.pilotEarns}</span>
                                                        <div className="text-xs text-gray-400">admin ₹{b.commission}</div>
                                                    </>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                ₹{b?.extraPerHour ?? '-'}
                                                {p.extraPerHour != null && <div className="text-xs text-gray-400">package override</div>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-md text-xs font-medium ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {p.isActive ? 'Active' : 'Hidden'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-3">
                                                    <button className="text-xs underline text-blue-600" onClick={() => openEdit(p)}>
                                                        Edit
                                                    </button>
                                                    <button className="text-xs underline text-gray-600" onClick={() => toggleActive(p)}>
                                                        {p.isActive ? 'Hide' : 'Activate'}
                                                    </button>
                                                    <button className="text-xs underline text-red-600" onClick={() => handleDelete(p)}>
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ---------- Global settings ---------- */}
            <div className="panel">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
                    <h2 className="text-lg font-semibold">Hire a Pilot — Settings</h2>
                    {settings && (
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" checked={!!settings.isEnabled} onChange={(e) => setSetting('isEnabled', e.target.checked)} data-testid="pilot-enabled" />
                            {settings.isEnabled ? 'Live in the user app' : 'Turned off in the user app'}
                        </label>
                    )}
                </div>
                <p className="text-sm text-gray-500 mb-4">Applies to bookings made after you save — an existing booking keeps the prices it was booked at.</p>

                {loading || !settings ? (
                    <div className="w-full rounded h-24 bg-gray-200 animate-pulse" />
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {SETTING_FIELDS.map((f) => (
                                <div key={f.key}>
                                    <label className="block text-sm font-medium mb-1">
                                        {f.label} {f.suffix && <span className="text-gray-400 font-normal">({f.suffix})</span>}
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        className={inputClass}
                                        value={(settings as any)[f.key] ?? ''}
                                        onChange={(e) => setSetting(f.key, e.target.value)}
                                        data-testid={`setting-${f.key}`}
                                    />
                                    <div className="text-xs text-gray-400 mt-1">{f.hint}</div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 border-t pt-4">
                            <div>
                                <div className="font-medium mb-1">Trip type surcharge (₹)</div>
                                <div className="text-xs text-gray-400 mb-2">Added on top of the package price.</div>
                                {TRIP_TYPES.map((t) => (
                                    <div key={t.value} className="flex items-center gap-3 mb-2">
                                        <span className="w-40 text-sm">{t.label}</span>
                                        <input
                                            type="number"
                                            min={0}
                                            className={inputClass}
                                            value={settings.tripTypeSurcharge?.[t.value] ?? 0}
                                            onChange={(e) => setSurcharge('tripTypeSurcharge', t.value, e.target.value)}
                                            data-testid={`surcharge-trip-${t.value}`}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div className="font-medium mb-1">Transmission surcharge (₹)</div>
                                <div className="text-xs text-gray-400 mb-2">e.g. charge more for a luxury car.</div>
                                {TRANSMISSIONS.map((t) => (
                                    <div key={t.value} className="flex items-center gap-3 mb-2">
                                        <span className="w-40 text-sm">{t.label}</span>
                                        <input
                                            type="number"
                                            min={0}
                                            className={inputClass}
                                            value={settings.transmissionSurcharge?.[t.value] ?? 0}
                                            onChange={(e) => setSurcharge('transmissionSurcharge', t.value, e.target.value)}
                                            data-testid={`surcharge-transmission-${t.value}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end mt-4">
                            <button className="btn btn-primary" disabled={savingSettings} onClick={handleSaveSettings} data-testid="save-settings">
                                {savingSettings ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* ---------- Create / edit package ---------- */}
            <Modal isOpen={packageModal.isOpen} onOpenChange={packageModal.onOpenChange} size="lg">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>{editingId ? 'Edit Package' : 'Add Package'}</ModalHeader>
                            <ModalBody>
                                <div className="grid grid-cols-2 gap-3 pb-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Hours *</label>
                                        <input type="number" min={1} className={inputClass} value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} data-testid="pkg-hours" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Price (₹) *</label>
                                        <input type="number" min={0} className={inputClass} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} data-testid="pkg-price" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Name</label>
                                        <input className={inputClass} placeholder="e.g. 6 Hrs" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="pkg-name" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Km limit</label>
                                        <input type="number" min={0} className={inputClass} value={form.kmLimit} onChange={(e) => setForm({ ...form, kmLimit: e.target.value })} data-testid="pkg-km" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Badge</label>
                                        <input className={inputClass} placeholder="Popular / Full Day / Outstation" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} data-testid="pkg-badge" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Extra per hour (₹)</label>
                                        <input
                                            type="number"
                                            min={0}
                                            className={inputClass}
                                            placeholder={settings ? `Global: ₹${settings.extraPerHour}` : ''}
                                            value={form.extraPerHour}
                                            onChange={(e) => setForm({ ...form, extraPerHour: e.target.value })}
                                            data-testid="pkg-extra"
                                        />
                                        <div className="text-xs text-gray-400 mt-1">Leave blank to use the global rate.</div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Display order</label>
                                        <input type="number" className={inputClass} value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} data-testid="pkg-order" />
                                    </div>
                                    <div className="flex items-end">
                                        <label className="flex items-center gap-2 text-sm cursor-pointer pb-2">
                                            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                                            Visible to customers
                                        </label>
                                    </div>
                                    <div className="col-span-2 flex justify-end gap-2 mt-2">
                                        <button className="btn btn-outline-secondary" onClick={onClose}>
                                            Cancel
                                        </button>
                                        <button className="btn btn-primary" disabled={savingPackage} onClick={() => handleSavePackage(onClose)} data-testid="pkg-save">
                                            {savingPackage ? 'Saving...' : editingId ? 'Save Changes' : 'Create Package'}
                                        </button>
                                    </div>
                                </div>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
