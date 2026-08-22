import { useEffect, useState } from 'react';
import { Button } from '@nextui-org/react';
import { RxCross2 } from 'react-icons/rx';
import Filter from './filter';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, IRootState } from '../../store';
import axios from 'axios';
import Cookies from 'js-cookie';
import { message } from 'antd';
import { MessageCircleMore } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CompanyList() {
    const [tickets, setTickets] = useState<any[]>([]);
    const loading = useSelector((state: IRootState) => state.customerConfig.loading);
    const dispatch: AppDispatch = useDispatch();

    const endpoint = import.meta.env.VITE_API_LIVEHOST;
    const token = Cookies.get('token');

    const [filters, setFilters] = useState({ name: '', email: '', role: '' });
    const [appliedFilters, setAppliedFilters] = useState({ name: '', email: '', role: '' });
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const fetchTickets = async (page: number, limit: number, filterValues: any) => {
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', limit.toString());
            if (filterValues.name) params.append('name', filterValues.name);
            if (filterValues.email) params.append('email', filterValues.email);
            if (filterValues.role) params.append('role', filterValues.role);

            const { data } = await axios.get(`${endpoint}/v1/admin/list/ticketlisting?${params.toString()}`, {
                headers: { token },
            });

            if (data.success) {
                setTickets(data.data);
                setTotalPages(data.totalPages);
            } else {
                message.error('Failed to load tickets');
            }
        } catch (error) {
            message.error('Something went wrong while fetching tickets');
        }
    };

    useEffect(() => {
        fetchTickets(currentPage, pageSize, appliedFilters);
    }, [currentPage, pageSize, appliedFilters]);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handlePageClick = (page: number) => {
        if (page !== currentPage) setCurrentPage(page);
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(1);
    };

    const handleSearch = (newFilters: any) => {
        setFilters(newFilters);
        setAppliedFilters(newFilters);
        setCurrentPage(1);
    };

    const removeFilter = (key: string) => {
        const updated = { ...appliedFilters, [key]: '' };
        setFilters(updated);
        setAppliedFilters(updated);
        setCurrentPage(1);
    };

    const clearAllFilters = () => {
        const cleared = { name: '', email: '', role: '' };
        setFilters(cleared);
        setAppliedFilters(cleared);
        setCurrentPage(1);
    };

    const formatRoleLabel = (val: string) => {
        if (val === 'gym_owner') return 'Gym Owner';
        if (val === 'admin') return 'Admin';
        if (val === 'user') return 'User';
        return val.charAt(0).toUpperCase() + val.slice(1);
    };

    const handleClick = (id: string) => {
        
        navigate(`/adminmessages/${id}`);
    };
    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="grid gap-1">
                    <h2 className="CRM-Page-Title">Tickets</h2>
                    <p className="CRM-Page-Structure">
                        Dashboard / <span className="CRM-Page-Name">Ticket</span>
                    </p>
                    {Object.entries(appliedFilters).some(([_, val]) => val) && (
                        <div className="flex flex-wrap gap-3 items-center mt-3">
                            {Object.entries(appliedFilters)
                                .filter(([_, val]) => val)
                                .map(([key, value]) => (
                                    <Button key={key} className="yellow-color" onClick={() => removeFilter(key)}>
                                        {formatRoleLabel(value)} <RxCross2 />
                                    </Button>
                                ))}
                            <h5 className="text-yellow cursor-pointer" onClick={clearAllFilters}>
                                Clear all filters
                            </h5>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3">
                    <Filter onSearch={handleSearch} filterValues={filters} key={JSON.stringify(filters)} />
                </div>
            </div>

            <div className="inventory-table table-containers">
                <div className="rounded-lg table-wrapper">
                    <div className="border-t-8 border-[#113354]"></div>
                    <table className="data-table">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="px-4 py-3 text-left font-medium text-gray-500">S.No</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500">Subject</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading
                                ? [...Array(pageSize)].map((_, index) => (
                                      <tr key={index} className="border-b last:border-b-0">
                                          <td className="px-4 py-3">
                                              <div className="w-12 rounded h-5 bg-gray-300 "></div>
                                          </td>
                                          <td className="px-4 py-3 text-gray-600">
                                              <div className="w-24 rounded h-5 bg-gray-300 "></div>
                                          </td>
                                          <td className="px-4 py-3 text-gray-600">
                                              <div className="w-16 rounded h-5 bg-gray-300 "></div>
                                          </td>
                                          <td className="px-4 py-3 text-gray-600">
                                              <div className="w-12 rounded h-5 bg-gray-300 "></div>
                                          </td>
                                          <td className="px-4 py-3 text-gray-600">
                                              <div className="w-12 rounded h-5 bg-gray-300 "></div>
                                          </td>
                                          <td className="px-4 py-3 text-gray-600">
                                              <div className="flex gap-2">
                                                  <div className="w-5 rounded h-5 bg-gray-300 "></div>
                                                  <div className="w-5 rounded h-5 bg-gray-300 "></div>
                                                  <div className="w-5 rounded h-5 bg-gray-300 "></div>
                                              </div>
                                          </td>
                                          <td className="px-4 py-3 text-gray-600"></td>
                                      </tr>
                                  ))
                                : tickets.map((entry, index) => {
                                      const rowIndex = (currentPage - 1) * pageSize + (index + 1);
                                      return (
                                          <tr key={entry._id} className="border-b last:border-b-0 hover:shadow-md hover:font-semibold">
                                              <td className="px-4 py-3">{rowIndex}</td>
                                              <td className="px-4 py-3 text-gray-600">{entry.user?.name || '---'}</td>
                                              <td className="px-4 py-3 text-gray-600">{entry.user?.email || '---'}</td>
                                              <td>
                                                  <span
                                                      className={`inline-block px-2 py-1 text-xs rounded-full font-semibold ${
                                                          entry.user?.role === 'admin'
                                                              ? 'bg-blue-100 text-blue-700'
                                                              : entry.user?.role === 'user'
                                                              ? 'bg-purple-100 text-purple-700'
                                                              : entry.user?.role === 'gym_owner'
                                                              ? 'bg-yellow-100 text-yellow-800'
                                                              : 'bg-gray-100 text-gray-600'
                                                      }`}
                                                  >
                                                      {entry.user?.role === 'gym_owner' ? 'Gym Owner' : entry.user?.role ? entry.user.role.charAt(0).toUpperCase() + entry.user.role.slice(1) : '---'}
                                                  </span>
                                              </td>
                                              <td className="px-4 py-3">{entry.subject || '---'}</td>
                                              <td className="px-4 py-3">
                                                  <span
                                                      className={`inline-block px-2 py-1 text-xs rounded-full font-semibold ${
                                                          entry.status === 'open'
                                                              ? 'bg-green-100 text-green-800'
                                                              : entry.status === 'pending'
                                                              ? 'bg-yellow-100 text-yellow-800'
                                                              : entry.status === 'closed'
                                                              ? 'bg-red-100 text-red-800'
                                                              : 'bg-gray-100 text-gray-600'
                                                      }`}
                                                  >
                                                      {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                                                  </span>
                                              </td>

                                              <td className="px-4 py-3 cursor-pointer" onClick={() => handleClick(entry._id)} title="Open Chat">
                                                  <MessageCircleMore />
                                              </td>
                                          </tr>
                                      );
                                  })}
                        </tbody>
                    </table>
                </div>

                <div className="pagination-container">
                    <div className="pagination-controls">
                        <button onClick={handlePreviousPage} className={`pagination-button ${currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={currentPage <= 1}>
                            ‹ Prev
                        </button>
                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => handlePageClick(index + 1)}
                                className={`flex h-8 w-8 items-center justify-center rounded-md text-sm 
                  ${index + 1 === currentPage ? 'bg-yellow text-white' : 'hover:bg-gray-100 border border-gray-300 text-gray-600'}
                  ${index + 1 === currentPage ? 'cursor-not-allowed' : ''}`}
                                disabled={index + 1 === currentPage}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            onClick={handleNextPage}
                            className={`pagination-button ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={currentPage >= totalPages || totalPages === 0}
                        >
                            Next ›
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Items per page</span>
                        <select className="h-8 rounded-md border border-gray-300 bg-white p-1 text-sm text-gray-600" value={pageSize} onChange={handlePageSizeChange}>
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
