import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Power } from 'lucide-react';
import { Popover, Avatar } from 'antd';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import { AppDispatch, IRootState } from '../../store';
import { toggleSidebar } from '../../store/themeConfigSlice';
import IconMenu from '../Icon/IconMenu';

const Header = () => {
    const dispatch: AppDispatch = useDispatch();
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const navigate = useNavigate();

    const SignOut = () => {
        Swal.fire({
            title: 'Log Out',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Log Out',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
        }).then((result) => {
            if (result.isConfirmed) {
                Cookies.remove('token');
                Cookies.remove('refreshToken');
                localStorage.removeItem('userRole');
                Swal.fire('Logged Out!', 'You have been logged out.', 'success');
                navigate('/');
            }
        });
    };

    return (
        <header className={`z-40 ${themeConfig.semidark && themeConfig.menu === 'horizontal' ? 'dark' : ''}`}>
            <div className="shadow-sm">
                <div className="relative bg-white flex w-full items-center px-5 py-2.5 ">
                    <div className="horizontal-logo flex lg:hidden justify-between items-center">
                        <Link to="/dashboard" className="main-logo flex items-center shrink-0">
                            <img className="w-[140px]" src="/assets/images/qdos-logo.svg" alt="Qdos" />
                        </Link>
                    </div>

                    <div className="sm:flex-1 flex justify-between items-center dark:text-[#d0d2d6]">
                        {/* Left: Sidebar Toggle */}
                        <div>
                            <button type="button" className="collapse-icon w-8 h-8 rounded-full flex items-center justify-center" onClick={() => dispatch(toggleSidebar())}>
                                <IconMenu className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Right: account + logout */}
                        <div className="flex items-center gap-3 relative">
                            <Popover
                                trigger={'hover'}
                                arrow={false}
                                content={
                                    <div className="px-1 py-1 text-sm" data-testid="account-popover">
                                        <div className="font-medium">Qdos Admin</div>
                                        <div className="text-xs text-gray-500 mb-2">Signed in to the Qdos admin console</div>
                                        <button className="text-red-600 text-sm underline" onClick={SignOut}>
                                            Log out
                                        </button>
                                    </div>
                                }
                            >
                                <div className="hover:bg-[#ffffff29] h-[40px] rounded-[10px] px-2 flex items-center cursor-pointer transition-all" data-testid="account-avatar">
                                    <Avatar size="small" style={{ backgroundColor: '#E2AD17' }}>
                                        Q
                                    </Avatar>
                                </div>
                            </Popover>

                            <NavLink to="#" onClick={SignOut} data-testid="logout">
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
