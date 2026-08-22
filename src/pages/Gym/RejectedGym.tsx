import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, IRootState } from '../../store';
import { fetchGym } from '../../store/customerConfigSlice';
import axios from 'axios';
import { message } from 'antd';
import { Check, Eye } from 'lucide-react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const RejectedGym = ({ filters }: { filters: any }) => {
    const dispatch: AppDispatch = useDispatch();
    const { gym, loading, pagination } = useSelector((state: IRootState) => state.customerConfig) as {
        gym: { _id: string; gymphotos?: string[]; name?: string; email?: string; phone?: string; pan?: string; license_no?: string; address?: string }[];
        loading: boolean;
        pagination: { totalPages: number };
    };

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const navigate = useNavigate()

    useEffect(() => {
        dispatch(fetchGym({ page: currentPage, limit: pageSize, ...filters, status: 'rejected' }));
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
              const token = Cookies.get('token')
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_LIVEHOST}/v1/admin/approve/approveRequest`,
                { gymId, approvalStatus },
                {
                    headers: {
                        token:token,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (data.success) {
                message.success(data.message);
                dispatch(fetchGym({ page: currentPage, limit: pageSize, status: 'rejected' }));
            } else {
                message.error(data.message);
            }
        } catch (error) {
            message.error('Something went wrong');
        }
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
                            <th className="px-4 py-3 text-left font-medium text-gray-500">Address</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading
                            ? [...Array(6)].map((_, idx) => (
                                  <tr key={idx} className="border-b">
                                      {[...Array(9)].map((_, i) => (
                                          <td key={i} className="px-4 py-3">
                                              <div className="h-5 bg-gray-200 rounded w-full" />
                                          </td>
                                      ))}
                                  </tr>
                              ))
                            : gym.map((entry, index) => (
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
                                      <td className="px-4 py-3 text-gray-700">{entry.address || '---'}</td>
                                      <td className="px-4 py-3">
                                          <div className="flex items-center gap-2">
                                              <button className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 hover:bg-yellow-200 transition" onClick={() => navigate(`/gymView/${entry._id}`, { state: { gymData: entry } })}>
                                                  <Eye size={18} className="text-green-600" />
                                              </button>

                                              <button
                                                  className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 hover:bg-green-200 transition"
                                                  title="Approve"
                                                  onClick={() => {
                                                      Swal.fire({
                                                          title: 'Approve this gym?',
                                                          icon: 'question',
                                                          showCancelButton: true,
                                                          confirmButtonColor: getComputedStyle(document.documentElement).getPropertyValue('--yellow-color').trim(),
                                                          cancelButtonColor: '#d33',
                                                          confirmButtonText: 'Yes, approve it!',
                                                          cancelButtonText: 'Cancel',
                                                      }).then((result) => {
                                                          if (result.isConfirmed) {
                                                              approval(entry._id, 'approved');
                                                              Swal.fire('Approved!', 'The gym has been approved.', 'success');
                                                          }
                                                      });
                                                  }}
                                              >
                                                  <Check size={18} className="text-green-600" />
                                              </button>
                                          </div>
                                      </td>
                                  </tr>
                              ))}
                    </tbody>
                </table>
            </div>

            <div className="pagination-container mt-4 flex justify-between items-center">
                <div className="pagination-controls flex gap-2">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1} className="pagination-button">
                        ‹ Prev
                    </button>
                    {Array.from({ length: pagination.totalPages || 1 }, (_, i) => (
                        <button key={i + 1} onClick={() => handlePageChange(i + 1)} className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-yellow text-white' : 'bg-gray-100'}`}>
                            {i + 1}
                        </button>
                    ))}
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= (pagination.totalPages || 1)} className="pagination-button">
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

export default RejectedGym;
