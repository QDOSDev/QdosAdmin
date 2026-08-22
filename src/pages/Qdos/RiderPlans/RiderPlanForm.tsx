import React, { useState } from 'react';
import { message } from 'antd';
import { upsertRiderPlan } from '../../../services/qdosApi';

export default function RiderPlanForm() {
    const [formData, setFormData] = useState<{ type: 'daily' | 'weekly' | 'monthly'; amount: number; featuresText: string }>({
        type: 'daily',
        amount: 0,
        featuresText: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const features = formData.featuresText
                .split('\n')
                .map((f) => f.trim())
                .filter(Boolean);
            await upsertRiderPlan({ type: formData.type, amount: Number(formData.amount), features });
            message.success('Rider plan saved.');
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to save rider plan.');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="panel max-w-xl">
            <h2 className="text-lg font-semibold mb-4">Rider Subscription Plan</h2>
            <form className="grid gap-4" onSubmit={handleSubmit}>
                <div className="input-field">
                    <label>Plan Type</label>
                    <select
                        className="w-full border border-gray-300 rounded-md"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'daily' | 'weekly' | 'monthly' })}
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>
                <div className="input-field">
                    <label>Amount</label>
                    <input
                        type="number"
                        className="w-full border border-gray-300 rounded-md"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    />
                </div>
                <div className="input-field">
                    <label>Features (one per line)</label>
                    <textarea
                        rows={4}
                        className="w-full border border-gray-300 rounded-md"
                        value={formData.featuresText}
                        onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                    />
                </div>
                <div className="flex justify-start">
                    <button disabled={isSubmitting} className="submit-btn" type="submit">
                        {isSubmitting ? 'Wait...' : 'Save Plan'}
                    </button>
                </div>
            </form>
        </div>
    );
}
