import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import Swal from 'sweetalert2';
import { Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from '@nextui-org/react';
import Tableempty from '../../Tableempty';
import { getOrders, getOrderById, getOrderStats, forceCancelOrder } from '../../../services/qdosApi';

const STATUS_OPTIONS = ['PLACED', 'PREPARING', 'READY', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REJECTED'];
const TERMINAL = ['DELIVERED', 'CANCELLED', 'REJECTED'];

const statusColor = (status: string) => {
    if (status === 'DELIVERED') return 'bg-green-100 text-green-700';
    if (status === 'CANCELLED' || status === 'REJECTED') return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-700';
};

export default function OrderList() {
    const [list, setList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [stats, setStats] = useState<{ totalOrders: number; byStatus: Record<string, number>; revenue?: any }>({ totalOrders: 0, byStatus: {} });

    const detailModal = useDisclosure();
    const [activeOrder, setActiveOrder] = useState<any>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const fetchStats = async () => {
        try {
            const res = await getOrderStats({ startDate: startDate || undefined, endDate: endDate || undefined });
            setStats(res?.data || { totalOrders: 0, byStatus: {} });
        } catch {
            // non-critical, skip
        }
    };

    const fetchList = async (page = 1) => {
        setLoading(true);
        try {
            const res = await getOrders({
                status: statusFilter || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                page,
                limit: 10,
            });
            setList(res?.orders || []);
            setCurrentPage(res?.currentPage || page);
            setTotalPages(res?.totalPages || 1);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to fetch orders.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchList(1);
        fetchStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, startDate, endDate]);

    const openDetail = async (orderId: string) => {
        detailModal.onOpen();
        setDetailLoading(true);
        try {
            const res = await getOrderById(orderId);
            setActiveOrder(res?.data || null);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to fetch order details.');
        }
        setDetailLoading(false);
    };

    const handleForceCancel = (order: any) => {
        Swal.fire({
            title: `Force-cancel ${order.orderNumber}?`,
            text: 'This frees any assigned rider and refunds a captured payment.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: getComputedStyle(document.documentElement).getPropertyValue('--yellow-color').trim(),
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, force-cancel',
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                await forceCancelOrder(order._id);
                message.success('Order force-cancelled.');
                fetchList(currentPage);
                fetchStats();
            } catch (error: any) {
                message.error(error?.response?.data?.message || 'Failed to cancel order.');
            }
        });
    };

    return (
        <div className="panel">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Orders</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="rounded-lg border border-gray-200 p-3">
                    <div className="text-xs text-gray-500">Total</div>
                    <div className="text-xl font-semibold">{stats.totalOrders}</div>
                </div>
                {['DELIVERED', 'OUT_FOR_DELIVERY', 'CANCELLED'].map((s) => (
                    <div key={s} className="rounded-lg border border-gray-200 p-3">
                        <div className="text-xs text-gray-500">{s.replace(/_/g, ' ')}</div>
                        <div className="text-xl font-semibold">{stats.byStatus?.[s] || 0}</div>
                    </div>
                ))}
            </div>

            {stats.revenue && (
                <div className="mb-4">
                    <div className="text-xs font-medium text-gray-500 mb-2">
                        Revenue breakdown — {stats.revenue.deliveredOrders} delivered order{stats.revenue.deliveredOrders === 1 ? '' : 's'} in range
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="rounded-lg border border-gray-200 p-3">
                            <div className="text-xs text-gray-500">Gross Revenue</div>
                            <div className="text-xl font-semibold">₹{stats.revenue.grossRevenue}</div>
                        </div>
                        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                            <div className="text-xs text-orange-600">Admin Commission</div>
                            <div className="text-xl font-semibold text-orange-700">₹{stats.revenue.adminCommission}</div>
                        </div>
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                            <div className="text-xs text-blue-600">Restaurant Earnings</div>
                            <div className="text-xl font-semibold text-blue-700">₹{stats.revenue.restaurantEarnings}</div>
                        </div>
                        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                            <div className="text-xs text-green-600">Rider Earnings</div>
                            <div className="text-xl font-semibold text-green-700">₹{stats.revenue.riderEarnings}</div>
                        </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                        Subtotal ₹{stats.revenue.subTotal} + GST ₹{stats.revenue.tax} + Delivery Fee ₹{stats.revenue.deliveryFee} − Discounts ₹{stats.revenue.discount} = ₹{stats.revenue.grossRevenue}
                    </div>
                </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mb-4">
                <select className="border border-gray-300 rounded-md px-3 py-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All statuses</option>
                    {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>
                <input type="date" className="border border-gray-300 rounded-md px-3 py-2" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <span className="text-gray-400">to</span>
                <input type="date" className="border border-gray-300 rounded-md px-3 py-2" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <div className="table-wrapper overflow-x-auto">
                <table className="data-table w-full">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="px-4 py-3 text-left">Order #</th>
                            <th className="px-4 py-3 text-left">Restaurant</th>
                            <th className="px-4 py-3 text-left">Rider</th>
                            <th className="px-4 py-3 text-left">Total</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Placed</th>
                            <th className="px-4 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="border-b">
                                    <td className="px-4 py-3" colSpan={7}>
                                        <div className="w-full rounded h-5 bg-gray-200 animate-pulse" />
                                    </td>
                                </tr>
                            ))
                        ) : list.length === 0 ? (
                            <Tableempty length={7} />
                        ) : (
                            list.map((o: any) => (
                                <tr key={o._id} className="border-b last:border-b-0 hover:shadow-sm">
                                    <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
                                    <td className="px-4 py-3">{o.restaurantId?.restaurantName || '-'}</td>
                                    <td className="px-4 py-3">{o.riderId?.name || '-'}</td>
                                    <td className="px-4 py-3">₹{o.pricing?.total ?? '-'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusColor(o.status)}`}>{o.status}</span>
                                    </td>
                                    <td className="px-4 py-3">{o.createdAt ? new Date(o.createdAt).toLocaleString() : '-'}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-3">
                                            <button className="text-xs underline text-blue-600" onClick={() => openDetail(o._id)}>
                                                View
                                            </button>
                                            {!TERMINAL.includes(o.status) && (
                                                <button className="text-xs underline text-red-600" onClick={() => handleForceCancel(o)}>
                                                    Force Cancel
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="pagination-container">
                <div className="pagination-controls">
                    <button className="pagination-button" disabled={currentPage <= 1} onClick={() => fetchList(currentPage - 1)}>
                        ‹ Prev
                    </button>
                    <span className="px-3 text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button className="pagination-button" disabled={currentPage >= totalPages} onClick={() => fetchList(currentPage + 1)}>
                        Next ›
                    </button>
                </div>
            </div>

            <Modal isOpen={detailModal.isOpen} onOpenChange={detailModal.onOpenChange} size="2xl">
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader>Order Details</ModalHeader>
                            <ModalBody>
                                {detailLoading || !activeOrder ? (
                                    <div className="py-8 text-center text-gray-500">Loading...</div>
                                ) : (
                                    <div className="grid gap-3 pb-4 text-sm">
                                        <div className="flex justify-between">
                                            <span className="font-medium">{activeOrder.orderNumber}</span>
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusColor(activeOrder.status)}`}>{activeOrder.status}</span>
                                        </div>
                                        <div>
                                            <div className="font-medium mb-1">Items</div>
                                            {activeOrder.items?.map((item: any) => (
                                                <div key={item._id} className="flex justify-between text-gray-600">
                                                    <span>
                                                        {item.name} × {item.quantity}
                                                    </span>
                                                    <span>₹{item.totalItemPrice}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 border-t pt-2">
                                            <div>
                                                <div className="text-gray-500">Restaurant</div>
                                                <div>{activeOrder.restaurantId?.restaurantName || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Rider</div>
                                                <div>{activeOrder.riderId?.name || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Customer</div>
                                                <div>{activeOrder.userId?.phone || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Payment</div>
                                                <div>
                                                    {activeOrder.payment?.method} · {activeOrder.payment?.status}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Delivery Address</div>
                                                <div>{activeOrder.address?.fullAddress || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Total</div>
                                                <div>₹{activeOrder.pricing?.total}</div>
                                            </div>
                                        </div>
                                        <div className="border-t pt-2">
                                            <div className="font-medium mb-1">Pricing Breakdown</div>
                                            <div className="grid grid-cols-2 gap-y-1 text-gray-600">
                                                <span>Subtotal</span>
                                                <span className="text-right">₹{activeOrder.pricing?.subTotal}</span>
                                                <span>GST</span>
                                                <span className="text-right">₹{activeOrder.pricing?.tax}</span>
                                                <span>Delivery Fee</span>
                                                <span className="text-right">₹{activeOrder.pricing?.deliveryFee}</span>
                                                {(activeOrder.pricing?.discount || 0) > 0 && (
                                                    <>
                                                        <span>Discount</span>
                                                        <span className="text-right text-red-600">−₹{activeOrder.pricing.discount}</span>
                                                    </>
                                                )}
                                                <span className="font-medium text-gray-800">Total Paid by Customer</span>
                                                <span className="text-right font-medium text-gray-800">₹{activeOrder.pricing?.total}</span>
                                            </div>
                                        </div>
                                        <div className="border-t pt-2">
                                            <div className="font-medium mb-1">Who Gets What</div>
                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div className="rounded-md bg-orange-50 border border-orange-200 p-2">
                                                    <div className="text-xs text-orange-600">Admin</div>
                                                    <div className="font-semibold text-orange-700">₹{activeOrder.commission?.admin}</div>
                                                </div>
                                                <div className="rounded-md bg-blue-50 border border-blue-200 p-2">
                                                    <div className="text-xs text-blue-600">Restaurant</div>
                                                    <div className="font-semibold text-blue-700">₹{activeOrder.commission?.restaurant}</div>
                                                </div>
                                                <div className="rounded-md bg-green-50 border border-green-200 p-2">
                                                    <div className="text-xs text-green-600">Rider</div>
                                                    <div className="font-semibold text-green-700">₹{activeOrder.commission?.rider}</div>
                                                </div>
                                            </div>
                                        </div>
                                        {activeOrder.cancelReason && (
                                            <div className="border-t pt-2">
                                                <div className="text-gray-500">Cancel Reason</div>
                                                <div>{activeOrder.cancelReason}</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
