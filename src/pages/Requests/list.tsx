import { useEffect, useState } from 'react';
import { Pagination } from '@nextui-org/react';
import { Drawer, DrawerContent, DrawerBody, DrawerFooter, Button, useDisclosure, Spinner } from '@nextui-org/react';
import { RxCross2 } from 'react-icons/rx';
import Filter from './Filters';
import { useDispatch } from 'react-redux';
import { AppDispatch, IRootState } from '../../store';
import { useSelector } from 'react-redux';
import { fetchUsers, requestList } from '../../store/customerConfigSlice';

export default function ComapnyList() {
    const [viewMode, setViewMode] = useState<boolean>(false);
    const requests = useSelector((state: IRootState) => state.customerConfig.requests);
    console.log(requests);
    const loading = useSelector((state: IRootState) => state.customerConfig.loading);

    const dispatch: AppDispatch = useDispatch();

    const [filters, setFilters] = useState({ name: '', email: '', role: '' });
    const [appliedFilters, setAppliedFilters] = useState({ name: '', email: '', role: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        dispatch(fetchUsers({ page: currentPage, limit: pageSize, ...appliedFilters }));
    }, [dispatch, currentPage, pageSize, appliedFilters]);

    useEffect(() => {
        dispatch(requestList());
    }, []);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handlePageClick = (page: any) => {
        if (page !== currentPage) {
            setCurrentPage(page);
        }
    };

    const handlePageSizeChange = (e: any) => {
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

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="grid gap-1">
                    <h2 className="CRM-Page-Title">Requests</h2>
                    <p className="CRM-Page-Structure">
                        Dashboard / <span className="CRM-Page-Name">Requests</span>
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
                    {/* <Button className="Insert-Button" onClick={company}>
                        <Plus /> Add Customers
                    </Button> */}

                    <Filter onSearch={handleSearch} filterValues={filters} key={JSON.stringify(filters)} />
                </div>
            </div>

            <div className="inventory-table table-containers">
                <div className="rounded-lg table-wrapper">
                    <div className="border-t-8 border-[#113354]"></div>
                    <table className="data-table">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="px-4 py-3">S.No</th>
                                <th className="px-4 py-3">Gym</th>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3">Address</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Coordinates</th>
                                <th className="px-4 py-3">Map</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading
                                ? [...Array(5)].map((_, index) => (
                                      <tr key={index} className="border-b">
                                          {[...Array(7)].map((_, i) => (
                                              <td key={i} className="px-4 py-3">
                                                  <div className="h-5 w-full bg-gray-200 rounded"></div>
                                              </td>
                                          ))}
                                      </tr>
                                  ))
                                : requests?.map((entry: any, index: number) => {
                                      const rowIndex = (currentPage - 1) * pageSize + index + 1;
                                      const { gym, user, description, address, status, location } = entry;
                                      const mapUrl = `https://www.google.com/maps?q=${location.coordinates[1]},${location.coordinates[0]}`;

                                      return (
                                          <tr key={entry._id} className="border-b hover:bg-gray-50">
                                              <td className="px-4 py-3">{rowIndex}</td>
                                              <td className="px-4 py-3">{gym?.name || '---'}</td>
                                              <td className="px-4 py-3">{user?.name || '---'}</td>
                                              <td className="px-4 py-3">{description || '---'}</td>
                                              <td className="px-4 py-3">{address || '---'}</td>
                                             
                                              <td className="px-4 py-3">
                                                  <span
                                                      className={`inline-block px-2 py-1 text-xs rounded-full font-semibold ${
                                                          status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                      }`}
                                                  >
                                                      {status}
                                                  </span>
                                              </td>
                                               <td className="px-4 py-3">{`${location.coordinates[1]},${location.coordinates[0]}` || '---'}</td>
                                              <td className="px-4 py-3">
                                                  <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
                                                      Open on Google Maps
                                                  </a>
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
