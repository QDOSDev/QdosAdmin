import React, { useCallback, useEffect, useRef, useState } from 'react';
import { message } from 'antd';
import {
    getSupportTickets,
    getSupportTicket,
    sendSupportMessage,
    updateSupportStatus,
    markSupportRead,
    SupportTicket,
    SupportMessage,
    SupportStatus,
    SupportRole,
    SupportAttachment,
} from '../../../services/qdosApi';
import { getAdminSocket } from '../../../utils/socket';

const STATUS_INFO: Record<SupportStatus, { label: string; cls: string }> = {
    OPEN: { label: 'Open', cls: 'bg-orange-50 text-orange-600 border-orange-200' },
    IN_PROGRESS: { label: 'In Progress', cls: 'bg-blue-50 text-blue-600 border-blue-200' },
    RESOLVED: { label: 'Resolved', cls: 'bg-green-50 text-green-600 border-green-200' },
};

const SERVICES = [
    ['FOOD_DELIVERY', 'Food Delivery'],
    ['CAB', 'Cab / Ride'],
    ['PARCEL', 'Parcel'],
    ['PILOT', 'Hire a Pilot'],
    ['RESTAURANT', 'Restaurant'],
    ['OTHER', 'Other'],
];

const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const fmtTime = (d: string) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const fmtDate = (d: string) => new Date(d).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
const fmtDateTime = (d: string) => `${fmtDate(d)}, ${fmtTime(d)}`;

function StatusBadge({ status }: { status: SupportStatus }) {
    const s = STATUS_INFO[status];
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${s.cls}`}>{s.label}</span>;
}

function Attachments({ items, light }: { items: SupportAttachment[]; light?: boolean }) {
    if (!items?.length) return null;
    return (
        <div className="flex flex-wrap gap-2 mt-2">
            {items.map((a) =>
                a.mimeType?.startsWith('image/') ? (
                    <a key={a.public_id} href={a.url} target="_blank" rel="noreferrer">
                        <img src={a.url} alt={a.name || ''} className="h-20 w-20 object-cover rounded-md border border-gray-200" />
                    </a>
                ) : (
                    <a key={a.public_id} href={a.url} target="_blank" rel="noreferrer" className={`text-xs underline ${light ? 'text-white' : 'text-blue-600'}`}>
                        📎 {a.name || 'Attachment'}
                    </a>
                ),
            )}
        </div>
    );
}

export default function SupportTickets() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<SupportStatus | 'ALL'>('ALL');
    const [role, setRole] = useState<SupportRole | ''>('');
    const [service, setService] = useState('');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [ticket, setTicket] = useState<SupportTicket | null>(null);
    const [messages, setMessages] = useState<SupportMessage[]>([]);
    const [detailLoading, setDetailLoading] = useState(false);
    const [typing, setTyping] = useState(false);
    const [connected, setConnected] = useState(false);

    const [text, setText] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [sending, setSending] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // socket handlers read these without re-subscribing
    const selectedRef = useRef<string | null>(null);
    selectedRef.current = selectedId;
    const filtersRef = useRef({ status, role, service, search: debouncedSearch });
    filtersRef.current = { status, role, service, search: debouncedSearch };
    const typingTimer = useRef<ReturnType<typeof setTimeout>>();
    const lastTypingEmit = useRef(0);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
        return () => clearTimeout(t);
    }, [search]);

    const fetchList = useCallback(async (quiet = false) => {
        if (!quiet) setLoading(true);
        try {
            const f = filtersRef.current;
            const res = await getSupportTickets({ status: f.status, role: f.role || undefined, service: f.service || undefined, search: f.search || undefined, limit: 100 });
            setTickets(res?.data?.tickets || []);
            setCounts(res?.data?.counts || {});
        } catch (error: any) {
            if (!quiet) message.error(error?.response?.data?.message || 'Failed to load tickets.');
        }
        if (!quiet) setLoading(false);
    }, []);

    useEffect(() => {
        fetchList();
    }, [status, role, service, debouncedSearch, fetchList]);

    const openTicket = async (id: string) => {
        setSelectedId(id);
        setTyping(false);
        setText('');
        setFiles([]);
        setDetailLoading(true);
        try {
            const res = await getSupportTicket(id);
            setTicket(res?.data?.ticket || null);
            setMessages(res?.data?.messages || []);
            // opening it read the messages — clear the badge without a refetch
            setTickets((list) => list.map((t) => (t._id === id ? { ...t, unread: 0 } : t)));
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to open ticket.');
        }
        setDetailLoading(false);
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typing]);

    // ---- realtime ----
    useEffect(() => {
        const socket = getAdminSocket();
        setConnected(socket.connected);
        const onConnect = () => setConnected(true);
        const onDisconnect = () => setConnected(false);

        const onCreated = ({ ticket: t }: { ticket: SupportTicket }) => {
            message.info(`New support request ${t.ticketNo}: ${t.issueType}`);
            fetchList(true);
        };
        const onMessage = ({ ticketId, message: m, ticket: t }: { ticketId: string; message: SupportMessage; ticket: SupportTicket }) => {
            if (selectedRef.current === ticketId) {
                setMessages((list) => (list.some((x) => x._id === m._id) ? list : [...list, m]));
                setTicket(t);
                if (m.senderRole !== 'ADMIN') {
                    setTyping(false);
                    markSupportRead(ticketId).catch(() => {});
                }
            }
            fetchList(true);
        };
        const onUpdated = ({ ticket: t }: { ticket: SupportTicket }) => {
            if (selectedRef.current === t._id) setTicket(t);
            fetchList(true);
        };
        const onRead = ({ ticketId, readBy, readAt }: { ticketId: string; readBy: string; readAt: string }) => {
            if (readBy !== 'RAISER' || selectedRef.current !== ticketId) return;
            setMessages((list) => list.map((m) => (m.senderRole === 'ADMIN' && !m.readAt ? { ...m, readAt } : m)));
        };
        const onTyping = ({ ticketId, from, isTyping }: { ticketId: string; from: string; isTyping: boolean }) => {
            if (from !== 'RAISER' || selectedRef.current !== ticketId) return;
            setTyping(isTyping);
            clearTimeout(typingTimer.current);
            if (isTyping) typingTimer.current = setTimeout(() => setTyping(false), 5000);
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('SUPPORT_TICKET_CREATED', onCreated);
        socket.on('SUPPORT_MESSAGE', onMessage);
        socket.on('SUPPORT_TICKET_UPDATED', onUpdated);
        socket.on('SUPPORT_READ', onRead);
        socket.on('SUPPORT_TYPING', onTyping);
        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('SUPPORT_TICKET_CREATED', onCreated);
            socket.off('SUPPORT_MESSAGE', onMessage);
            socket.off('SUPPORT_TICKET_UPDATED', onUpdated);
            socket.off('SUPPORT_READ', onRead);
            socket.off('SUPPORT_TYPING', onTyping);
            clearTimeout(typingTimer.current);
        };
    }, [fetchList]);

    const handleTextChange = (value: string) => {
        setText(value);
        if (!selectedId) return;
        const now = Date.now();
        if (value && now - lastTypingEmit.current > 2000) {
            lastTypingEmit.current = now;
            getAdminSocket().emit('supportTyping', { ticketId: selectedId, isTyping: true });
        }
    };

    const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = e.target.files ? Array.from(e.target.files) : [];
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (!picked.length) return;
        const all = [...files, ...picked];
        if (all.length > MAX_FILES) return message.error(`You can attach at most ${MAX_FILES} files.`);
        const bad = picked.filter((f) => !f.type.startsWith('image/') && f.type !== 'application/pdf');
        if (bad.length) return message.error(`Only images and PDFs: ${bad.map((f) => f.name).join(', ')}`);
        const big = picked.filter((f) => f.size > MAX_FILE_SIZE);
        if (big.length) return message.error(`Each file must be 5MB or smaller: ${big.map((f) => f.name).join(', ')}`);
        setFiles(all);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedId || (!text.trim() && !files.length)) return;
        setSending(true);
        try {
            const res = await sendSupportMessage(selectedId, text.trim(), files);
            const m: SupportMessage = res?.data;
            if (m) setMessages((list) => (list.some((x) => x._id === m._id) ? list : [...list, m]));
            setText('');
            setFiles([]);
            getAdminSocket().emit('supportTyping', { ticketId: selectedId, isTyping: false });
            lastTypingEmit.current = 0;
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to send.');
        }
        setSending(false);
    };

    const handleStatus = async (s: SupportStatus) => {
        if (!ticket || s === ticket.status) return;
        try {
            const res = await updateSupportStatus(ticket._id, s);
            setTicket((t) => (t ? { ...t, ...res?.data } : t));
            message.success(`Marked ${STATUS_INFO[s].label}.`);
            fetchList(true);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to update status.');
        }
    };

    return (
        <div className="panel">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg font-semibold">Help &amp; Support</h2>
                    <p className="text-sm text-gray-500 mt-1">Requests raised from the customer and partner apps. Replies reach them instantly in the app chat and as a notification.</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${connected ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`} data-testid="support-live">
                    {connected ? '● Live' : '○ Connecting…'}
                </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-4">
                {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as const).map((s) => (
                    <button
                        key={s}
                        data-testid={`support-status-${s}`}
                        className={`px-3 py-1.5 rounded-md text-sm border ${status === s ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-300 text-gray-700'}`}
                        onClick={() => setStatus(s)}
                    >
                        {s === 'ALL' ? 'All' : STATUS_INFO[s].label} <span className="ml-1 text-xs opacity-80">{counts[s] ?? 0}</span>
                    </button>
                ))}
                <select className="border border-gray-300 rounded-md text-sm py-1.5" value={role} onChange={(e) => setRole(e.target.value as SupportRole | '')} data-testid="support-role">
                    <option value="">Customers &amp; partners</option>
                    <option value="USER">Customers</option>
                    <option value="PARTNER">Partners</option>
                </select>
                <select className="border border-gray-300 rounded-md text-sm py-1.5" value={service} onChange={(e) => setService(e.target.value)} data-testid="support-service">
                    <option value="">All services</option>
                    {SERVICES.map(([k, l]) => (
                        <option key={k} value={k}>
                            {l}
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    className="border border-gray-300 rounded-md text-sm py-1.5 px-3 min-w-[220px]"
                    placeholder="Search ticket no, name, phone, issue"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    data-testid="support-search"
                />
            </div>

            <div className="flex flex-col lg:flex-row gap-4 lg:h-[calc(100vh-280px)] min-h-[520px]">
                {/* ticket list */}
                <div className="lg:w-[380px] shrink-0 border border-gray-200 rounded-lg overflow-y-auto" data-testid="support-list">
                    {loading ? (
                        [...Array(4)].map((_, i) => <div key={i} className="m-3 h-20 rounded bg-gray-100 animate-pulse" />)
                    ) : tickets.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-400">No requests here.</div>
                    ) : (
                        tickets.map((t) => (
                            <button
                                key={t._id}
                                data-testid={`support-ticket-${t._id}`}
                                onClick={() => openTicket(t._id)}
                                className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${selectedId === t._id ? 'bg-orange-50/60' : ''}`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="text-xs text-gray-500">{t.ticketNo}</div>
                                        <div className="font-medium text-sm truncate">{t.issueType}</div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {t.unread > 0 && (
                                            <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center" data-testid="support-unread">
                                                {t.unread}
                                            </span>
                                        )}
                                        <StatusBadge status={t.status} />
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-xs">
                                    <span className={`px-1.5 py-0.5 rounded ${t.raisedByRole === 'PARTNER' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {t.raisedByRole === 'PARTNER' ? 'Partner' : 'Customer'}
                                    </span>
                                    {t.serviceLabel && <span className="px-1.5 py-0.5 rounded bg-yellow-50 text-yellow-800">{t.serviceLabel}</span>}
                                    <span className="text-gray-500 truncate">{t.raiser?.name || t.raiser?.phone}</span>
                                </div>
                                <div className="flex justify-between gap-2 mt-1 text-xs text-gray-400">
                                    <span className="truncate">{t.lastMessage}</span>
                                    <span className="whitespace-nowrap">{fmtDate(t.lastMessageAt)}</span>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* chat */}
                <div className="flex-1 min-w-0 border border-gray-200 rounded-lg flex flex-col min-h-[520px]" data-testid="support-chat">
                    {!selectedId ? (
                        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">Select a request to view the conversation.</div>
                    ) : detailLoading || !ticket ? (
                        <div className="flex-1 p-6">
                            <div className="h-6 w-1/3 bg-gray-100 rounded animate-pulse" />
                        </div>
                    ) : (
                        <>
                            <div className="px-4 py-3 border-b border-gray-200 flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold" data-testid="support-chat-no">
                                            {ticket.ticketNo}
                                        </span>
                                        <StatusBadge status={ticket.status} />
                                    </div>
                                    <div className="text-sm font-medium mt-0.5">{ticket.issueType}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                        {ticket.categoryLabel}
                                        {ticket.serviceLabel && ` · ${ticket.serviceLabel}`} · {ticket.raisedByRole === 'PARTNER' ? 'Partner' : 'Customer'}: {ticket.raiser?.name || '—'} {ticket.raiser?.phone}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-0.5">Raised {fmtDateTime(ticket.createdAt)}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-gray-500">Status</label>
                                    <select
                                        className="border border-gray-300 rounded-md text-sm py-1"
                                        value={ticket.status}
                                        onChange={(e) => handleStatus(e.target.value as SupportStatus)}
                                        data-testid="support-chat-status"
                                    >
                                        <option value="OPEN">Open</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="RESOLVED">Resolved</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#FFF9F5] space-y-3" data-testid="support-messages">
                                {messages.map((m, i) => {
                                    const mine = m.senderRole === 'ADMIN';
                                    const newDay = i === 0 || fmtDate(messages[i - 1].createdAt) !== fmtDate(m.createdAt);
                                    return (
                                        <React.Fragment key={m._id}>
                                            {newDay && <div className="text-center text-xs text-gray-400">{fmtDate(m.createdAt)}</div>}
                                            <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                                <div
                                                    className={`max-w-[75%] rounded-xl px-3 py-2 text-sm shadow-sm ${mine ? 'bg-orange-500 text-white' : 'bg-white text-gray-800 border border-gray-200'}`}
                                                    data-testid={mine ? 'support-msg-admin' : 'support-msg-raiser'}
                                                >
                                                    <div className={`text-xs font-semibold mb-0.5 ${mine ? 'text-white/90' : 'text-gray-500'}`}>
                                                        {mine ? (m.isAuto ? 'Qdos Support · auto-reply' : 'Qdos Support') : m.senderName || (m.senderRole === 'PARTNER' ? 'Partner' : 'Customer')}
                                                    </div>
                                                    {m.message && <div className="whitespace-pre-wrap break-words">{m.message}</div>}
                                                    <Attachments items={m.attachments} light={mine} />
                                                    <div className={`text-[10px] mt-1 text-right ${mine ? 'text-white/80' : 'text-gray-400'}`}>
                                                        {fmtTime(m.createdAt)}
                                                        {mine && !m.isAuto && (
                                                            <span className="ml-1" data-testid="support-tick" title={m.readAt ? 'Read' : 'Sent'}>
                                                                {m.readAt ? '✓✓' : '✓'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    );
                                })}
                                {typing && (
                                    <div className="text-xs text-gray-500 italic" data-testid="support-typing">
                                        {ticket.raiser?.name || 'They'} {ticket.raiser?.name ? 'is' : 'are'} typing…
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            <form onSubmit={handleSend} className="border-t border-gray-200 p-3">
                                {files.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {files.map((f, i) => (
                                            <span key={i} className="text-xs bg-gray-100 rounded px-2 py-1">
                                                {f.name}{' '}
                                                <button type="button" className="text-red-500 ml-1" onClick={() => setFiles(files.filter((_, j) => j !== i))}>
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <input ref={fileInputRef} type="file" accept="image/*,application/pdf" multiple className="hidden" onChange={handleFiles} />
                                    <button type="button" className="px-3 py-2 border border-gray-300 rounded-md text-sm" onClick={() => fileInputRef.current?.click()} title="Attach photos or PDF">
                                        📎
                                    </button>
                                    <input
                                        type="text"
                                        className="flex-1 border border-gray-300 rounded-md text-sm px-3 py-2"
                                        placeholder={ticket.status === 'RESOLVED' ? 'Ticket is resolved — replying keeps it resolved' : 'Type a message…'}
                                        value={text}
                                        onChange={(e) => handleTextChange(e.target.value)}
                                        data-testid="support-input"
                                    />
                                    <button className="submit-btn !px-5" type="submit" disabled={sending || (!text.trim() && !files.length)} data-testid="support-send">
                                        {sending ? 'Sending…' : 'Send'}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
