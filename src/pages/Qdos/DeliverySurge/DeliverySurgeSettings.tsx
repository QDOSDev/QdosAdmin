import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import {
    getDeliverySurgeSettings,
    updateDeliverySurgeSettings,
    getDeliverySurgeStatus,
    getDeliveryRideSurgeStatus,
    previewDeliveryFee,
    getDeliverySurgeAudit,
    getCities,
    getCityById,
    updateCitySurgeOverride,
    DeliverySurgeSettings as SettingsType,
    CitySurgeOverride,
} from '../../../services/qdosApi';

const emptyOverride: CitySurgeOverride = {
    enabled: null,
    baseDeliveryFee: null,
    maxMultiplier: null,
    maxAdditionalFee: null,
    minDemandForSurge: null,
};

const emptySettings: SettingsType = {
    enabled: true,
    baseDeliveryFee: 20,
    riderBaseFare: 30,
    riderPerKmRate: 10,
    rollingWindowMinutes: 15,
    riderFreshnessMinutes: 10,
    updateIntervalSeconds: 120,
    minDemandForSurge: 3,
    maxMultiplier: 2,
    maxAdditionalFee: null,
    thresholds: [
        { ratio: 1, multiplier: 1.0 },
        { ratio: 1.5, multiplier: 1.2 },
        { ratio: 2.5, multiplier: 1.5 },
        { ratio: 4, multiplier: 1.8 },
    ],
    stabilityPeriodMinutes: 5,
    quoteValiditySeconds: 180,
};

export default function DeliverySurgeSettings() {
    const [settings, setSettings] = useState<SettingsType>(emptySettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [status, setStatus] = useState<any[]>([]);
    const [statusLoading, setStatusLoading] = useState(true);

    const [rideStatus, setRideStatus] = useState<any[]>([]);
    const [rideStatusLoading, setRideStatusLoading] = useState(true);

    const [citySearch, setCitySearch] = useState('');
    const [citySearchResults, setCitySearchResults] = useState<any[]>([]);
    const [citySearching, setCitySearching] = useState(false);
    const [selectedCity, setSelectedCity] = useState<any>(null);
    const [cityOverride, setCityOverride] = useState<CitySurgeOverride>(emptyOverride);
    const [overrideLoading, setOverrideLoading] = useState(false);
    const [overrideSaving, setOverrideSaving] = useState(false);

    const [previewLat, setPreviewLat] = useState('');
    const [previewLng, setPreviewLng] = useState('');
    const [previewResult, setPreviewResult] = useState<any>(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    const [audit, setAudit] = useState<any[]>([]);
    const [auditLoading, setAuditLoading] = useState(true);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await getDeliverySurgeSettings();
            if (res?.data) setSettings(res.data);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to fetch delivery surge settings.');
        }
        setLoading(false);
    };

    const fetchStatus = async () => {
        setStatusLoading(true);
        try {
            const res = await getDeliverySurgeStatus();
            setStatus(res?.data || []);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to fetch live surge status.');
        }
        setStatusLoading(false);
    };

    const fetchAudit = async () => {
        setAuditLoading(true);
        try {
            const res = await getDeliverySurgeAudit({ limit: 10 });
            setAudit(res?.entries || []);
        } catch {
            // non-critical
        }
        setAuditLoading(false);
    };

    const fetchRideStatus = async () => {
        setRideStatusLoading(true);
        try {
            const res = await getDeliveryRideSurgeStatus();
            setRideStatus(res?.data || []);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to fetch live ride surge status.');
        }
        setRideStatusLoading(false);
    };

    useEffect(() => {
        fetchSettings();
        fetchStatus();
        fetchRideStatus();
        fetchAudit();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await updateDeliverySurgeSettings(settings);
            if (res?.data) setSettings(res.data);
            message.success('Delivery surge settings saved.');
            fetchAudit();
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to save settings.');
        }
        setSaving(false);
    };

    const updateThreshold = (index: number, field: 'ratio' | 'multiplier', value: number) => {
        const next = [...settings.thresholds];
        next[index] = { ...next[index], [field]: value };
        setSettings({ ...settings, thresholds: next });
    };

    const addThreshold = () => {
        setSettings({ ...settings, thresholds: [...settings.thresholds, { ratio: 0, multiplier: 1 }] });
    };

    const removeThreshold = (index: number) => {
        setSettings({ ...settings, thresholds: settings.thresholds.filter((_, i) => i !== index) });
    };

    const handlePreview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!previewLat || !previewLng) return;
        setPreviewLoading(true);
        setPreviewResult(null);
        try {
            const res = await previewDeliveryFee(Number(previewLat), Number(previewLng));
            setPreviewResult(res?.data || null);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to compute preview.');
        }
        setPreviewLoading(false);
    };

    const handleCitySearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!citySearch.trim()) return;
        setCitySearching(true);
        try {
            const res = await getCities({ q: citySearch.trim(), limit: 20 });
            setCitySearchResults(res?.cities || []);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to search cities.');
        }
        setCitySearching(false);
    };

    const selectCity = async (city: any) => {
        setCitySearchResults([]);
        setCitySearch('');
        setOverrideLoading(true);
        try {
            const res = await getCityById(city._id);
            const fullCity = res?.data || city;
            setSelectedCity(fullCity);
            setCityOverride({ ...emptyOverride, ...(fullCity.surgeOverride || {}) });
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to load city.');
        }
        setOverrideLoading(false);
    };

    const handleSaveOverride = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCity) return;
        setOverrideSaving(true);
        try {
            const res = await updateCitySurgeOverride(selectedCity._id, cityOverride);
            message.success(`Surge override saved for ${selectedCity.name}.`);
            if (res?.data?.surgeOverride) setCityOverride({ ...emptyOverride, ...res.data.surgeOverride });
            fetchStatus();
            fetchRideStatus();
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to save override.');
        }
        setOverrideSaving(false);
    };

    const clearOverride = () => setCityOverride(emptyOverride);

    const jumpToOverride = async (cityId: string, cityName: string) => {
        await selectCity({ _id: cityId, name: cityName });
        document.getElementById('city-override-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="grid gap-6">
            <div className="panel">
                <h2 className="text-lg font-semibold mb-1">Surge Pricing — Delivery &amp; Rides</h2>
                <p className="text-sm text-gray-500 mb-4">
                    One shared engine for both: a zone's live demand (active orders, or unmatched ride requests) outpacing its available riders drives the multiplier up — multiplied onto the flat delivery fee for food orders, or onto the computed trip fare for cab/parcel rides. Zones come from{' '}
                    <a href="/qdos/locations" className="underline">
                        Locations
                    </a>
                    ; override thresholds/caps per-city there, or below in the live status tables. (Ride Fares&apos; old &quot;Max Surge Multiplier&quot; field is no longer used — this page replaces it for both order types.)
                </p>

                {loading ? (
                    <div className="text-gray-500">Loading...</div>
                ) : (
                    <form className="grid grid-cols-2 gap-4" onSubmit={handleSave}>
                        <div className="input-field flex items-center gap-2 col-span-2">
                            <input type="checkbox" checked={settings.enabled} onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })} />
                            <label>Surge pricing enabled globally</label>
                        </div>

                        <div className="input-field">
                            <label>Base Delivery Fee (₹)</label>
                            <input
                                type="number"
                                min={0}
                                className="w-full border border-gray-300 rounded-md"
                                value={settings.baseDeliveryFee}
                                onChange={(e) => setSettings({ ...settings, baseDeliveryFee: Number(e.target.value) })}
                            />
                            <p className="text-xs text-gray-400 mt-1">What the customer is charged for delivery, before surge.</p>
                        </div>

                        <div className="input-field">
                            <label>Rider Base Fare (₹)</label>
                            <input
                                type="number"
                                min={0}
                                className="w-full border border-gray-300 rounded-md"
                                value={settings.riderBaseFare}
                                onChange={(e) => setSettings({ ...settings, riderBaseFare: Number(e.target.value) })}
                            />
                            <p className="text-xs text-gray-400 mt-1">What the rider earns per delivery, before distance and surge. Separate from the customer's fee above.</p>
                        </div>

                        <div className="input-field">
                            <label>Rider Per-Km Rate (₹)</label>
                            <input
                                type="number"
                                min={0}
                                className="w-full border border-gray-300 rounded-md"
                                value={settings.riderPerKmRate}
                                onChange={(e) => setSettings({ ...settings, riderPerKmRate: Number(e.target.value) })}
                            />
                            <p className="text-xs text-gray-400 mt-1">Added per km of delivery distance to the rider's payout. Both rider fields scale with the same surge multiplier as the customer's delivery fee, so riders earn more exactly when a zone is surging.</p>
                        </div>

                        <div className="input-field">
                            <label>Max Multiplier</label>
                            <input
                                type="number"
                                min={1}
                                step="0.1"
                                className="w-full border border-gray-300 rounded-md"
                                value={settings.maxMultiplier}
                                onChange={(e) => setSettings({ ...settings, maxMultiplier: Number(e.target.value) })}
                            />
                        </div>

                        <div className="input-field">
                            <label>Max Additional Fee (₹, blank = no cap)</label>
                            <input
                                type="number"
                                min={0}
                                className="w-full border border-gray-300 rounded-md"
                                value={settings.maxAdditionalFee ?? ''}
                                onChange={(e) => setSettings({ ...settings, maxAdditionalFee: e.target.value === '' ? null : Number(e.target.value) })}
                            />
                        </div>

                        <div className="input-field">
                            <label>Minimum Demand For Surge (active orders)</label>
                            <input
                                type="number"
                                min={0}
                                className="w-full border border-gray-300 rounded-md"
                                value={settings.minDemandForSurge}
                                onChange={(e) => setSettings({ ...settings, minDemandForSurge: Number(e.target.value) })}
                            />
                        </div>

                        <div className="input-field">
                            <label>Rolling Demand Window (minutes)</label>
                            <input
                                type="number"
                                min={1}
                                className="w-full border border-gray-300 rounded-md"
                                value={settings.rollingWindowMinutes}
                                onChange={(e) => setSettings({ ...settings, rollingWindowMinutes: Number(e.target.value) })}
                            />
                        </div>

                        <div className="input-field">
                            <label>Rider Location Freshness (minutes)</label>
                            <input
                                type="number"
                                min={1}
                                className="w-full border border-gray-300 rounded-md"
                                value={settings.riderFreshnessMinutes}
                                onChange={(e) => setSettings({ ...settings, riderFreshnessMinutes: Number(e.target.value) })}
                            />
                        </div>

                        <div className="input-field">
                            <label>Stability Period (minutes, hysteresis)</label>
                            <input
                                type="number"
                                min={0}
                                className="w-full border border-gray-300 rounded-md"
                                value={settings.stabilityPeriodMinutes}
                                onChange={(e) => setSettings({ ...settings, stabilityPeriodMinutes: Number(e.target.value) })}
                            />
                        </div>

                        <div className="input-field">
                            <label>Quote Validity (seconds)</label>
                            <input
                                type="number"
                                min={30}
                                className="w-full border border-gray-300 rounded-md"
                                value={settings.quoteValiditySeconds}
                                onChange={(e) => setSettings({ ...settings, quoteValiditySeconds: Number(e.target.value) })}
                            />
                        </div>

                        <div className="input-field">
                            <label>Recompute Interval (seconds, informational — actual cron is fixed at 2 min)</label>
                            <input
                                type="number"
                                min={30}
                                className="w-full border border-gray-300 rounded-md"
                                value={settings.updateIntervalSeconds}
                                onChange={(e) => setSettings({ ...settings, updateIntervalSeconds: Number(e.target.value) })}
                            />
                        </div>

                        <div className="col-span-2 border-t pt-4">
                            <div className="flex items-center justify-between mb-2">
                                <label className="font-medium">Demand/Supply Ratio Thresholds</label>
                                <button type="button" className="text-xs underline text-blue-600" onClick={addThreshold}>
                                    + Add tier
                                </button>
                            </div>
                            <div className="grid gap-2">
                                {settings.thresholds.map((t, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 w-20">Ratio ≥</span>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="w-24 border border-gray-300 rounded-md"
                                            value={t.ratio}
                                            onChange={(e) => updateThreshold(i, 'ratio', Number(e.target.value))}
                                        />
                                        <span className="text-xs text-gray-500">→ multiplier</span>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min={1}
                                            className="w-24 border border-gray-300 rounded-md"
                                            value={t.multiplier}
                                            onChange={(e) => updateThreshold(i, 'multiplier', Number(e.target.value))}
                                        />
                                        <button type="button" className="text-xs text-red-600 underline" onClick={() => removeThreshold(i)}>
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="col-span-2">
                            <button disabled={saving} className="submit-btn" type="submit">
                                {saving ? 'Wait...' : 'Save Settings'}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <div className="panel" id="city-override-panel">
                <h2 className="text-lg font-semibold mb-1">City-Specific Overrides</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Override any of the global settings above for one specific city — applies to both delivery and rides there. Leave a field blank to inherit the global value.
                </p>

                <form className="flex flex-wrap items-end gap-3 mb-4" onSubmit={handleCitySearch}>
                    <div className="input-field flex-1 min-w-[200px]">
                        <label>Find a city</label>
                        <input
                            type="text"
                            placeholder="Search by name..."
                            className="w-full border border-gray-300 rounded-md"
                            value={citySearch}
                            onChange={(e) => setCitySearch(e.target.value)}
                        />
                    </div>
                    <button disabled={citySearching} className="submit-btn" type="submit">
                        {citySearching ? 'Wait...' : 'Search'}
                    </button>
                </form>

                {citySearchResults.length > 0 && (
                    <div className="border border-gray-200 rounded-md mb-4 max-h-48 overflow-y-auto">
                        {citySearchResults.map((c: any) => (
                            <div
                                key={c._id}
                                className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                onClick={() => selectCity(c)}
                            >
                                {c.name} {c.stateId?.name ? <span className="text-gray-400">({c.stateId.name})</span> : null}
                            </div>
                        ))}
                    </div>
                )}

                {overrideLoading ? (
                    <div className="text-gray-500">Loading city...</div>
                ) : selectedCity ? (
                    <form className="grid grid-cols-2 gap-4 border-t pt-4" onSubmit={handleSaveOverride}>
                        <div className="col-span-2 flex items-center justify-between">
                            <div className="font-medium">
                                Editing: {selectedCity.name} {selectedCity.stateId?.name ? `(${selectedCity.stateId.name})` : ''}
                            </div>
                            <div className="flex gap-3">
                                <button type="button" className="text-xs underline text-gray-500" onClick={clearOverride}>
                                    Reset all to inherit global
                                </button>
                                <button type="button" className="text-xs underline text-red-600" onClick={() => setSelectedCity(null)}>
                                    Close
                                </button>
                            </div>
                        </div>

                        <div className="input-field">
                            <label>Surge Enabled For This City</label>
                            <select
                                className="w-full border border-gray-300 rounded-md"
                                value={cityOverride.enabled === null || cityOverride.enabled === undefined ? '' : String(cityOverride.enabled)}
                                onChange={(e) => setCityOverride({ ...cityOverride, enabled: e.target.value === '' ? null : e.target.value === 'true' })}
                            >
                                <option value="">Inherit global</option>
                                <option value="true">Enabled</option>
                                <option value="false">Disabled</option>
                            </select>
                        </div>

                        <div className="input-field">
                            <label>Base Delivery Fee (₹, blank = inherit)</label>
                            <input
                                type="number"
                                min={0}
                                className="w-full border border-gray-300 rounded-md"
                                value={cityOverride.baseDeliveryFee ?? ''}
                                onChange={(e) => setCityOverride({ ...cityOverride, baseDeliveryFee: e.target.value === '' ? null : Number(e.target.value) })}
                            />
                        </div>

                        <div className="input-field">
                            <label>Max Multiplier (blank = inherit)</label>
                            <input
                                type="number"
                                min={1}
                                step="0.1"
                                className="w-full border border-gray-300 rounded-md"
                                value={cityOverride.maxMultiplier ?? ''}
                                onChange={(e) => setCityOverride({ ...cityOverride, maxMultiplier: e.target.value === '' ? null : Number(e.target.value) })}
                            />
                        </div>

                        <div className="input-field">
                            <label>Max Additional Fee (₹, blank = inherit)</label>
                            <input
                                type="number"
                                min={0}
                                className="w-full border border-gray-300 rounded-md"
                                value={cityOverride.maxAdditionalFee ?? ''}
                                onChange={(e) => setCityOverride({ ...cityOverride, maxAdditionalFee: e.target.value === '' ? null : Number(e.target.value) })}
                            />
                        </div>

                        <div className="input-field">
                            <label>Minimum Demand For Surge (blank = inherit)</label>
                            <input
                                type="number"
                                min={0}
                                className="w-full border border-gray-300 rounded-md"
                                value={cityOverride.minDemandForSurge ?? ''}
                                onChange={(e) => setCityOverride({ ...cityOverride, minDemandForSurge: e.target.value === '' ? null : Number(e.target.value) })}
                            />
                        </div>

                        <div className="col-span-2">
                            <button disabled={overrideSaving} className="submit-btn" type="submit">
                                {overrideSaving ? 'Wait...' : 'Save Override'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="text-sm text-gray-400">Search for a city above to view or edit its override.</div>
                )}
            </div>

            <div className="panel">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Live Zone Status — Delivery</h2>
                    <button className="text-xs underline text-blue-600" onClick={fetchStatus}>
                        Refresh
                    </button>
                </div>
                <div className="table-wrapper overflow-x-auto">
                    <table className="data-table w-full">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="px-4 py-3 text-left">Zone</th>
                                <th className="px-4 py-3 text-left">Enabled</th>
                                <th className="px-4 py-3 text-left">Demand</th>
                                <th className="px-4 py-3 text-left">Riders</th>
                                <th className="px-4 py-3 text-left">Ratio</th>
                                <th className="px-4 py-3 text-left">Raw Multiplier</th>
                                <th className="px-4 py-3 text-left">Served Multiplier</th>
                                <th className="px-4 py-3 text-left">Last Computed</th>
                                <th className="px-4 py-3 text-left">Override</th>
                            </tr>
                        </thead>
                        <tbody>
                            {statusLoading ? (
                                <tr>
                                    <td className="px-4 py-3" colSpan={9}>
                                        <div className="w-full rounded h-5 bg-gray-200 animate-pulse" />
                                    </td>
                                </tr>
                            ) : status.length === 0 ? (
                                <tr>
                                    <td className="px-4 py-6 text-center text-gray-400 text-sm" colSpan={9}>
                                        No active zones — add one on the Locations page.
                                    </td>
                                </tr>
                            ) : (
                                status.map((s: any) => (
                                    <tr key={s.cityId} className="border-b last:border-b-0">
                                        <td className="px-4 py-3 font-medium">{s.cityName}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${s.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {s.enabled ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{s.demand ?? '-'}</td>
                                        <td className="px-4 py-3">{s.supply ?? '-'}</td>
                                        <td className="px-4 py-3">{s.ratio != null ? s.ratio.toFixed(2) : '-'}</td>
                                        <td className="px-4 py-3">{s.rawMultiplier != null ? `${s.rawMultiplier}x` : '-'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${s.servedMultiplier > 1 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {s.servedMultiplier}x
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500">{s.lastComputedAt ? new Date(s.lastComputedAt).toLocaleTimeString() : 'never'}</td>
                                        <td className="px-4 py-3">
                                            <button type="button" className="text-xs underline text-blue-600" onClick={() => jumpToOverride(s.cityId, s.cityName)}>
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="panel">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Live Pool Status — Cab &amp; Parcel Rides</h2>
                    <button className="text-xs underline text-blue-600" onClick={fetchRideStatus}>
                        Refresh
                    </button>
                </div>
                <p className="text-xs text-gray-500 mb-3">One row per zone × vehicle type × booking type — cab and parcel draw from separate rider pools even for the same vehicle.</p>
                <div className="table-wrapper overflow-x-auto">
                    <table className="data-table w-full">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="px-4 py-3 text-left">Zone</th>
                                <th className="px-4 py-3 text-left">Vehicle</th>
                                <th className="px-4 py-3 text-left">Booking</th>
                                <th className="px-4 py-3 text-left">Demand</th>
                                <th className="px-4 py-3 text-left">Riders</th>
                                <th className="px-4 py-3 text-left">Ratio</th>
                                <th className="px-4 py-3 text-left">Raw Multiplier</th>
                                <th className="px-4 py-3 text-left">Served Multiplier</th>
                                <th className="px-4 py-3 text-left">Last Computed</th>
                                <th className="px-4 py-3 text-left">Override</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rideStatusLoading ? (
                                <tr>
                                    <td className="px-4 py-3" colSpan={10}>
                                        <div className="w-full rounded h-5 bg-gray-200 animate-pulse" />
                                    </td>
                                </tr>
                            ) : rideStatus.length === 0 ? (
                                <tr>
                                    <td className="px-4 py-6 text-center text-gray-400 text-sm" colSpan={10}>
                                        No pools computed yet — these fill in as rides get booked or the next 2-minute recompute runs.
                                    </td>
                                </tr>
                            ) : (
                                rideStatus.map((s: any, i: number) => (
                                    <tr key={`${s.cityId}-${s.vehicleType}-${s.bookingType}-${i}`} className="border-b last:border-b-0">
                                        <td className="px-4 py-3 font-medium">{s.cityName}</td>
                                        <td className="px-4 py-3">{s.vehicleType}</td>
                                        <td className="px-4 py-3">{s.bookingType}</td>
                                        <td className="px-4 py-3">{s.demand ?? '-'}</td>
                                        <td className="px-4 py-3">{s.supply ?? '-'}</td>
                                        <td className="px-4 py-3">{s.ratio != null ? s.ratio.toFixed(2) : '-'}</td>
                                        <td className="px-4 py-3">{s.rawMultiplier != null ? `${s.rawMultiplier}x` : '-'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${s.servedMultiplier > 1 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {s.servedMultiplier}x
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500">{s.lastComputedAt ? new Date(s.lastComputedAt).toLocaleTimeString() : 'never'}</td>
                                        <td className="px-4 py-3">
                                            <button type="button" className="text-xs underline text-blue-600" onClick={() => jumpToOverride(s.cityId, s.cityName)}>
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="panel">
                <h2 className="text-lg font-semibold mb-4">Preview Fee For A Test Location</h2>
                <form className="flex flex-wrap items-end gap-3" onSubmit={handlePreview}>
                    <div className="input-field">
                        <label>Latitude</label>
                        <input type="number" step="any" className="border border-gray-300 rounded-md" value={previewLat} onChange={(e) => setPreviewLat(e.target.value)} />
                    </div>
                    <div className="input-field">
                        <label>Longitude</label>
                        <input type="number" step="any" className="border border-gray-300 rounded-md" value={previewLng} onChange={(e) => setPreviewLng(e.target.value)} />
                    </div>
                    <button disabled={previewLoading} className="submit-btn" type="submit">
                        {previewLoading ? 'Wait...' : 'Preview'}
                    </button>
                </form>

                {previewResult && (
                    <div className="mt-4 rounded-md border border-gray-200 p-3 text-sm grid gap-1">
                        <div>
                            Zone: <span className="font-medium">{previewResult.matchedZone ? previewResult.cityName : 'No zone matched — flat default fee'}</span>
                        </div>
                        <div>Normal Delivery Fee: ₹{previewResult.normalDeliveryFee}</div>
                        <div>Surge Multiplier: {previewResult.surgeMultiplier}x</div>
                        <div className="font-medium">Surge-Adjusted Delivery Fee: ₹{previewResult.surgeAdjustedDeliveryFee}</div>
                    </div>
                )}
            </div>

            <div className="panel">
                <h2 className="text-lg font-semibold mb-4">Recent Configuration Changes</h2>
                <div className="table-wrapper overflow-x-auto">
                    <table className="data-table w-full">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="px-4 py-3 text-left">When</th>
                                <th className="px-4 py-3 text-left">Scope</th>
                                <th className="px-4 py-3 text-left">Changed By</th>
                                <th className="px-4 py-3 text-left">Changes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {auditLoading ? (
                                <tr>
                                    <td className="px-4 py-3" colSpan={4}>
                                        <div className="w-full rounded h-5 bg-gray-200 animate-pulse" />
                                    </td>
                                </tr>
                            ) : audit.length === 0 ? (
                                <tr>
                                    <td className="px-4 py-6 text-center text-gray-400 text-sm" colSpan={4}>
                                        No changes yet.
                                    </td>
                                </tr>
                            ) : (
                                audit.map((a: any) => (
                                    <tr key={a._id} className="border-b last:border-b-0">
                                        <td className="px-4 py-3 text-xs text-gray-500">{new Date(a.createdAt).toLocaleString()}</td>
                                        <td className="px-4 py-3">{a.scope === 'CITY' ? `City: ${a.cityId?.name || a.cityId}` : 'Global'}</td>
                                        <td className="px-4 py-3">{a.changedBy?.name || a.changedBy?.phone || '-'}</td>
                                        <td className="px-4 py-3 text-xs">
                                            {Object.entries(a.changes || {}).map(([field, diff]: any) => (
                                                <div key={field}>
                                                    <span className="font-medium">{field}</span>: {JSON.stringify(diff.from)} → {JSON.stringify(diff.to)}
                                                </div>
                                            ))}
                                        </td>
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
