import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import { getPlatformSettings, updatePlatformSettings } from '../../../services/qdosApi';

export default function PlatformSettings() {
    const [loading, setLoading] = useState(true);
    const [gstPercentage, setGstPercentage] = useState('18');
    const [current, setCurrent] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await getPlatformSettings();
            setCurrent(res?.data || null);
            if (res?.data) {
                setGstPercentage(String(res.data.gstPercentage ?? '18'));
            }
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to fetch platform settings.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await updatePlatformSettings({ gstPercentage: Number(gstPercentage) });
            message.success('Platform settings saved.');
            fetchSettings();
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to save settings.');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="panel max-w-xl">
            <h2 className="text-lg font-semibold mb-1">Platform Settings</h2>
            <p className="text-sm text-gray-500 mb-4">
                Applied to every food order's subtotal (menu items only, not the delivery fee) when computing GST at checkout. Only affects orders placed after this is saved — an existing order's tax amount was already computed and frozen at checkout time.
            </p>

            {loading ? (
                <div className="text-gray-500">Loading...</div>
            ) : (
                <>
                    {current && (
                        <div className="rounded-md border border-gray-200 p-3 mb-4 text-sm">
                            <div className="text-gray-600">
                                Current GST rate: <span className="font-medium">{current.gstPercentage}%</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">Last updated {current.updatedAt ? new Date(current.updatedAt).toLocaleString() : '-'}</div>
                        </div>
                    )}

                    <form className="grid gap-4" onSubmit={handleSubmit}>
                        <div className="input-field">
                            <label>
                                GST (%) <span className="text-red-500">*</span>
                            </label>
                            <input
                                required
                                type="number"
                                min={0}
                                max={100}
                                step="0.01"
                                className="w-full border border-gray-300 rounded-md"
                                value={gstPercentage}
                                onChange={(e) => setGstPercentage(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-start">
                            <button disabled={isSubmitting || !gstPercentage} className="submit-btn" type="submit">
                                {isSubmitting ? 'Wait...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
}
