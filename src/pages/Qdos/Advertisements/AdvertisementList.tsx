import React, { useEffect, useRef, useState } from 'react';
import { message } from 'antd';
import { Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from '@nextui-org/react';
import Edit from '../../../../public/assets/APSIcon/Edit';
import Tableempty from '../../Tableempty';
import { getAdvertisements, uploadAdvertisements, updateAdvertisement, deleteAdvertisement, Advertisement } from '../../../services/qdosApi';

export default function AdvertisementList() {
    const [list, setList] = useState<Advertisement[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const modal = useDisclosure();
    const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
    const [title, setTitle] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchList = async () => {
        setLoading(true);
        try {
            const res = await getAdvertisements({ limit: 100 });
            setList(res?.ads || []);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to fetch advertisements.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchList();
    }, []);

    const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        if (files.length === 0) return;

        setUploading(true);
        try {
            const res = await uploadAdvertisements(files);
            const failed = res?.data?.failed || [];
            if (failed.length > 0) {
                message.warning(`${res.data.created.length} uploaded, ${failed.length} failed.`);
            } else {
                message.success(`${res.data.created.length} advertisement(s) uploaded.`);
            }
            fetchList();
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Upload failed.');
        }
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const toggleActive = async (ad: Advertisement) => {
        try {
            await updateAdvertisement(ad._id, { isActive: !ad.isActive });
            message.success(ad.isActive ? 'Advertisement paused.' : 'Advertisement activated.');
            fetchList();
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to update.');
        }
    };

    const openEditModal = (ad: Advertisement) => {
        setEditingAd(ad);
        setTitle(ad.title || '');
        setLinkUrl(ad.linkUrl || '');
        modal.onOpen();
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAd) return;
        setIsSubmitting(true);
        try {
            await updateAdvertisement(editingAd._id, { title, linkUrl });
            message.success('Advertisement saved.');
            modal.onClose();
            fetchList();
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to save.');
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (ad: Advertisement) => {
        if (!window.confirm('Delete this advertisement? This removes the image permanently.')) return;
        try {
            await deleteAdvertisement(ad._id);
            message.success('Advertisement deleted.');
            fetchList();
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to delete.');
        }
    };

    return (
        <div className="panel">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg font-semibold">Advertisements</h2>
                    <p className="text-sm text-gray-500 mt-1">Banners shown in the home screen carousel of the user app. Select multiple images to upload them all at once.</p>
                </div>
                <div>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFilesSelected} id="ad-upload-input" />
                    <button className="submit-btn" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                        {uploading ? 'Uploading...' : '+ Upload Banner(s)'}
                    </button>
                </div>
            </div>

            <div className="table-wrapper overflow-x-auto">
                <table className="data-table w-full">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="px-4 py-3 text-left">Preview</th>
                            <th className="px-4 py-3 text-left">Title</th>
                            <th className="px-4 py-3 text-left">Link</th>
                            <th className="px-4 py-3 text-left">Order</th>
                            <th className="px-4 py-3 text-left">Schedule</th>
                            <th className="px-4 py-3 text-left">Active</th>
                            <th className="px-4 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <tr key={i} className="border-b">
                                    <td className="px-4 py-3" colSpan={7}>
                                        <div className="w-full rounded h-5 bg-gray-200 animate-pulse" />
                                    </td>
                                </tr>
                            ))
                        ) : list.length === 0 ? (
                            <Tableempty length={7} />
                        ) : (
                            list.map((ad) => (
                                <tr key={ad._id} className="border-b last:border-b-0 hover:shadow-sm">
                                    <td className="px-4 py-3">
                                        <img src={ad.image.url} alt={ad.title || 'Advertisement'} className="h-12 w-20 object-cover rounded-md border border-gray-200" />
                                    </td>
                                    <td className="px-4 py-3">{ad.title || <span className="text-gray-400">—</span>}</td>
                                    <td className="px-4 py-3 max-w-[180px] truncate">{ad.linkUrl || <span className="text-gray-400">—</span>}</td>
                                    <td className="px-4 py-3">{ad.displayOrder}</td>
                                    <td className="px-4 py-3 text-xs text-gray-500">
                                        {ad.startDate || ad.endDate ? (
                                            <>
                                                {ad.startDate ? new Date(ad.startDate).toLocaleDateString() : 'now'} → {ad.endDate ? new Date(ad.endDate).toLocaleDateString() : 'forever'}
                                            </>
                                        ) : (
                                            'Always'
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={ad.isActive} onChange={() => toggleActive(ad)} />
                                            <span className={`ml-2 px-2 py-1 rounded-md text-xs font-medium ${ad.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {ad.isActive ? 'Active' : 'Paused'}
                                            </span>
                                        </label>
                                    </td>
                                    <td className="px-4 py-3 flex items-center gap-3">
                                        <span className="cursor-pointer" onClick={() => openEditModal(ad)}>
                                            <Edit className="h-5 w-5 text-gray-500" />
                                        </span>
                                        <button type="button" className="text-red-500 text-sm" onClick={() => handleDelete(ad)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={modal.isOpen} onOpenChange={modal.onOpenChange} size="lg">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Edit Advertisement</ModalHeader>
                            <ModalBody>
                                {editingAd && (
                                    <img src={editingAd.image.url} alt="" className="h-24 w-40 object-cover rounded-md border border-gray-200 mb-4" />
                                )}
                                <form className="grid gap-4 pb-4" onSubmit={handleSaveEdit}>
                                    <div className="input-field">
                                        <label>Title (optional)</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded-md"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g. 50% off today"
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>Link (optional)</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded-md"
                                            value={linkUrl}
                                            onChange={(e) => setLinkUrl(e.target.value)}
                                            placeholder="Deep link or URL to open when tapped"
                                        />
                                    </div>
                                    <div className="flex justify-start gap-2 mt-2">
                                        <button type="button" className="Close-btn" onClick={onClose}>
                                            Cancel
                                        </button>
                                        <button disabled={isSubmitting} className="submit-btn" type="submit">
                                            {isSubmitting ? 'Wait...' : 'Save'}
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
