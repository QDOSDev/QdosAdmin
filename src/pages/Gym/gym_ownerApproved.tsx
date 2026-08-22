import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, IRootState } from '../../store';
import { fetchGym, GymownerGymList } from '../../store/customerConfigSlice';
import axios from 'axios';
import { message } from 'antd';
import Swal from 'sweetalert2';
import { Eye, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code'; 
import { Modal } from 'antd'; 

const ApprovedGym = ({ filters }: { filters: any }) => {
    const dispatch: AppDispatch = useDispatch();
    const { GymownerGym, loading, gymOwnerpagination } = useSelector((state: IRootState) => state.customerConfig) as {
        GymownerGym: { _id: string; gymphotos?: string[]; name?: string; email?: string; phone?: string; pan?: string; license_no?: string; address?: string; updatedAt?: any; qr_payload?: any }[];
        loading: boolean;
        gymOwnerpagination: { totalPages: number };
    };

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [isModalVisible, setIsModalVisible] = useState(false); 
    const [selectedQrPayload, setSelectedQrPayload] = useState<string>(''); 

    useEffect(() => {
        dispatch(GymownerGymList({ page: currentPage, limit: pageSize, ...filters, status: 'approved' }));
    }, [dispatch, currentPage, pageSize, filters]);

    const handlePageChange = (page: number) => {
        if (page !== currentPage) setCurrentPage(page);
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(1);
    };

    const approval = async (gymId: string, approvalStatus: 'approved' | 'rejected') => {
        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_LIVEHOST}/v1/admin/approve/approveRequest`,
                { gymId, approvalStatus },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (data.success) {
                message.success(data.message);
                dispatch(fetchGym({ page: currentPage, limit: pageSize, status: 'approved' }));
            } else {
                message.error(data.message);
            }
        } catch (error) {
            message.error('Something went wrong');
        }
    };

    const navigate = useNavigate();

    const showQrModal = (qrPayload: string) => {
        setSelectedQrPayload(qrPayload); 
        setIsModalVisible(true); 
    };

    const handleModalClose = () => {
        setIsModalVisible(false); 
    };

    const downloadQRCode = () => {
        const svgElement = document.getElementById('qr-code-svg');
        if (!svgElement) {
            message.error('QR code element not found.');
            return;
        }
        const svgData = new XMLSerializer().serializeToString(svgElement as Node);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'gym_qr_code.svg';
        link.click();

        URL.revokeObjectURL(url); 
    };

    return (
        <div className="inventory-table table-containers">
            <div className="rounded-lg table-wrapper">
                <div className="border-t-8 border-[#113354]"></div>
                <table className="data-table">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="px-4 py-3 text-left font-medium text-gray-500">S.No</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500">Image</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500">Phone</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500">PAN</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500">License No</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500">QR Code</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500">Address</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500">Last Updated</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading
                            ? [...Array(7)].map((_, idx) => (
                                  <tr key={idx} className="border-b">
                                      {[...Array(11)].map((_, i) => (
                                          <td key={i} className="px-4 py-3">
                                              <div className="h-5 bg-gray-200 rounded w-full" />
                                          </td>
                                      ))}
                                  </tr>
                              ))
                            : GymownerGym.map((entry, index) => (
                                  <tr key={entry._id} className="border-b hover:shadow-md">
                                      <td className="px-4 py-3">{(currentPage - 1) * pageSize + index + 1}</td>
                                      <td className="px-4 py-3">
                                          <img src={entry.gymphotos?.[0]} alt="Gym" className="h-12 w-12 rounded-md object-cover" />
                                      </td>
                                      <td className="px-4 py-3 text-gray-700">{entry.name || '---'}</td>
                                      <td className="px-4 py-3 text-gray-700">{entry.email || '---'}</td>
                                      <td className="px-4 py-3 text-gray-700">{entry.phone || '---'}</td>
                                      <td className="px-4 py-3 text-gray-700">{entry.pan || '---'}</td>
                                      <td className="px-4 py-3 text-gray-700">{entry.license_no || '---'}</td>
                                      <td className="px-4 py-3 text-gray-700">
                                          {entry.qr_payload ? (
                                              <button onClick={() => showQrModal(entry.qr_payload)}>
                                                  <QRCode value={entry.qr_payload} size={80} />
                                              </button>
                                          ) : (
                                              '---'
                                          )}
                                      </td>
                                      <td className="px-4 py-3 text-gray-700">{entry.address || '---'}</td>
                                      <td className="px-4 py-3 text-gray-700">
                                          {entry.updatedAt
                                              ? new Date(entry.updatedAt).toLocaleString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                    hour12: true,
                                                })
                                              : '---'}
                                      </td>

                                      <td className="px-4 py-3">
                                          <div className="flex items-center gap-2">
                                              <button
                                                  className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 hover:bg-yellow-200 transition"
                                                  onClick={() => navigate(`/viewGym/${entry._id}`, { state: { gymData: entry } })}
                                              >
                                                  <Eye size={18} className="text-green-600" />
                                              </button>

                                              {/* <button
                                                  className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 transition"
                                                  title="Reject"
                                                  onClick={() => {
                                                      Swal.fire({
                                                          title: 'Reject this gym?',
                                                          icon: 'warning',
                                                          showCancelButton: true,
                                                          confirmButtonColor: getComputedStyle(document.documentElement).getPropertyValue('--yellow-color').trim(),
                                                          cancelButtonColor: '#d33',
                                                          confirmButtonText: 'Yes, reject it!',
                                                          cancelButtonText: 'Cancel',
                                                      }).then((result) => {
                                                          if (result.isConfirmed) {
                                                              approval(entry._id, 'rejected');
                                                              Swal.fire('Rejected!', 'The gym has been rejected.', 'success');
                                                          }
                                                      });
                                                  }}
                                              >
                                                  <X size={18} className="text-red-600" />
                                              </button> */}
                                          </div>
                                      </td>
                                  </tr>
                              ))}
                    </tbody>
                </table>
            </div>

            <Modal title="QR Code" visible={isModalVisible} onCancel={handleModalClose} footer={null} width={300}>
                <div className="flex justify-center items-center">
                    <QRCode id="qr-code-svg" value={selectedQrPayload} size={200} />
                </div>
                <div className="flex justify-end">
                    <button onClick={downloadQRCode} className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-all">
                        Download QR Code
                    </button>
                </div>
            </Modal>

            <div className="pagination-container mt-4 flex justify-between items-center">
                <div className="pagination-controls flex gap-2">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1} className="pagination-button">
                        ‹ Prev
                    </button>
                    {Array.from({ length: gymOwnerpagination.totalPages || 1 }, (_, i) => (
                        <button key={i + 1} onClick={() => handlePageChange(i + 1)} className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-yellow text-white' : 'bg-gray-100'}`}>
                            {i + 1}
                        </button>
                    ))}
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= (gymOwnerpagination.totalPages || 1)} className="pagination-button">
                        Next ›
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Items per page</span>
                    <select className="h-8 rounded-md border border-gray-300 bg-white p-1 text-sm" value={pageSize} onChange={handlePageSizeChange}>
                        {[5, 10, 20, 50].map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default ApprovedGym;
