import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import Swal from 'sweetalert2';
import Tableempty from '../../Tableempty';
import { sendBroadcast, getBroadcasts, BroadcastPayload } from '../../../services/qdosApi';

const AUDIENCE_LABEL: Record<BroadcastPayload['audience'], string> = {
    USERS: 'All customers',
    PARTNERS: 'All partners',
    ALL: 'Customers & partners',
    PHONE: 'One phone number',
};

const emptyForm: BroadcastPayload = { title: '', message: '', category: 'ANNOUNCEMENT', audience: 'USERS', phone: '', linkUrl: '' };

export default function NotificationCenter() {
    const [form, setForm] = useState<BroadcastPayload>(emptyForm);
    const [sending, setSending] = useState(false);
    const [list, setList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const res = await getBroadcasts({ limit: 50 });
            setList(res?.data?.broadcasts || []);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to load sent notifications.');
        }
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const who = form.audience === 'PHONE' ? form.phone : AUDIENCE_LABEL[form.audience].toLowerCase();
        const confirm = await Swal.fire({
            title: 'Send this notification?',
            text: `"${form.title}" will be pushed to ${who}${form.category === 'OFFER' ? ' (except people who turned offers off)' : ''}. This can't be undone.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Send',
        });
        if (!confirm.isConfirmed) return;
        setSending(true);
        try {
            const res = await sendBroadcast({
                title: form.title.trim(),
                message: form.message.trim(),
                category: form.category,
                audience: form.audience,
                ...(form.audience === 'PHONE' && { phone: form.phone }),
                ...(form.linkUrl?.trim() && { linkUrl: form.linkUrl.trim() }),
            });
            message.success(`Sent to ${res?.data?.recipientCount ?? 0} people.`);
            setForm(emptyForm);
            load();
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to send.');
        }
        setSending(false);
    };

    return (
        <div className="panel">
            <div className="mb-4">
                <h2 className="text-lg font-semibold">Notifications</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Send an announcement or offer. It arrives as a push notification and stays in the app's Notifications screen. Order, ride and payment updates are sent automatically and also
                    appear there.
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                <form onSubmit={handleSend} className="xl:col-span-2 border border-gray-200 rounded-lg p-4 grid grid-cols-2 gap-4 content-start">
                    <div className="input-field col-span-2">
                        <label>
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            maxLength={100}
                            className="w-full border border-gray-300 rounded-md"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="e.g. Weekend offer: 20% off"
                            data-testid="bc-title"
                        />
                    </div>
                    <div className="input-field col-span-2">
                        <label>
                            Message <span className="text-red-500">*</span> <span className="text-gray-400 font-normal">({form.message.length}/500)</span>
                        </label>
                        <textarea
                            required
                            maxLength={500}
                            rows={3}
                            className="w-full border border-gray-300 rounded-md"
                            value={form.message}
                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                            data-testid="bc-message"
                        />
                    </div>
                    <div className="input-field">
                        <label>Type</label>
                        <select className="w-full border border-gray-300 rounded-md" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as any })} data-testid="bc-category">
                            <option value="ANNOUNCEMENT">Announcement (everyone)</option>
                            <option value="OFFER">Offer (respects "offers off")</option>
                        </select>
                    </div>
                    <div className="input-field">
                        <label>Send to</label>
                        <select className="w-full border border-gray-300 rounded-md" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value as any })} data-testid="bc-audience">
                            {Object.entries(AUDIENCE_LABEL).map(([k, v]) => (
                                <option key={k} value={k}>
                                    {v}
                                </option>
                            ))}
                        </select>
                    </div>
                    {form.audience === 'PHONE' && (
                        <div className="input-field col-span-2">
                            <label>
                                Phone number <span className="text-red-500">*</span>
                            </label>
                            <input
                                required
                                className="w-full border border-gray-300 rounded-md"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                placeholder="10-digit mobile number"
                                data-testid="bc-phone"
                            />
                        </div>
                    )}
                    <div className="input-field col-span-2">
                        <label>Link (optional)</label>
                        <input
                            className="w-full border border-gray-300 rounded-md"
                            value={form.linkUrl}
                            onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                            placeholder="Deep link the app opens on tap, e.g. qdos://food"
                        />
                    </div>
                    <div className="col-span-2 rounded-lg bg-gray-50 border border-gray-200 p-3">
                        <div className="text-xs text-gray-400 mb-1">Preview</div>
                        <div className="font-semibold text-sm">{form.title || 'Title'}</div>
                        <div className="text-sm text-gray-600">{form.message || 'Message'}</div>
                    </div>
                    <div className="col-span-2">
                        <button className="submit-btn" type="submit" disabled={sending} data-testid="bc-send">
                            {sending ? 'Sending…' : 'Send notification'}
                        </button>
                    </div>
                </form>

                <div className="xl:col-span-3">
                    <h3 className="font-semibold mb-2">Sent</h3>
                    <div className="table-wrapper overflow-x-auto">
                        <table className="data-table w-full">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="px-4 py-3 text-left">Notification</th>
                                    <th className="px-4 py-3 text-left">To</th>
                                    <th className="px-4 py-3 text-left">Sent to</th>
                                    <th className="px-4 py-3 text-left">Opened</th>
                                    <th className="px-4 py-3 text-left">When</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-3">
                                            <div className="h-5 rounded bg-gray-200 animate-pulse" />
                                        </td>
                                    </tr>
                                ) : list.length === 0 ? (
                                    <Tableempty length={5} />
                                ) : (
                                    list.map((b) => (
                                        <tr key={b._id} className="border-b last:border-b-0" data-testid={`bc-row-${b._id}`}>
                                            <td className="px-4 py-3 max-w-[280px]">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${b.category === 'OFFER' ? 'bg-yellow-50 text-yellow-800' : 'bg-blue-50 text-blue-700'}`}>
                                                        {b.category === 'OFFER' ? 'OFFER' : 'NEWS'}
                                                    </span>
                                                    <span className="font-medium truncate">{b.title}</span>
                                                </div>
                                                <div className="text-xs text-gray-500 truncate">{b.message}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm">{b.audience === 'PHONE' ? b.phone : AUDIENCE_LABEL[b.audience as BroadcastPayload['audience']]}</td>
                                            <td className="px-4 py-3">{b.recipientCount}</td>
                                            <td className="px-4 py-3">{b.readCount}</td>
                                            <td className="px-4 py-3 text-xs">
                                                {new Date(b.createdAt).toLocaleString()}
                                                <div className="text-gray-400">{b.createdBy?.name || b.createdBy?.email}</div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
