import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import Swal from 'sweetalert2';
import { Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from '@nextui-org/react';
import Edit from '../../../../public/assets/APSIcon/Edit';
import Delete from '../../../../public/assets/APSIcon/delect';
import Tableempty from '../../Tableempty';
import { getStates, createState, deleteState, getCities, createCity, updateCity, deleteCity, setCityRideBan } from '../../../services/qdosApi';

const emptyStateForm = { name: '', code: '' };
const emptyCityForm = { name: '', stateId: '', lat: '', lng: '', radiusKm: '30' };

export default function LocationList() {
    const [states, setStates] = useState<any[]>([]);
    const [statesLoading, setStatesLoading] = useState(true);
    const stateModal = useDisclosure();
    const [stateForm, setStateForm] = useState(emptyStateForm);
    const [isSubmittingState, setIsSubmittingState] = useState(false);

    const [cities, setCities] = useState<any[]>([]);
    const [citiesLoading, setCitiesLoading] = useState(true);
    const [stateFilter, setStateFilter] = useState('');
    const [citySearch, setCitySearch] = useState('');
    const [cityPage, setCityPage] = useState(1);
    const [cityTotalPages, setCityTotalPages] = useState(1);
    const [cityTotal, setCityTotal] = useState(0);
    const cityModal = useDisclosure();
    const [editingCityId, setEditingCityId] = useState<string | null>(null);
    const [cityForm, setCityForm] = useState(emptyCityForm);
    const [isSubmittingCity, setIsSubmittingCity] = useState(false);

    const fetchStates = async () => {
        setStatesLoading(true);
        try {
            const res = await getStates();
            setStates(res?.data || []);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to fetch states.');
        }
        setStatesLoading(false);
    };

    const fetchCities = async (page = 1) => {
        setCitiesLoading(true);
        try {
            const res = await getCities({ stateId: stateFilter || undefined, q: citySearch || undefined, page, limit: 10 });
            setCities(res?.cities || []);
            setCityPage(res?.currentPage || page);
            setCityTotalPages(res?.totalPages || 1);
            setCityTotal(res?.totalCities || 0);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to fetch cities.');
        }
        setCitiesLoading(false);
    };

    useEffect(() => {
        fetchStates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchCities(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stateFilter, citySearch]);

    // ---- States ----

    const openCreateStateModal = () => {
        setStateForm(emptyStateForm);
        stateModal.onOpen();
    };

    const handleStateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingState(true);
        try {
            await createState(stateForm);
            message.success('State created.');
            stateModal.onClose();
            fetchStates();
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to save state.');
        }
        setIsSubmittingState(false);
    };

    const handleDeleteState = (state: any) => {
        Swal.fire({
            title: `Delete ${state.name}?`,
            text: 'This is blocked if any city still belongs to this state.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it',
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                await deleteState(state._id);
                message.success('State deleted.');
                fetchStates();
            } catch (error: any) {
                message.error(error?.response?.data?.message || 'Failed to delete state.');
            }
        });
    };

    // ---- Cities ----

    const openCreateCityModal = () => {
        setEditingCityId(null);
        setCityForm({ ...emptyCityForm, stateId: stateFilter || states[0]?._id || '' });
        cityModal.onOpen();
    };

    const openEditCityModal = (city: any) => {
        setEditingCityId(city._id);
        setCityForm({
            name: city.name || '',
            stateId: city.stateId?._id || city.stateId || '',
            lat: String(city.location?.coordinates?.[1] ?? ''),
            lng: String(city.location?.coordinates?.[0] ?? ''),
            radiusKm: String(city.radiusKm ?? '30'),
        });
        cityModal.onOpen();
    };

    const handleCitySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingCity(true);
        try {
            const payload = {
                name: cityForm.name,
                stateId: cityForm.stateId,
                location: { lat: Number(cityForm.lat), lng: Number(cityForm.lng) },
                radiusKm: Number(cityForm.radiusKm) || 30,
            };
            if (editingCityId) {
                await updateCity(editingCityId, payload);
                message.success('City updated.');
            } else {
                await createCity(payload);
                message.success('City created.');
            }
            cityModal.onClose();
            // stay on the current page when editing; a brand new city could
            // alphabetically sort anywhere, so just reset to page 1 for that
            fetchCities(editingCityId ? cityPage : 1);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to save city.');
        }
        setIsSubmittingCity(false);
    };

    const handleDeleteCity = (city: any) => {
        Swal.fire({
            title: `Delete ${city.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it',
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                await deleteCity(city._id);
                message.success('City deleted.');
                fetchCities(cityPage);
            } catch (error: any) {
                message.error(error?.response?.data?.message || 'Failed to delete city.');
            }
        });
    };

    const handleToggleRideBan = (city: any) => {
        if (city.ridesBanned) {
            Swal.fire({
                title: `Lift ride ban for ${city.name}?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: getComputedStyle(document.documentElement).getPropertyValue('--yellow-color').trim(),
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Yes, unban',
            }).then(async (result) => {
                if (!result.isConfirmed) return;
                try {
                    await setCityRideBan(city._id, false);
                    message.success('Ride ban lifted.');
                    fetchCities(cityPage);
                } catch (error: any) {
                    message.error(error?.response?.data?.message || 'Failed to lift ride ban.');
                }
            });
            return;
        }

        Swal.fire({
            title: `Ban rides in ${city.name}?`,
            text: 'New cab ride bookings with a pickup point in this city will be rejected. Food delivery is unaffected.',
            icon: 'warning',
            input: 'text',
            inputLabel: 'Reason',
            inputValidator: (value) => (!value ? 'A reason is required' : undefined),
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ban rides',
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                await setCityRideBan(city._id, true, result.value);
                message.success('Rides banned in this city.');
                fetchCities(cityPage);
            } catch (error: any) {
                message.error(error?.response?.data?.message || 'Failed to ban rides.');
            }
        });
    };

    return (
        <div className="grid gap-6">
            <div className="panel">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold">States</h2>
                        <p className="text-sm text-gray-500">Feeds the state dropdown when creating a city below.</p>
                    </div>
                    <button className="submit-btn" onClick={openCreateStateModal}>
                        + New State
                    </button>
                </div>

                <div className="table-wrapper overflow-x-auto">
                    <table className="data-table w-full">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="px-4 py-3 text-left">Name</th>
                                <th className="px-4 py-3 text-left">Code</th>
                                <th className="px-4 py-3 text-left">Active</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {statesLoading ? (
                                [...Array(3)].map((_, i) => (
                                    <tr key={i} className="border-b">
                                        <td className="px-4 py-3" colSpan={4}>
                                            <div className="w-full rounded h-5 bg-gray-200 animate-pulse" />
                                        </td>
                                    </tr>
                                ))
                            ) : states.length === 0 ? (
                                <Tableempty length={4} />
                            ) : (
                                states.map((s: any) => (
                                    <tr key={s._id} className="border-b last:border-b-0 hover:shadow-sm">
                                        <td className="px-4 py-3 font-medium">{s.name}</td>
                                        <td className="px-4 py-3">{s.code || '-'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {s.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="cursor-pointer" onClick={() => handleDeleteState(s)}>
                                                <Delete className="h-5 w-5 text-gray-500" />
                                            </span>
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
                    <div>
                        <h2 className="text-lg font-semibold">Cities</h2>
                        <p className="text-sm text-gray-500">Each city's location + radius defines its service zone, used for city-scoped ride pricing and the ride ban below.</p>
                    </div>
                    <button className="submit-btn" onClick={openCreateCityModal} disabled={states.length === 0}>
                        + New City
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <select className="border border-gray-300 rounded-md px-3 py-2" value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
                        <option value="">All states</option>
                        {states.map((s: any) => (
                            <option key={s._id} value={s._id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                    <input
                        type="text"
                        className="border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Search city name..."
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                    />
                    <span className="text-sm text-gray-500">{cityTotal} total</span>
                </div>

                <div className="table-wrapper overflow-x-auto">
                    <table className="data-table w-full">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="px-4 py-3 text-left">Name</th>
                                <th className="px-4 py-3 text-left">State</th>
                                <th className="px-4 py-3 text-left">Location</th>
                                <th className="px-4 py-3 text-left">Radius</th>
                                <th className="px-4 py-3 text-left">Rides</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {citiesLoading ? (
                                [...Array(3)].map((_, i) => (
                                    <tr key={i} className="border-b">
                                        <td className="px-4 py-3" colSpan={6}>
                                            <div className="w-full rounded h-5 bg-gray-200 animate-pulse" />
                                        </td>
                                    </tr>
                                ))
                            ) : cities.length === 0 ? (
                                <Tableempty length={6} />
                            ) : (
                                cities.map((c: any) => (
                                    <tr key={c._id} className="border-b last:border-b-0 hover:shadow-sm">
                                        <td className="px-4 py-3 font-medium">{c.name}</td>
                                        <td className="px-4 py-3">{c.stateId?.name || '-'}</td>
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {c.location?.coordinates?.[1]?.toFixed(4)}, {c.location?.coordinates?.[0]?.toFixed(4)}
                                        </td>
                                        <td className="px-4 py-3">{c.radiusKm} km</td>
                                        <td className="px-4 py-3">
                                            <button
                                                className={`px-2 py-1 rounded-md text-xs font-medium ${c.ridesBanned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                                                onClick={() => handleToggleRideBan(c)}
                                                title={c.ridesBanned ? c.ridesBanReason : undefined}
                                            >
                                                {c.ridesBanned ? 'Banned' : 'Allowed'}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-3">
                                                <span className="cursor-pointer" onClick={() => openEditCityModal(c)}>
                                                    <Edit className="h-5 w-5 text-gray-500" />
                                                </span>
                                                <span className="cursor-pointer" onClick={() => handleDeleteCity(c)}>
                                                    <Delete className="h-5 w-5 text-gray-500" />
                                                </span>
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
                        <button className="pagination-button" disabled={cityPage <= 1} onClick={() => fetchCities(cityPage - 1)}>
                            ‹ Prev
                        </button>
                        <span className="px-3 text-sm text-gray-600">
                            Page {cityPage} of {cityTotalPages}
                        </span>
                        <button className="pagination-button" disabled={cityPage >= cityTotalPages} onClick={() => fetchCities(cityPage + 1)}>
                            Next ›
                        </button>
                    </div>
                </div>
            </div>

            <Modal isOpen={stateModal.isOpen} onOpenChange={stateModal.onOpenChange} size="md">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>New State</ModalHeader>
                            <ModalBody>
                                <form className="grid gap-4 pb-4" onSubmit={handleStateSubmit}>
                                    <div className="input-field">
                                        <label>
                                            Name <span className="text-red-500">*</span>
                                        </label>
                                        <input required className="w-full border border-gray-300 rounded-md" value={stateForm.name} onChange={(e) => setStateForm({ ...stateForm, name: e.target.value })} />
                                    </div>
                                    <div className="input-field">
                                        <label>Code</label>
                                        <input className="w-full border border-gray-300 rounded-md" value={stateForm.code} onChange={(e) => setStateForm({ ...stateForm, code: e.target.value })} placeholder="e.g. DL" />
                                    </div>
                                    <div className="flex justify-start gap-2 mt-2">
                                        <button type="button" className="Close-btn" onClick={onClose}>
                                            Cancel
                                        </button>
                                        <button disabled={isSubmittingState} className="submit-btn" type="submit">
                                            {isSubmittingState ? 'Wait...' : 'Save'}
                                        </button>
                                    </div>
                                </form>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <Modal isOpen={cityModal.isOpen} onOpenChange={cityModal.onOpenChange} size="lg">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>{editingCityId ? 'Edit City' : 'New City'}</ModalHeader>
                            <ModalBody>
                                <form className="grid grid-cols-2 gap-4 pb-4" onSubmit={handleCitySubmit}>
                                    <div className="input-field">
                                        <label>
                                            Name <span className="text-red-500">*</span>
                                        </label>
                                        <input required className="w-full border border-gray-300 rounded-md" value={cityForm.name} onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })} />
                                    </div>
                                    <div className="input-field">
                                        <label>
                                            State <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            required
                                            className="w-full border border-gray-300 rounded-md"
                                            value={cityForm.stateId}
                                            onChange={(e) => setCityForm({ ...cityForm, stateId: e.target.value })}
                                        >
                                            <option value="">Select a state</option>
                                            {states.map((s: any) => (
                                                <option key={s._id} value={s._id}>
                                                    {s.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="input-field">
                                        <label>
                                            Latitude <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            required
                                            type="number"
                                            step="any"
                                            className="w-full border border-gray-300 rounded-md"
                                            value={cityForm.lat}
                                            onChange={(e) => setCityForm({ ...cityForm, lat: e.target.value })}
                                            placeholder="28.6139"
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>
                                            Longitude <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            required
                                            type="number"
                                            step="any"
                                            className="w-full border border-gray-300 rounded-md"
                                            value={cityForm.lng}
                                            onChange={(e) => setCityForm({ ...cityForm, lng: e.target.value })}
                                            placeholder="77.2090"
                                        />
                                    </div>
                                    <div className="input-field col-span-2">
                                        <label>Service radius (km)</label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded-md"
                                            value={cityForm.radiusKm}
                                            onChange={(e) => setCityForm({ ...cityForm, radiusKm: e.target.value })}
                                        />
                                        <p className="text-xs text-gray-400 mt-1">A ride's pickup point within this radius of the center point above is treated as being in this city.</p>
                                    </div>
                                    <div className="flex justify-start gap-2 mt-2 col-span-2">
                                        <button type="button" className="Close-btn" onClick={onClose}>
                                            Cancel
                                        </button>
                                        <button disabled={isSubmittingCity} className="submit-btn" type="submit">
                                            {isSubmittingCity ? 'Wait...' : 'Save'}
                                        </button>
                                    </div>
                                </form>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
