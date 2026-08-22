import { useEffect, useState } from 'react';
import { Pagination } from '@nextui-org/react';
import { Drawer, DrawerContent, DrawerBody, DrawerFooter, Button, useDisclosure, Spinner } from '@nextui-org/react';
import { RxCross2 } from 'react-icons/rx';
import Filter from './Filters';
import { useDispatch } from 'react-redux';
import { AppDispatch, IRootState } from '../../store';
import { useSelector } from 'react-redux';
import { fetchUsers } from '../../store/customerConfigSlice';

export default function ComapnyList() {
    const [viewMode, setViewMode] = useState<boolean>(false);
    const { users } = useSelector((state: IRootState) => state.customerConfig) as { users: { id: string; name: string; email: string; role: string; wallet: string }[] };
    const loading = useSelector((state: IRootState) => state.customerConfig.loading);

    const dispatch: AppDispatch = useDispatch();

    const [filters, setFilters] = useState({ name: '', email: '', role: '' });
    const [appliedFilters, setAppliedFilters] = useState({ name: '', email: '', role: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(1);

    const totalAmount = users.reduce((sum, user) => sum + Number(user.wallet ?? 0), 0);

    useEffect(() => {
        dispatch(fetchUsers({ page: currentPage, limit: pageSize, ...appliedFilters }));
    }, [dispatch, currentPage, pageSize, appliedFilters]);

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
                    <h2 className="CRM-Page-Title">Earning</h2>
                    <p className="CRM-Page-Structure">
                        Dashboard / <span className="CRM-Page-Name">Earning</span>
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
                                <th className="px-4 py-3 text-left font-medium text-gray-500 sortable-header">S.No</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500 sortable-header">Gym Name</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500 sortable-header">Gym Owner</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500 sortable-header">User</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500 sortable-header">Amount</th>
                                {/* <th className="px-4 py-3 text-left font-medium text-gray-500 sortable-header">Action</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {loading
                                ? [...Array(5)].map((_, index) => (
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
                                      </tr>
                                  ))
                                : users.map((entry, index) => {
                                      const rowIndex = (currentPage - 1) * pageSize + (index + 1);

                                      return (
                                          <tr key={entry.id} className="border-b last:border-b-0 hover:shadow-md hover:font-semibold">
                                              <td className="px-4 py-3">{rowIndex}</td>
                                              <td className="px-4 py-3 text-gray-600">{entry.name || '---'} </td>
                                              <td className="px-4 py-3 text-gray-600">{entry.email || '---'}</td>
                                              <td>
                                                  <span
                                                      className={`inline-block px-2 py-1 text-xs rounded-full font-semibold ${
                                                          entry.role === 'admin'
                                                              ? 'bg-blue-100 text-blue-700'
                                                              : entry.role === 'user'
                                                              ? 'bg-purple-100 text-purple-700'
                                                              : entry.role === 'gym_owner'
                                                              ? 'bg-yellow-100 text-yellow-800'
                                                              : 'bg-gray-100 text-gray-600'
                                                      }`}
                                                  >
                                                      {entry.role === 'gym_owner' ? 'Gym Owner' : entry.role.charAt(0).toUpperCase() + entry.role.slice(1)}
                                                  </span>
                                              </td>

                                              <td>
                                                  <span className="inline-block px-2 py-1 text-xs rounded-full font-semibold bg-green-100 text-green-700">₹ {entry.wallet ?? '0'}</span>
                                              </td>

                                              {/* <td className="px-4 py-3 text-gray-600">
                                                  <div className="flex gap-2">
                                                      <span
                                                          className="cursor-pointer"
                                                          onClick={() => {
                                                              setCompany(entry);
                                                              setViewModalOpen(true);
                                                          }}
                                                      >
                                                          <View className="h-5 w-5 text-gray-400" />
                                                      </span>
                                                      <span className="cursor-pointer">
                                                          <Edit className="h-5 w-5 text-gray-500" />
                                                      </span>
                                                      <span
                                                          className="cursor-pointer"
                                                          onClick={() => {
                                                              if (entry.id) {
                                                                  Swal.fire({
                                                                      title: 'Are you sure?',
                                                                      icon: 'warning',
                                                                      showCancelButton: true,
                                                                      confirmButtonColor: getComputedStyle(document.documentElement).getPropertyValue('--yellow-color').trim(),
                                                                      cancelButtonColor: '#d33',
                                                                      confirmButtonText: 'Yes, delete it!',
                                                                  }).then((result) => {
                                                                      if (result.isConfirmed) {
                                                                          Swal.fire('Deleted!', 'Your item has been deleted.', 'success');
                                                                      }
                                                                  });
                                                              }
                                                          }}
                                                      >
                                                          <Delete className="h-5 w-5 text-red-500" />
                                                      </span>
                                                  </div>
                                              </td> */}
                                          </tr>
                                      );
                                  })}
                        </tbody>
                        <tfoot>
                            <tr className="border-t font-semibold">
                                <td className="px-4 py-3 text-left" colSpan={4}>
                                    Total Amount
                                </td>
                                <td className="px-4 py-3 text-green-700 bg-green-50">₹ {totalAmount}</td>
                            </tr>
                        </tfoot>
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
