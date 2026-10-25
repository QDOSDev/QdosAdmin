import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import { getParcelPricingTiers, updateParcelPricingTier, ParcelWeightBucket } from '../../../services/qdosApi';

interface Tier {
    weightBucket: ParcelWeightBucket;
    label: string;
    surchargeAmount: number;
    isActive: boolean;
}

export default function ParcelPricingList() {
    const [tiers, setTiers] = useState<Tier[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingBucket, setSavingBucket] = useState<string | null>(null);

    const fetchTiers = async () => {
        setLoading(true);
        try {
            const res = await getParcelPricingTiers();
            setTiers(res?.data || []);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to fetch parcel pricing tiers.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTiers();
    }, []);

    const updateLocal = (weightBucket: string, patch: Partial<Tier>) => {
        setTiers((prev) => prev.map((t) => (t.weightBucket === weightBucket ? { ...t, ...patch } : t)));
    };

    const handleSave = async (tier: Tier) => {
        setSavingBucket(tier.weightBucket);
        try {
            await updateParcelPricingTier(tier.weightBucket, {
                surchargeAmount: tier.surchargeAmount,
                isActive: tier.isActive,
            });
            message.success(`${tier.label} surcharge saved.`);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to save this tier.');
        }
        setSavingBucket(null);
    };

    return (
        <div className="panel">
            <h2 className="text-lg font-semibold mb-1">Parcel Pricing</h2>
            <p className="text-sm text-gray-500 mb-4">
                Flat surcharge added on top of the normal distance/time ride fare for a PARCEL booking in each weight bucket, so heavier packages cost more. Only affects bookings placed after you save; an existing ride's fare is already frozen.
            </p>

            <div className="table-wrapper overflow-x-auto">
                <table className="data-table w-full">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="px-4 py-3 text-left">Weight Bucket</th>
                            <th className="px-4 py-3 text-left">Surcharge (₹)</th>
                            <th className="px-4 py-3 text-left">Active</th>
                            <th className="px-4 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(4)].map((_, i) => (
                                <tr key={i} className="border-b">
                                    <td className="px-4 py-3" colSpan={4}>
                                        <div className="w-full rounded h-5 bg-gray-200 animate-pulse" />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            tiers.map((t) => (
                                <tr key={t.weightBucket} className="border-b last:border-b-0">
                                    <td className="px-4 py-3 font-medium">{t.label}</td>
                                    <td className="px-4 py-3">
                                        <input
                                            type="number"
                                            min={0}
                                            className="w-32 border border-gray-300 rounded-md"
                                            value={t.surchargeAmount}
                                            onChange={(e) => updateLocal(t.weightBucket, { surchargeAmount: Number(e.target.value) })}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={t.isActive}
                                            onChange={(e) => updateLocal(t.weightBucket, { isActive: e.target.checked })}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            className="submit-btn"
                                            disabled={savingBucket === t.weightBucket}
                                            onClick={() => handleSave(t)}
                                        >
                                            {savingBucket === t.weightBucket ? 'Wait...' : 'Save'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
