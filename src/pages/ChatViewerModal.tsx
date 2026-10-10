import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import { Modal, ModalContent, ModalHeader, ModalBody, UseDisclosureProps } from '@nextui-org/react';
import { getChatMessages } from '../services/qdosApi';

interface ChatViewerModalProps {
    disclosure: UseDisclosureProps & { isOpen: boolean; onOpenChange: () => void };
    refType: 'Order' | 'Ride';
    refId: string | null;
}

// Read-only — admin investigates a rider<->customer conversation for
// support/disputes but never sends into it (see qdosApi.getChatMessages'
// comment). Only ever opened for a refId that's already known to have a
// rider assigned (chat doesn't exist before that).
export default function ChatViewerModal({ disclosure, refType, refId }: ChatViewerModalProps) {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!disclosure.isOpen || !refId) return;
        setLoading(true);
        getChatMessages(refType, refId)
            .then((res) => setMessages(res?.messages || []))
            .catch((error: any) => message.error(error?.response?.data?.message || 'Failed to fetch chat history.'))
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [disclosure.isOpen, refType, refId]);

    return (
        <Modal isOpen={disclosure.isOpen} onOpenChange={disclosure.onOpenChange} size="lg">
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader>Chat History</ModalHeader>
                        <ModalBody>
                            <div className="pb-4">
                                {loading ? (
                                    <div className="py-8 text-center text-gray-500">Loading...</div>
                                ) : messages.length === 0 ? (
                                    <div className="py-8 text-center text-gray-400 text-sm">No messages yet.</div>
                                ) : (
                                    <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
                                        {messages.map((m: any) => (
                                            <div key={m._id} className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${m.senderRole === 'RIDER' ? 'self-start bg-gray-100 text-gray-800' : 'self-end bg-blue-100 text-blue-900'}`}>
                                                <div className="text-[10px] uppercase tracking-wide opacity-60 mb-0.5">{m.senderRole === 'RIDER' ? 'Rider' : 'Customer'}</div>
                                                <div>{m.message}</div>
                                                <div className="text-[10px] opacity-50 mt-1 text-right">{new Date(m.createdAt).toLocaleString()}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
