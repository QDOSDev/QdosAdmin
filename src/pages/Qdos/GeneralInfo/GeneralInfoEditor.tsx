import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import { getGeneralInfo, updateGeneralInfo, GeneralInfoContent, GeneralInfoFaq } from '../../../services/qdosApi';

type PageKey = 'aboutUs' | 'terms' | 'privacyPolicy' | 'refundPolicy' | 'partnerTerms';

const PAGES: { key: PageKey; title: string; where: string }[] = [
    { key: 'aboutUs', title: 'About Us', where: 'Both apps' },
    { key: 'terms', title: 'Terms & Conditions', where: 'Both apps' },
    { key: 'privacyPolicy', title: 'Privacy Policy', where: 'Both apps' },
    { key: 'refundPolicy', title: 'Refund & Cancellation Policy', where: 'Customer app' },
    { key: 'partnerTerms', title: 'Partner Terms', where: 'Partner app' },
];

const AUDIENCE_LABEL: Record<GeneralInfoFaq['audience'], string> = { ALL: 'Both apps', USER: 'Customer app', PARTNER: 'Partner app' };

const empty: GeneralInfoContent = {
    aboutUs: '',
    terms: '',
    privacyPolicy: '',
    refundPolicy: '',
    partnerTerms: '',
    contact: { phone: '', email: '', whatsapp: '', address: '', hours: '' },
    faqs: [],
};

export default function GeneralInfoEditor() {
    const [data, setData] = useState<GeneralInfoContent>(empty);
    const [saved, setSaved] = useState<string>('');
    const [section, setSection] = useState<PageKey | 'contact' | 'faqs'>('aboutUs');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const res = await getGeneralInfo();
            const d = { ...empty, ...res?.data, contact: { ...empty.contact, ...res?.data?.contact } };
            setData(d);
            setSaved(JSON.stringify(d));
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to load.');
        }
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const dirty = !loading && JSON.stringify(data) !== saved;

    const save = async () => {
        setSaving(true);
        try {
            const res = await updateGeneralInfo({
                aboutUs: data.aboutUs,
                terms: data.terms,
                privacyPolicy: data.privacyPolicy,
                refundPolicy: data.refundPolicy,
                partnerTerms: data.partnerTerms,
                contact: data.contact,
                faqs: data.faqs,
            });
            const d = { ...empty, ...res?.data, contact: { ...empty.contact, ...res?.data?.contact } };
            setData(d);
            setSaved(JSON.stringify(d));
            message.success('Saved — the apps show it right away.');
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to save.');
        }
        setSaving(false);
    };

    const setFaq = (i: number, patch: Partial<GeneralInfoFaq>) => setData({ ...data, faqs: data.faqs.map((f, j) => (j === i ? { ...f, ...patch } : f)) });
    const moveFaq = (i: number, dir: -1 | 1) => {
        const faqs = [...data.faqs];
        const j = i + dir;
        if (j < 0 || j >= faqs.length) return;
        [faqs[i], faqs[j]] = [faqs[j], faqs[i]];
        setData({ ...data, faqs });
    };

    const navItem = (key: typeof section, label: string, sub: string, filled: boolean) => (
        <button
            key={key}
            data-testid={`gi-nav-${key}`}
            onClick={() => setSection(key)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${section === key ? 'bg-gray-800 text-white' : 'hover:bg-gray-50 text-gray-700'}`}
        >
            <div className="flex items-center justify-between gap-2">
                <span>{label}</span>
                <span className={`w-2 h-2 rounded-full ${filled ? 'bg-green-500' : 'bg-gray-300'}`} title={filled ? 'Has content' : 'Empty — hidden in the app'} />
            </div>
            <div className={`text-xs ${section === key ? 'text-white/70' : 'text-gray-400'}`}>{sub}</div>
        </button>
    );

    const page = PAGES.find((p) => p.key === section);

    return (
        <div className="panel">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                    <h2 className="text-lg font-semibold">General Info</h2>
                    <p className="text-sm text-gray-500 mt-1">What the apps show under Settings → General Info. Empty pages are hidden in the app.</p>
                </div>
                <div className="flex items-center gap-3">
                    {dirty && <span className="text-xs text-orange-600">Unsaved changes</span>}
                    <button className="submit-btn" disabled={!dirty || saving} onClick={save} data-testid="gi-save">
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="h-40 rounded bg-gray-100 animate-pulse" />
            ) : (
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-60 shrink-0 space-y-1">
                        {PAGES.map((p) => navItem(p.key, p.title, p.where, !!data[p.key]?.trim()))}
                        {navItem('contact', 'Contact Us', 'Both apps', !!(data.contact.phone || data.contact.email))}
                        {navItem('faqs', `FAQs (${data.faqs.length})`, 'Per app', data.faqs.length > 0)}
                    </div>

                    <div className="flex-1 min-w-0">
                        {page && (
                            <div className="input-field">
                                <label>
                                    {page.title} <span className="text-gray-400 font-normal">· {page.where}</span>
                                </label>
                                <textarea
                                    rows={18}
                                    className="w-full border border-gray-300 rounded-md font-[inherit]"
                                    value={data[page.key]}
                                    onChange={(e) => setData({ ...data, [page.key]: e.target.value })}
                                    placeholder={`Write the ${page.title}. Plain text — blank lines start a new paragraph.`}
                                    data-testid="gi-text"
                                />
                                <p className="text-xs text-gray-400 mt-1">{data[page.key].length.toLocaleString()} / 50,000 characters</p>
                            </div>
                        )}

                        {section === 'contact' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {(
                                    [
                                        ['phone', 'Support phone', '+91 98xxxxxx'],
                                        ['whatsapp', 'WhatsApp', '+91 98xxxxxx'],
                                        ['email', 'Support email', 'support@qdos.in'],
                                        ['hours', 'Support hours', '9 AM - 9 PM, all days'],
                                    ] as const
                                ).map(([k, label, ph]) => (
                                    <div key={k} className="input-field">
                                        <label>{label}</label>
                                        <input
                                            className="w-full border border-gray-300 rounded-md"
                                            value={data.contact[k]}
                                            placeholder={ph}
                                            onChange={(e) => setData({ ...data, contact: { ...data.contact, [k]: e.target.value } })}
                                            data-testid={`gi-contact-${k}`}
                                        />
                                    </div>
                                ))}
                                <div className="input-field sm:col-span-2">
                                    <label>Office address</label>
                                    <textarea
                                        rows={2}
                                        className="w-full border border-gray-300 rounded-md"
                                        value={data.contact.address}
                                        onChange={(e) => setData({ ...data, contact: { ...data.contact, address: e.target.value } })}
                                    />
                                </div>
                            </div>
                        )}

                        {section === 'faqs' && (
                            <div className="space-y-3">
                                {data.faqs.length === 0 && <p className="text-sm text-gray-400">No FAQs yet.</p>}
                                {data.faqs.map((f, i) => (
                                    <div key={f._id || i} className="border border-gray-200 rounded-lg p-3" data-testid="gi-faq">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className="text-xs text-gray-400">#{i + 1}</span>
                                            <select className="border border-gray-300 rounded-md text-xs py-1" value={f.audience} onChange={(e) => setFaq(i, { audience: e.target.value as GeneralInfoFaq['audience'] })}>
                                                {Object.entries(AUDIENCE_LABEL).map(([k, v]) => (
                                                    <option key={k} value={k}>
                                                        {v}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="ml-auto flex items-center gap-2 text-sm">
                                                <button type="button" className="px-2 border rounded disabled:opacity-30" disabled={i === 0} onClick={() => moveFaq(i, -1)} title="Move up">
                                                    ↑
                                                </button>
                                                <button type="button" className="px-2 border rounded disabled:opacity-30" disabled={i === data.faqs.length - 1} onClick={() => moveFaq(i, 1)} title="Move down">
                                                    ↓
                                                </button>
                                                <button type="button" className="text-red-500 text-xs" onClick={() => setData({ ...data, faqs: data.faqs.filter((_, j) => j !== i) })}>
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                        <input
                                            className="w-full border border-gray-300 rounded-md mb-2 text-sm px-3 py-2"
                                            placeholder="Question"
                                            value={f.question}
                                            onChange={(e) => setFaq(i, { question: e.target.value })}
                                            data-testid="gi-faq-q"
                                        />
                                        <textarea
                                            rows={2}
                                            className="w-full border border-gray-300 rounded-md text-sm px-3 py-2"
                                            placeholder="Answer"
                                            value={f.answer}
                                            onChange={(e) => setFaq(i, { answer: e.target.value })}
                                            data-testid="gi-faq-a"
                                        />
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm"
                                    onClick={() => setData({ ...data, faqs: [...data.faqs, { question: '', answer: '', audience: 'ALL' }] })}
                                    data-testid="gi-faq-add"
                                >
                                    + Add FAQ
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
