import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import Swal from 'sweetalert2';
import Tableempty from '../../Tableempty';
import { getUsers, blockUser, unblockUser } from '../../../services/qdosApi';

export default function UserList() {
    const [list, setList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [roleFilter, setRoleFilter] = useState('');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');

    const fetchList = async (page = 1) => {
        setLoading(true);
        try {
            const res = await getUsers({ role: (roleFilter as any) || undefined, q: search || undefined, page, limit: 10 });
            setList(res?.users || []);
            setCurrentPage(res?.currentPage || page);
            setTotalPages(res?.totalPages || 1);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to fetch users.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchList(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roleFilter, search]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput.trim());
    };

    const handleToggleBlock = (user: any) => {
        Swal.fire({
            title: user.isBlocked ? 'Unblock this user?' : 'Block this user?',
            text: user.isBlocked ? undefined : "This invalidates their session immediately and stops them from placing new orders.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: getComputedStyle(document.documentElement).getPropertyValue('--yellow-color').trim(),
            cancelButtonColor: '#d33',
            confirmButtonText: user.isBlocked ? 'Yes, unblock' : 'Yes, block',
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                if (user.isBlocked) {
                    await unblockUser(user._id);
                } else {
                    await blockUser(user._id);
                }
                message.success('User updated.');
                fetchList(currentPage);
            } catch (error: any) {
                message.error(error?.response?.data?.message || 'Failed to update user.');
            }
        });
    };

    return (
        <div className="panel">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-lg font-semibold">Users</h2>
                <div className="flex flex-wrap items-center gap-3">
                    <select className="border border-gray-300 rounded-md px-3 py-2" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                        <option value="">All roles</option>
                        <option value="user">User</option>
                        <option value="partner">Partner</option>
                    </select>
                    <form className="flex gap-2" onSubmit={handleSearchSubmit}>
                        <input
                            className="border border-gray-300 rounded-md px-3 py-2"
                            placeholder="Search phone, name, email"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                        <button type="submit" className="submit-btn">
                            Search
                        </button>
                    </form>
                </div>
            </div>

            <div className="table-wrapper overflow-x-auto">
                <table className="data-table w-full">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Phone</th>
                            <th className="px-4 py-3 text-left">Email</th>
                            <th className="px-4 py-3 text-left">Role</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="border-b">
                                    <td className="px-4 py-3" colSpan={6}>
                                        <div className="w-full rounded h-5 bg-gray-200 animate-pulse" />
                                    </td>
                                </tr>
                            ))
                        ) : list.length === 0 ? (
                            <Tableempty length={6} />
                        ) : (
                            list.map((u: any) => (
                                <tr key={u._id} className="border-b last:border-b-0 hover:shadow-sm">
                                    <td className="px-4 py-3">{u.name || '-'}</td>
                                    <td className="px-4 py-3">{u.phone}</td>
                                    <td className="px-4 py-3">{u.email || '-'}</td>
                                    <td className="px-4 py-3 capitalize">{u.role}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${u.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {u.isBlocked ? 'Blocked' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {u.role !== 'admin' && (
                                            <button className="text-xs underline text-blue-600" onClick={() => handleToggleBlock(u)}>
                                                {u.isBlocked ? 'Unblock' : 'Block'}
                                            </button>
                                        )}
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
        </div>
    );
}
