import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import { getRiderPlan, upsertRiderPlan } from '../../../services/qdosApi';

export default function RiderPlanForm() {
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<{ price: string; durationHours: string }>({ price: '', durationHours: '24' });
    const [currentPlan, setCurrentPlan] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchPlan = async () => {
        setLoading(true);
        try {
            const res = await getRiderPlan();
            setCurrentPlan(res?.data || null);
            if (res?.data) {
                setFormData({ price: String(res.data.price ?? ''), durationHours: String(res.data.durationHours ?? '24') });
            }
        } catch (error: any) {
            // 404 just means no plan has ever been set yet — not an error state to surface
            if (error?.response?.status !== 404) {
                message.error(error?.response?.data?.message || 'Failed to fetch the current plan.');
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPlan();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await upsertRiderPlan({
                price: Number(formData.price),
                durationHours: formData.durationHours ? Number(formData.durationHours) : undefined,
            });
            message.success('Rider plan saved.');
            fetchPlan();
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to save rider plan.');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="panel max-w-xl">
            <h2 className="text-lg font-semibold mb-1">Rider Recharge Plan</h2>
            <p className="text-sm text-gray-500 mb-4">
                The price and duration every rider pays to stay active on the platform. There is only one plan — saving here updates it for everyone.
            </p>

            {loading ? (
                <div className="text-gray-500">Loading...</div>
            ) : (
                <>
                    {currentPlan && (
                        <div className="rounded-md border border-gray-200 p-3 mb-4 text-sm">
                            <div className="font-medium mb-1">{currentPlan.name}</div>
                            <div className="text-gray-600">
                                ₹{currentPlan.price} for {currentPlan.durationHours} hours ·{' '}
                                <span className={currentPlan.isActive ? 'text-green-600' : 'text-gray-400'}>{currentPlan.isActive ? 'Active' : 'Inactive'}</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">Last updated {currentPlan.updatedAt ? new Date(currentPlan.updatedAt).toLocaleString() : '-'}</div>
                        </div>
                    )}

                    <form className="grid gap-4" onSubmit={handleSubmit}>
                        <div className="input-field">
                            <label>
                                Price (₹) <span className="text-red-500">*</span>
                            </label>
                            <input
                                required
                                type="number"
                                min={0}
                                className="w-full border border-gray-300 rounded-md"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                        <div className="input-field">
                            <label>Duration (hours)</label>
                            <input
                                type="number"
                                min={1}
                                className="w-full border border-gray-300 rounded-md"
                                value={formData.durationHours}
                                onChange={(e) => setFormData({ ...formData, durationHours: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-start">
                            <button disabled={isSubmitting || !formData.price} className="submit-btn" type="submit">
                                {isSubmitting ? 'Wait...' : 'Save Plan'}
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
}
