import { Suspense, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AppDispatch, IRootState } from '../../store';
import { toggleSidebar, toggleRTL } from '../../store/themeConfigSlice';
import { useTranslation } from 'react-i18next';
import { Bell, ChevronDown, Power } from 'lucide-react';
import { Badge, message, Dropdown, Menu, Popover, Avatar } from 'antd';
import Cookies from 'js-cookie';
import axios from 'axios';
import Swal from 'sweetalert2';
import socket from '../../socket';
import IconMenu from '../Icon/IconMenu';
import moment from 'moment';
import { activeGym } from '../../store/customerConfigSlice';
import Profile from './Profile';

interface ProfileData {
    profileImage?: string;
    avatar?: string;

    // add other fields as needed
}

const Header = () => {
    const dispatch: AppDispatch = useDispatch();
    const location = useLocation();
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const userRole = localStorage.getItem('userRole');
    const [notifications, setNotifications] = useState<any[]>([]);
    const [flag, setFlag] = useState(themeConfig.locale);
    const { profileData } = useSelector((state: IRootState) => state.customerConfig) as { profileData: ProfileData };
    const imageUrl = profileData.profileImage || profileData.avatar || '';
    const navigate = useNavigate();

    const endpoint = import.meta.env.VITE_API_LIVEHOST;
    const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;

    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState('All');
    const token = Cookies.get('token');

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    interface Gym {
        _id: string;
        name: string;
    }
    const { gyms } = useSelector((state: IRootState) => state.customerConfig) as { gyms: Gym[] };

    const handleSelectGym = (gymId: string) => {
        dispatch(activeGym(gymId));
        toggleDropdown();
    };

    useEffect(() => {
        const selector = document.querySelector(`ul.horizontal-menu a[href="${window.location.pathname}"]`);
        if (selector) {
            selector.classList.add('active');
            const all: any = document.querySelectorAll('ul.horizontal-menu .nav-link.active');
            for (let i = 0; i < all.length; i++) {
                all[0]?.classList.remove('active');
            }
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu')?.querySelectorAll('.nav-link');
                if (ele?.length) {
                    setTimeout(() => ele[0]?.classList.add('active'), 0);
                }
            }
        }
    }, [location]);

    // QdosBackend has no admin-notifications endpoint yet, so this is a no-op for now
    // (left in place so it's a one-line change to wire up once that endpoint exists).
    const fetchNotification = async () => {};

    const handleSingleNotificationClick = async (notificationId: string) => {
        try {
            await axios.put(`${endpoint}/v1/admin/list/markNotify/${notificationId}`);
            setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
        } catch (error) {
            message.error('Failed to mark as read');
        }
    };

    useEffect(() => {
        if (userRole === 'admin') {
            socket.emit('join-admin');

            socket.on('gym_registered', (notification: any) => {
                setNotifications((prev) => [notification, ...prev]);
            });

            socket.on('gym_updated', (notification: any) => {
                setNotifications((prev) => [notification, ...prev]);
            });
            socket.on('location_change_request', (notification: any) => {
                setNotifications((prev) => [notification, ...prev]);
            });
        } else if (userRole === 'gym_owner') {
            const userId = localStorage.getItem('userId');
            socket.emit('join-gym-owner', userId);

            socket.on('approval_status', (notification: any) => {
                setNotifications((prev) => [notification, ...prev]);
            });
        }

        fetchNotification();

        return () => {
            socket.off('gym_registered');
            socket.off('gym_updated');
            socket.off('approval_status');
            socket.off('location_change_request');
        };
    }, []);

    // Logout function
    const SignOut = () => {
        Swal.fire({
            title: 'Log Out',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Log Out',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
        }).then(async (result) => {
            if (result.isConfirmed) {
                Cookies.remove('token'); // Just remove the token
                Swal.fire('Logged Out!', 'You have been logged out.', 'success');
                navigate('/'); // Redirect to home
            }
        });
    };

    // Notification dropdown menu
    const renderNotificationMenu = () => (
        <Menu className="max-w-sm w-[320px] p-0">
            {notifications.length === 0 ? (
                <Menu.Item disabled className="px-4 py-2 text-center text-gray-500">
                    No new notifications
                </Menu.Item>
            ) : (
                <div className={`${notifications.length > 3 ? 'max-h-72 overflow-y-auto' : ''} custom-scrollbar`}>
                    {notifications.map((noti) => (
                        <Menu.Item key={noti._id} className="whitespace-normal px-4 py-2 hover:bg-gray-50" onClick={() => handleSingleNotificationClick(noti._id)}>
                            <div className="flex flex-col gap-1">
                                <span className="font-medium text-gray-800">{noti.message}</span>
                                <ul className="text-sm text-gray-600 list-disc list-inside">
                                    {noti.data?.changes?.map((change: string, idx: number) => (
                                        <li key={idx}>{change}</li>
                                    ))}
                                </ul>
                                <span className="text-xs text-gray-400">{moment(noti.createdAt).fromNow()}</span>
                            </div>
                        </Menu.Item>
                    ))}
                </div>
            )}
        </Menu>
    );

    const handleNavigation = () => {
        navigate('/profile');
    };

    return (
        <header className={`z-40 ${themeConfig.semidark && themeConfig.menu === 'horizontal' ? 'dark' : ''}`}>
            <div className="shadow-sm">
                <div className="relative bg-white flex w-full items-center px-5 py-2.5 ">
                    <div className="horizontal-logo flex lg:hidden justify-between items-center">
                        <Link to="/" className="main-logo flex items-center shrink-0">
                            <img className="w-[140px]" src="/assets/images/gym_logo.png" alt="logo" />
                        </Link>
                    </div>

                    <div className="sm:flex-1 flex justify-between items-center dark:text-[#d0d2d6]">
                        {/* Left: Sidebar Toggle */}
                        <div>
                            <button type="button" className="collapse-icon w-8 h-8 rounded-full flex items-center justify-center" onClick={() => dispatch(toggleSidebar())}>
                                <IconMenu className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Right: Notifications, Profile, Logout */}
                        <div className="flex items-center gap-3 relative">
                            {/* Notifications */}
                            <Dropdown overlay={renderNotificationMenu()} trigger={['click']}>
                                <div className="cursor-pointer relative">
                                    <Bell className="text-xl" />
                                    <Badge count={notifications.length} className="absolute -top-1 -right-1" />
                                </div>
                            </Dropdown>

                            {/* Profile Popover */}
                            <Popover
                                trigger={'hover'}
                                arrow={false}
                                rootClassName="w-[366px]"
                                content={
                                    <Suspense fallback={<div>Loading...</div>}>
                                        <Profile />
                                    </Suspense>
                                }
                            >
                                <div className="hover:bg-[#ffffff29] h-[40px] rounded-[10px] px-2 flex items-center cursor-pointer transition-all">
                                    <Avatar size="small" src={imageUrl} />
                                </div>
                            </Popover>

                            {/* Logout */}
                            <NavLink to="#" onClick={SignOut}>
                                <Power className="text-red-500 w-5 h-5" />
                            </NavLink>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
