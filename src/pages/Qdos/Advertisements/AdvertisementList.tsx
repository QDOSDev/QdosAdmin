import React, { useEffect, useRef, useState } from 'react';
import { message } from 'antd';
import { Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from '@nextui-org/react';
import Edit from '../../../../public/assets/APSIcon/Edit';
import Tableempty from '../../Tableempty';
import { getAdvertisements, uploadAdvertisements, updateAdvertisement, deleteAdvertisement, Advertisement, AdvertisementType, BANNER_PLACEMENTS, BannerPlacement } from '../../../services/qdosApi';

const MAX_FILES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const PLACEMENT_LABELS: Record<BannerPlacement, string> = {
    HOME: 'Home',
    FOOD: 'Food',
    GROCERY: 'Groceries',
    RIDES: 'Rides',
    SERVICES: 'Services',
};

const TYPE_INFO: Record<AdvertisementType, { label: string; one: string; help: string }> = {
    BANNER: { label: 'Banners', one: 'Banner', help: 'The carousel at the top of each user-app screen. A wide image fits best (about 3:1).' },
    AD: { label: 'Ads', one: 'Ad', help: "Your own ads, shown as a row of cards further down each screen (the home screen's ads section). A card-shaped image fits best (about 3:2)." },
};

const toDateInput = (d?: string | null) => (d ? new Date(d).toISOString().slice(0, 10) : '');

interface BannerForm {
    type: AdvertisementType;
    placement: BannerPlacement;
    title: string;
    subtitle: string;
    ctaText: string;
    linkUrl: string;
    displayOrder: string;
    startDate: string;
    endDate: string;
}

const emptyForm = (type: AdvertisementType = 'BANNER', placement: BannerPlacement = 'HOME'): BannerForm => ({
    type,
    placement,
    title: '',
    subtitle: '',
    ctaText: '',
    linkUrl: '',
    displayOrder: '',
    startDate: '',
    endDate: '',
});

// roughly how the app draws it: the image, with the optional text + button
// over it — full width for a banner, a smaller card for an ad
function BannerPreview({ imageUrl, form }: { imageUrl?: string; form: BannerForm }) {
    return (
        <div className={`relative rounded-xl overflow-hidden border border-gray-200 bg-gray-100 ${form.type === 'AD' ? 'w-56 h-36' : 'w-full h-36'}`} data-testid="banner-preview">
            {imageUrl && <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />}
            {(form.title || form.subtitle || form.ctaText) && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/55 to-transparent p-4 flex flex-col justify-center gap-1">
                    {form.title && <div className={`text-white font-bold leading-tight ${form.type === 'AD' ? 'text-sm' : 'text-lg max-w-[60%]'}`}>{form.title}</div>}
                    {form.subtitle && <div className={`text-white/90 text-xs ${form.type === 'AD' ? '' : 'max-w-[55%]'}`}>{form.subtitle}</div>}
                    {form.ctaText && <span className="mt-2 self-start px-3 py-1 rounded-full bg-yellow-400 text-gray-900 text-xs font-semibold">{form.ctaText}</span>}
                </div>
            )}
        </div>
    );
}

export default function AdvertisementList() {
    const [list, setList] = useState<Advertisement[]>([]);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [kind, setKind] = useState<AdvertisementType>('BANNER');
    const [tab, setTab] = useState<BannerPlacement | ''>('');
    const [loading, setLoading] = useState(true);

    const uploadModal = useDisclosure();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [filePreview, setFilePreview] = useState<string | undefined>();
    const [uploading, setUploading] = useState(false);

    const editModal = useDisclosure();
    const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
    const [form, setForm] = useState<BannerForm>(emptyForm());
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchList = async () => {
        setLoading(true);
        try {
            const res = await getAdvertisements({ type: kind, placement: tab || undefined, limit: 100 });
            setList(res?.ads || []);
            setCounts(res?.counts || {});
        } catch (error: any) {
            message.error(error?.response?.data?.message || `Failed to fetch ${TYPE_INFO[kind].label.toLowerCase()}.`);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, kind]);

    useEffect(
        () => () => {
            if (filePreview) URL.revokeObjectURL(filePreview);
        },
        [filePreview],
    );

    const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

    const openUploadModal = () => {
        setForm(emptyForm(kind, tab || 'HOME'));
        setFiles([]);
        setFilePreview(undefined);
        uploadModal.onOpen();
    };

    const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = e.target.files ? Array.from(e.target.files) : [];
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (picked.length === 0) return;

        // mirror the backend's multer limits so the admin gets a clear message up front
        if (picked.length > MAX_FILES) return message.error(`You can upload at most ${MAX_FILES} images at once.`);
        const invalid = picked.filter((f) => !f.type.startsWith('image/'));
        if (invalid.length > 0) return message.error(`Not an image: ${invalid.map((f) => f.name).join(', ')}`);
        const tooLarge = picked.filter((f) => f.size > MAX_FILE_SIZE);
        if (tooLarge.length > 0) return message.error(`Each image must be 5MB or smaller. Too large: ${tooLarge.map((f) => f.name).join(', ')}`);

        setFiles(picked);
        setFilePreview(URL.createObjectURL(picked[0]));
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (files.length === 0) return message.error('Choose at least one image.');
        setUploading(true);
        try {
            const res = await uploadAdvertisements(
                files,
                form.placement,
                {
                    title: form.title.trim(),
                    subtitle: form.subtitle.trim(),
                    ctaText: form.ctaText.trim(),
                    linkUrl: form.linkUrl.trim(),
                },
                form.type,
            );
            const created = res?.data?.created || [];
            const failed: { filename: string; error: string }[] = res?.data?.failed || [];
            if (failed.length > 0) {
                message.warning(`${created.length} uploaded, ${failed.length} failed: ${failed.map((f) => `${f.filename} (${f.error})`).join(', ')}`, 6);
            } else {
                message.success(`${created.length} ${TYPE_INFO[form.type].one.toLowerCase()}(s) added to ${PLACEMENT_LABELS[form.placement]}.`);
            }
            uploadModal.onClose();
            fetchList();
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Upload failed.');
        }
        setUploading(false);
    };

    const toggleActive = async (ad: Advertisement) => {
        try {
            await updateAdvertisement(ad._id, { isActive: !ad.isActive });
            message.success(`${TYPE_INFO[ad.type || 'BANNER'].one} ${ad.isActive ? 'paused' : 'activated'}.`);
            fetchList();
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to update.');
        }
    };

    const openEditModal = (ad: Advertisement) => {
        setEditingAd(ad);
        setForm({
            type: ad.type || 'BANNER',
            placement: ad.placement || 'HOME',
            title: ad.title || '',
            subtitle: ad.subtitle || '',
            ctaText: ad.ctaText || '',
            linkUrl: ad.linkUrl || '',
            displayOrder: String(ad.displayOrder ?? ''),
            startDate: toDateInput(ad.startDate),
            endDate: toDateInput(ad.endDate),
        });
        editModal.onOpen();
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAd) return;
        if (form.startDate && form.endDate && form.endDate < form.startDate) return message.error('End date must be after start date.');
        setIsSubmitting(true);
        try {
            await updateAdvertisement(editingAd._id, {
                type: form.type,
                placement: form.placement,
                title: form.title.trim(),
                subtitle: form.subtitle.trim(),
                ctaText: form.ctaText.trim(),
                linkUrl: form.linkUrl.trim(),
                ...(form.displayOrder !== '' && { displayOrder: Number(form.displayOrder) }),
                startDate: form.startDate ? new Date(`${form.startDate}T00:00:00`).toISOString() : null,
                endDate: form.endDate ? new Date(`${form.endDate}T23:59:59`).toISOString() : null,
            });
            message.success(`${TYPE_INFO[form.type].one} saved.`);
            editModal.onClose();
            fetchList();
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to save.');
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (ad: Advertisement) => {
        const one = TYPE_INFO[ad.type || 'BANNER'].one;
        if (!window.confirm(`Delete this ${one.toLowerCase()}? This removes the image permanently.`)) return;
        try {
            await deleteAdvertisement(ad._id);
            message.success(`${one} deleted.`);
            fetchList();
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to delete.');
        }
    };

    const textFields = (
        <>
            <div className="input-field">
                <label>Title (optional)</label>
                <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Tasty Meals"
                    data-testid="banner-title"
                />
            </div>
            <div className="input-field">
                <label>Subtitle (optional)</label>
                <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md"
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                    placeholder="e.g. Your favorite meals, now on your screen"
                />
            </div>
            <div className="input-field">
                <label>Button text (optional)</label>
                <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md"
                    value={form.ctaText}
                    onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                    placeholder="e.g. Explore Now"
                    data-testid="banner-cta"
                />
            </div>
            <div className="input-field">
                <label>Link (optional)</label>
                <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md"
                    value={form.linkUrl}
                    onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                    placeholder="Deep link or URL to open when tapped"
                />
            </div>
        </>
    );

    const placementSelect = (
        <>
            <div className="input-field">
                <label>Show as</label>
                <select
                    className="w-full border border-gray-300 rounded-md"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as AdvertisementType })}
                    data-testid="banner-type"
                >
                    <option value="BANNER">Banner (top carousel)</option>
                    <option value="AD">Ad (ads row)</option>
                </select>
            </div>
            <div className="input-field">
                <label>Show on screen</label>
                <select
                    className="w-full border border-gray-300 rounded-md"
                    value={form.placement}
                    onChange={(e) => setForm({ ...form, placement: e.target.value as BannerPlacement })}
                    data-testid="banner-placement"
                >
                    {BANNER_PLACEMENTS.map((p) => (
                        <option key={p} value={p}>
                            {PLACEMENT_LABELS[p]}
                        </option>
                    ))}
                </select>
            </div>
        </>
    );

    return (
        <div className="panel">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg font-semibold">Banners &amp; Ads</h2>
                    <p className="text-sm text-gray-500 mt-1">{TYPE_INFO[kind].help} Add an image, and optionally a title, subtitle and button drawn over it.</p>
                </div>
                <button className="submit-btn" onClick={openUploadModal} data-testid="banner-add">
                    + Add {TYPE_INFO[kind].one}(s)
                </button>
            </div>

            <div className="inline-flex rounded-md border border-gray-300 overflow-hidden mb-3">
                {(['BANNER', 'AD'] as AdvertisementType[]).map((k) => (
                    <button key={k} data-testid={`kind-${k}`} className={`px-4 py-2 text-sm font-medium ${kind === k ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'}`} onClick={() => setKind(k)}>
                        {TYPE_INFO[k].label}
                    </button>
                ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                {([['', 'All'], ...BANNER_PLACEMENTS.map((p) => [p, PLACEMENT_LABELS[p]])] as [BannerPlacement | '', string][]).map(([key, label]) => (
                    <button
                        key={key || 'all'}
                        data-testid={`banner-tab-${key || 'ALL'}`}
                        className={`px-3 py-1.5 rounded-md text-sm border ${tab === key ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-300 text-gray-700'}`}
                        onClick={() => setTab(key)}
                    >
                        {label} <span className="ml-1 text-xs opacity-80">{key ? (counts[key] ?? 0) : totalCount}</span>
                    </button>
                ))}
            </div>

            <div className="table-wrapper overflow-x-auto">
                <table className="data-table w-full">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="px-4 py-3 text-left">Preview</th>
                            <th className="px-4 py-3 text-left">Screen</th>
                            <th className="px-4 py-3 text-left">Text</th>
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
                                    <td className="px-4 py-3" colSpan={8}>
                                        <div className="w-full rounded h-5 bg-gray-200 animate-pulse" />
                                    </td>
                                </tr>
                            ))
                        ) : list.length === 0 ? (
                            <Tableempty length={8} />
                        ) : (
                            list.map((ad) => (
                                <tr key={ad._id} className="border-b last:border-b-0 hover:shadow-sm" data-testid={`banner-row-${ad._id}`}>
                                    <td className="px-4 py-3">
                                        <img src={ad.image.url} alt={ad.title || 'Banner'} className="h-12 w-20 object-cover rounded-md border border-gray-200" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">{PLACEMENT_LABELS[ad.placement || 'HOME']}</span>
                                    </td>
                                    <td className="px-4 py-3 max-w-[220px]">
                                        {ad.title || ad.subtitle || ad.ctaText ? (
                                            <>
                                                <div className="font-medium truncate">{ad.title || '—'}</div>
                                                {ad.subtitle && <div className="text-xs text-gray-500 truncate">{ad.subtitle}</div>}
                                                {ad.ctaText && <div className="text-xs text-gray-500">Button: {ad.ctaText}</div>}
                                            </>
                                        ) : (
                                            <span className="text-gray-400">Image only</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 max-w-[160px] truncate">{ad.linkUrl || <span className="text-gray-400">—</span>}</td>
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
                                        <span className="cursor-pointer" onClick={() => openEditModal(ad)} data-testid="banner-edit">
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

            <Modal isOpen={uploadModal.isOpen} onOpenChange={uploadModal.onOpenChange} size="2xl" scrollBehavior="inside">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Add {TYPE_INFO[form.type].one}(s)</ModalHeader>
                            <ModalBody>
                                <form className="grid grid-cols-2 gap-4 pb-4" onSubmit={handleUpload}>
                                    {placementSelect}
                                    <div className="input-field col-span-2">
                                        <label>
                                            Images <span className="text-red-500">*</span>{' '}
                                            <span className="text-gray-400 font-normal">
                                                (up to {MAX_FILES}, 5MB each — {form.type === 'AD' ? 'a card image, about 3:2' : 'a wide image, about 3:1'}, fits best)
                                            </span>
                                        </label>
                                        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFilesSelected} data-testid="banner-files" />
                                        <button
                                            type="button"
                                            className="w-fit whitespace-nowrap px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {files.length ? `${files.length} image(s) chosen — change` : 'Choose images'}
                                        </button>
                                    </div>
                                    {textFields}
                                    {files.length > 1 && (
                                        <p className="col-span-2 text-xs text-gray-500">The text above is applied to every image in this upload; you can edit each banner afterwards.</p>
                                    )}
                                    <div className="col-span-2">
                                        <BannerPreview imageUrl={filePreview} form={form} />
                                    </div>
                                    <div className="col-span-2 flex justify-start gap-2 mt-2">
                                        <button type="button" className="Close-btn" onClick={onClose}>
                                            Cancel
                                        </button>
                                        <button disabled={uploading} className="submit-btn" type="submit" data-testid="banner-upload-submit">
                                            {uploading ? 'Uploading...' : 'Upload'}
                                        </button>
                                    </div>
                                </form>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <Modal isOpen={editModal.isOpen} onOpenChange={editModal.onOpenChange} size="2xl" scrollBehavior="inside">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Edit {TYPE_INFO[form.type].one}</ModalHeader>
                            <ModalBody>
                                <form className="grid grid-cols-2 gap-4 pb-4" onSubmit={handleSaveEdit}>
                                    <div className="col-span-2">
                                        <BannerPreview imageUrl={editingAd?.image.url} form={form} />
                                    </div>
                                    {placementSelect}
                                    {textFields}
                                    <div className="input-field">
                                        <label>Display order</label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded-md"
                                            value={form.displayOrder}
                                            onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                                        />
                                    </div>
                                    <div className="input-field" />
                                    <div className="input-field">
                                        <label>Show from (optional)</label>
                                        <input
                                            type="date"
                                            className="w-full border border-gray-300 rounded-md"
                                            value={form.startDate}
                                            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>Show until (optional)</label>
                                        <input type="date" className="w-full border border-gray-300 rounded-md" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                                    </div>
                                    <div className="col-span-2 flex justify-start gap-2 mt-2">
                                        <button type="button" className="Close-btn" onClick={onClose}>
                                            Cancel
                                        </button>
                                        <button disabled={isSubmitting} className="submit-btn" type="submit" data-testid="banner-save">
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
