import PerfectScrollbar from 'react-perfect-scrollbar';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { toggleSidebar } from '../../store/themeConfigSlice';
import AnimateHeight from 'react-animate-height';
import { IRootState } from '../../store';
import { useState, useEffect } from 'react';
import IconMenuDashboard from '../../../public/assets/sidebar/Dashboard';
import HRM from '../../../public/assets/sidebar/HRM';
import Inventory from '../../../public/assets/sidebar/Inventory';
import Schedule from '../../../public/assets/sidebar/Schedule';
import Timeprocessing from '../../../public/assets/sidebar/timeprocessing';
import Down from '../../../public/assets/sidebar/IconDownwhite';
import Manageservices from '../../../public/assets/sidebar/Manageservices';
import CRMPermissionIcon from '../../../public/assets/sidebar/CRMPermissions';
import Reports from '../../../public/assets/sidebar/Reports';
import Managesite from '../../../public/assets/sidebar/Managesite';
import QdosSettingIcon from '../../../public/assets/sidebar/setting';
const Sidebar = () => {
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const [errorSubMenu, setErrorSubMenu] = useState(false);
    const userRole = localStorage.getItem('userRole');

    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);
    interface Company {
        logo: string;
    }

    const location = useLocation();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const toggleMenu = (value: string) => {
        setCurrentMenu((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };

    useEffect(() => {
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
                if (ele.length) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele.click();
                    });
                }
            }
        }
    }, []);

    useEffect(() => {
        if (window.innerWidth < 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);
    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar fixed min-h-screen h-full top-0 bottom-0 w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] z-50 transition-all duration-300  ${
                    semidark ? 'text-white-dark' : ''
                }`}
            >
                <div className="bg-[url(/assets/images/sidebar_bg.png)] dark:bg-black h-full">
                    <div className="flex justify-center items-center px-4 py-3">
                        {/* <NavLink to="/" className="main-logo flex items-center shrink-0">
                            {activeCompanyData?.logo ? (
                                <img className="w-[140px]" src={activeCompanyData.logo} alt="logo" />
                            ) : null}
                        </NavLink> */}

                        <img className="w-[140px]" src="/assets/images/qdos-logo.svg" alt="Qdos" />
                    </div>
                    <PerfectScrollbar className="h-[calc(100vh-80px)] relative">
                        <ul className="relative font-semibold space-y-0.5 p-4 py-0">
                            <li className="nav-item">
                                <ul>
                                    <li className="nav-item">
                                        <NavLink to="/dashboard" className="group" onClick={() => toggleMenu('')}>
                                            <div className="flex items-center">
                                                <IconMenuDashboard className="group-hover:!text-[#A1AEC0] shrink-0 text-[#A1AEC0]" />
                                                <span className="ltr:pl-3 rtl:pr-3 sidebartext">{t('Dashboard')}</span>
                                            </div>
                                        </NavLink>
                                    </li>

                                    {/* Gym-domain nav (unlinked, not deleted, while this frontend is repointed at QdosBackend)
                                    <li className="nav-item">
                                        <NavLink to="/inventory" className="group" onClick={() => toggleMenu('')}>
                                            <div className="flex items-center">
                                                <Inventory className="group-hover:!text-[#A1AEC0] shrink-0 text-[#A1AEC0]" />
                                                <span className="ltr:pl-3 rtl:pr-3 sidebartext">{t('Inventory')}</span>
                                            </div>
                                        </NavLink>
                                    </li>
                                    {userRole === 'admin' && (
                                        <>
                                            <li className="nav-item">
                                                <NavLink to="/earning" className="group" onClick={() => toggleMenu('')}>
                                                    <div className="flex items-center">
                                                        <HRM className="group-hover:!text-[#A1AEC0] shrink-0 text-[#A1AEC0]" />
                                                        <span className="ltr:pl-3 rtl:pr-3 sidebartext">{t('Earning')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>

                                            <li className="nav-item">
                                                <NavLink to="/companylist" className="group" onClick={() => toggleMenu('')}>
                                                    <div className="flex items-center">
                                                        <Timeprocessing className="group-hover:!text-[#A1AEC0] shrink-0 text-[#A1AEC0]" />
                                                        <span className="ltr:pl-3 rtl:pr-3 sidebartext">{t('People')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>

                                            <li className="nav-item">
                                                <NavLink to="/adminRequest" className="group" onClick={() => toggleMenu('')}>
                                                    <div className="flex items-center">
                                                        <Schedule className="group-hover:!text-[#A1AEC0] shrink-0 text-[#A1AEC0]" />
                                                        <span className="ltr:pl-3 rtl:pr-3 sidebartext">{t('Requests')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>
                                        </>
                                    )}

                                    {userRole === 'admin' && (
                                        <>
                                            <li className="nav-item">
                                                <NavLink to="/gym" className="group" onClick={() => toggleMenu('')}>
                                                    <div className="flex items-center">
                                                        <Timeprocessing className="group-hover:!text-[#A1AEC0] shrink-0 text-[#A1AEC0]" />
                                                        <span className="ltr:pl-3 rtl:pr-3 sidebartext">{t('Gym')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>

                                            <li className="nav-item">
                                                <NavLink to="/adminticket" className="group" onClick={() => toggleMenu('')}>
                                                    <div className="flex items-center">
                                                        <Timeprocessing className="group-hover:!text-[#A1AEC0] shrink-0 text-[#A1AEC0]" />
                                                        <span className="ltr:pl-3 rtl:pr-3 sidebartext">{t('Ticket')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>
                                        </>
                                    )}

                                    {userRole === 'gym_owner' && (
                                        <>
                                            <li className="nav-item">
                                                <NavLink to="/gym_ownerGym" className="group" onClick={() => toggleMenu('')}>
                                                    <div className="flex items-center">
                                                        <Timeprocessing className="group-hover:!text-[#A1AEC0] shrink-0 text-[#A1AEC0]" />
                                                        <span className="ltr:pl-3 rtl:pr-3 sidebartext">{t('Gym')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>

                                            <li className="nav-item">
                                                <NavLink to="/request" className="group" onClick={() => toggleMenu('')}>
                                                    <div className="flex items-center">
                                                        <Timeprocessing className="group-hover:!text-[#A1AEC0] shrink-0 text-[#A1AEC0]" />
                                                        <span className="ltr:pl-3 rtl:pr-3 sidebartext">{t('Requests')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>
                                        </>
                                    )}
                                    */}

                                    {userRole === 'admin' && (
                                        <>
                                            <li className="nav-item">
                                                <NavLink to="/qdos/restaurants" className="group" onClick={() => toggleMenu('')}>
                                                    <div className="flex items-center">
                                                        <Inventory className="group-hover:!text-[#A1AEC0] shrink-0 text-[#A1AEC0]" />
                                                        <span className="ltr:pl-3 rtl:pr-3 sidebartext">{t('Restaurants')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>

                                            <li className="nav-item">
                                                <NavLink to="/qdos/coupons" className="group" onClick={() => toggleMenu('')}>
                                                    <div className="flex items-center">
                                                        <HRM className="group-hover:!text-[#A1AEC0] shrink-0 text-[#A1AEC0]" />
                                                        <span className="ltr:pl-3 rtl:pr-3 sidebartext">{t('Coupons')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>

                                            <li className="nav-item">
                                                <NavLink to="/qdos/ride-fares" className="group" onClick={() => toggleMenu('')}>
                                                    <div className="flex items-center">
                                                        <Schedule className="group-hover:!text-[#A1AEC0] shrink-0 text-[#A1AEC0]" />
                                                        <span className="ltr:pl-3 rtl:pr-3 sidebartext">{t('Ride Fares')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>

                                            <li className="nav-item">
                                                <NavLink to="/qdos/locations" className="group" onClick={() => toggleMenu('')}>
                                                    <div className="flex items-center">
                                                        <Managesite className="group-hover:!text-[#A1AEC0] shrink-0 text-[#A1AEC0]" />
                                                        <span className="ltr:pl-3 rtl:pr-3 sidebartext">{t('Locations')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>

                                            <li className="nav-item">
                                                <NavLink to="/qdos/delivery-surge" className="group" onClick={() => toggleMenu('')}>
                                                    <div className="flex items-center">
                                                        <Reports className="group-hover:!text-[#A1AEC0] shrink-0 text-[#A1AEC0]" />
                                                        <span className="ltr:pl-3 rtl:pr-3 sidebartext">{t('Surge Pricing')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>

                                            <li className="nav-item">
                                                <NavLink to="/qdos/parcel-pricing" className="group" onClick={() => toggleMenu('')}>
                                                    <div className="flex items-center">
                                                        <Schedule className="group-hover:!text-[#A1AEC0] shrink-0 text-[#A1AEC0]" />
                                                        <span className="ltr:pl-3 rtl:pr-3 sidebartext">{t('Parcel Pricing')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>

                                            <li className="nav-item">
                                                <NavLink to="/qdos/rider-plans" className="group" onClick={() => toggleMenu('')}>
                                                    <div className="flex items-center">
                                                        <Timeprocessing className="group-hover:!text-[#A1AEC0] shrink-0 text-[#A1AEC0]" />
                                                        <span className="ltr:pl-3 rtl:pr-3 sidebartext">{t('Rider Plans')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>

                                            <li className="nav-item">
                                                <NavLink to="/qdos/wallet" className="group" onClick={() => toggleMenu('')}>
                                                    <div className="flex items-center">
                                                        <CRMPermissionIcon className="group-hover:!text-[#A1AEC0] shrink-0 text-[#A1AEC0]" />
                                                        <span className="ltr:pl-3 rtl:pr-3 sidebartext">{t('Platform Wallet')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>

                                            <li className="nav-item">
                                                <NavLink to="/qdos/payouts" className="group" onClick={() => toggleMenu('')}>
                                                    <div className="flex items-center">
                                                        <Reports className="group-hover:!text-[#A1AEC0] shrink-0 text-[#A1AEC0]" />
                                                        <span className="ltr:pl-3 rtl:pr-3 sidebartext">{t('Rider Payouts')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>

                                            <li className="nav-item">
                                                <NavLink to="/qdos/settings" className="group" onClick={() => toggleMenu('')}>
                                                    <div className="flex items-center">
                                                        <QdosSettingIcon className="group-hover:!text-[#A1AEC0] shrink-0 text-[#A1AEC0]" />
                                                        <span className="ltr:pl-3 rtl:pr-3 sidebartext">{t('Platform Settings')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>

                                            <li className="nav-item">
                                                <NavLink to="/qdos/orders" className="group" onClick={() => toggleMenu('')}>
                                                    <div className="flex items-center">
                                                        <Timeprocessing className="group-hover:!text-[#A1AEC0] shrink-0 text-[#A1AEC0]" />
                                                        <span className="ltr:pl-3 rtl:pr-3 sidebartext">{t('Orders')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>

                                            <li className="nav-item">
                                                <NavLink to="/qdos/users" className="group" onClick={() => toggleMenu('')}>
                                                    <div className="flex items-center">
                                                        <Reports className="group-hover:!text-[#A1AEC0] shrink-0 text-[#A1AEC0]" />
                                                        <span className="ltr:pl-3 rtl:pr-3 sidebartext">{t('Users')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>

                                            <li className="nav-item">
                                                <NavLink to="/qdos/riders" className="group" onClick={() => toggleMenu('')}>
                                                    <div className="flex items-center">
                                                        <Managesite className="group-hover:!text-[#A1AEC0] shrink-0 text-[#A1AEC0]" />
                                                        <span className="ltr:pl-3 rtl:pr-3 sidebartext">{t('Riders')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>

                                            <li className="nav-item">
                                                <NavLink to="/qdos/admins" className="group" onClick={() => toggleMenu('')}>
                                                    <div className="flex items-center">
                                                        <Manageservices className="group-hover:shrink-0" />
                                                        <span className="ltr:pl-3 rtl:pr-3 sidebartext">{t('Admins')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>
                                        </>
                                    )}

                                    {/* <li className="menu nav-item">
                                            <button type="button" className={`${currentMenu === 'Manage Site' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('Manage Site')}>
                                                <div className="flex items-center">
                                                    <HRM className="group-hover:!text-primary shrink-0" />
                                                    <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                                                        {t('Manage Site')}
                                                    </span>
                                                </div>

                                                <div className={currentMenu !== 'Manage Site' ? 'rtl:rotate-180 -rotate-180' : ''}>
                                                    <Down className='IconCaretDown' />
                                                </div>
                                            </button>

                                            <AnimateHeight duration={300} height={currentMenu === 'Manage Site' ? 'auto' : 0}>
                                                <ul className="sub-menu text-gray-500">
                                                    <li>
                                                        <NavLink to="/manage_customer">{t('Customers')}</NavLink>
                                                    </li>
                                                    <li>
                                                        <NavLink to="/manage_site">{t('Sites')}</NavLink>
                                                    </li>

                                                </ul>
                                            </AnimateHeight>
                                        </li> */}

                                    {/* 
                                        <li className="nav-item">
                                            <NavLink to="/manage_services" className="group" onClick={() => toggleMenu('')}>
                                                <div className="flex items-center">
                                                    <Manageservices className="group-hover:shrink-0 " />
                                                    <span className="ltr:pl-3 rtl:pr-3 sidebartext">{t('Manage Services')}</span>
                                                </div>
                                            </NavLink>
                                        </li> */}

                                    <li className="nav-item">
                                        <NavLink to="/crm-permissions" className="group" onClick={() => toggleMenu('')}>
                                            <div className="flex items-center">
                                                <CRMPermissionIcon className="group-hover:shrink-0 " />
                                                <span className="ltr:pl-3 rtl:pr-3 sidebartext">{t('Settings')}</span>
                                            </div>
                                        </NavLink>
                                    </li>

                                    {/* <li className="nav-item">
                                            <NavLink to="/guard/shift" className="group" onClick={() => toggleMenu('')}>
                                                <div className="flex items-center">
                                                    <Schedule className="group-hover:!text-[#A1AEC0] shrink-0 text-[#A1AEC0]" />
                                                    <span className="ltr:pl-3 rtl:pr-3 sidebartext">{t('Guard Shifts')}</span>
                                                </div>
                                            </NavLink>
                                        </li>
                                */}

                                    {/*                            
                                        <li className="nav-item">
                                            <NavLink to="/clock" className="group" onClick={() => toggleMenu('')}>
                                                <div className="flex items-center">
                                                    <HRM className="group-hover:!text-[#A1AEC0] shrink-0 text-[#A1AEC0]" />
                                                    <span className="ltr:pl-3 rtl:pr-3 sidebartext">{t('Clock IN/OUT')}</span>
                                                </div>
                                            </NavLink>
                                        </li> */}

                                    {/* <li className="menu nav-item">
                                        <button type="button" className={`${currentMenu === 'Setting' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('Setting')}>
                                            <div className="flex items-center">
                                                <Setting className="group-hover:shrink-0 " />
                                                <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">{t('Setting')}</span>
                                            </div>

                                            <div className={currentMenu !== 'Setting' ? 'rtl:rotate-180 -rotate-180' : ''}>
                                                <Down className='IconCaretDown' />
                                            </div>
                                        </button>

                                        <AnimateHeight duration={300} height={currentMenu === 'Setting' ? 'auto' : 0}>
                                            <ul className="sub-menu text-gray-500">
                                                <li>
                                                    <NavLink to="/Forms">{t('Forms')}</NavLink>
                                                </li>
                                            </ul>
                                        </AnimateHeight>
                                    </li> */}
                                </ul>
                            </li>
                        </ul>
                    </PerfectScrollbar>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
