import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import { getPlatformWallet, topUpPlatformWallet } from '../../../services/qdosApi';

export default function PlatformWallet() {
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState<number | null>(null);
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchBalance = async () => {
        setLoading(true);
        try {
            const res = await getPlatformWallet();
            setBalance(res?.data?.balance ?? 0);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to fetch wallet balance.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchBalance();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await topUpPlatformWallet(Number(amount));
            setBalance(res?.data?.balance ?? null);
            message.success('Platform wallet topped up.');
            setAmount('');
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to top up wallet.');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="panel max-w-xl">
            <h2 className="text-lg font-semibold mb-1">Platform Wallet</h2>
            <p className="text-sm text-gray-500 mb-4">
                The pool RIDE coupon discounts are funded from. When a passenger's fare is discounted by a coupon, the rider is still paid their full commission — the difference is debited from here
                automatically at booking time, and refunded here if that ride is cancelled before it completes. This is an internal ledger only; topping up does not charge any payment method.
            </p>

            {loading ? (
                <div className="text-gray-500">Loading...</div>
            ) : (
                <>
                    <div className="rounded-md border border-gray-200 p-4 mb-4">
                        <div className="text-xs text-gray-500 mb-1">Current balance</div>
                        <div className="text-2xl font-semibold">₹{balance ?? 0}</div>
                    </div>

                    <form className="grid gap-4" onSubmit={handleSubmit}>
                        <div className="input-field">
                            <label>
                                Add funds (₹) <span className="text-red-500">*</span>
                            </label>
                            <input
                                required
                                type="number"
                                min={1}
                                className="w-full border border-gray-300 rounded-md"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="e.g. 5000"
                            />
                        </div>
                        <div className="flex justify-start">
                            <button disabled={isSubmitting || !amount} className="submit-btn" type="submit">
                                {isSubmitting ? 'Wait...' : 'Top Up'}
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
}
