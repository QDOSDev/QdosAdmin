import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoutes';
const Index = lazy(() => import('../pages/dashboard/Index'));
const Login = lazy(() => import('../pages/Auth/Login'));
const ManageSite = lazy(() => import('../pages/Manage_site/Manage'));
const AddGaurd = lazy(() => import('../pages/HRM/AddGaurds'));
const OTP = lazy(() => import('../pages/Auth/Otp'));
const Company = lazy(() => import('../pages/usersRoles/RolesUserList'));
const ManageTrash = lazy(() => import('../pages/Manage_site/manageTrash'));
const Addpepople = lazy(() => import('../pages/HRM/Trainers/Add_gaurd'));
const AddSite = lazy(() => import('../pages/Manage_site/AddorEditSite'));
const AddShift = lazy(() => import('../pages/Schedule/addShift'));
// const Guardshift = lazy(() => import('../pages/guard/shift'));
const Permissions = lazy(() => import('../pages/Permission/crm-permissions'));
const Editpermissions = lazy(() => import('../pages/Permission/role-editor'));
const ScheduleInterface = lazy(() => import('../pages/shift/newtest'));
const ProfilePage = lazy(() => import('../pages/profile'));
const AddCompany = lazy(() => import('../pages/usersRoles/Companyadd'));
const Customertimetable = lazy(() => import('../pages/Timeprocessing/customer-time-table'));
const Geolocation = lazy(() => import('../pages/Location/googlemap'));
const Gym = lazy(() => import('../pages/Gym/ManageGym'));
const GYmPage = lazy(() => import('../pages/Gym/Viewgym'));
const Earning = lazy(() => import('../pages/Earnings/list'));
const GymOwnerGym = lazy(() => import('../pages/Gym/gym_ownerManage'));
const GymView = lazy(() => import('../pages/Gym/GymownerViewgym'));
const AddGym = lazy(() => import('../pages/Gym/addGym'));
const AdminTicket = lazy(() => import('../pages/ticket/list'));
const AdminMessage = lazy(() => import('../pages/ticket/messages'));
const Request = lazy(() => import('../pages/Requests/list'));
const AdminRequest = lazy(() => import('../pages/Requests/adminList'));

// Qdos admin console
const RestaurantList = lazy(() => import('../pages/Qdos/Restaurants/RestaurantList'));
const CouponList = lazy(() => import('../pages/Qdos/Coupons/CouponList'));
const RideFareList = lazy(() => import('../pages/Qdos/RideFares/RideFareList'));
const RiderPlanForm = lazy(() => import('../pages/Qdos/RiderPlans/RiderPlanForm'));
const OrderList = lazy(() => import('../pages/Qdos/Orders/OrderList'));
const UserList = lazy(() => import('../pages/Qdos/Users/UserList'));
const RiderList = lazy(() => import('../pages/Qdos/Riders/RiderList'));
const CreateAdmin = lazy(() => import('../pages/Qdos/Admins/CreateAdmin'));

const routes = [
    {
        path: '/',
        element: <Login />,
        layout: 'blank',
    },
    {
        path: '/otp',
        element: <OTP />,
        layout: 'blank',
    },
    {
        path: '/dashboard',
        element: <Index />,
    },
    {
        path: '/gym',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <Gym />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/request',
        element: (
            <ProtectedRoute allowedRoles={['gym_owner']}>
                <Request />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/adminRequest',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <AdminRequest />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/adminticket',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <AdminTicket />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/adminmessages/:id',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <AdminMessage />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/companylist',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <Company />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/gym_ownerGym',
        element: (
            <ProtectedRoute allowedRoles={['gym_owner']}>
                <GymOwnerGym />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/addGym',
        element: (
            <ProtectedRoute allowedRoles={['gym_owner']}>
                <AddGym />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/earning',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <Earning />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/gymView/:id',
        element: <GYmPage />,
        layout: 'default',
    },
    {
        path: '/viewGym/:id',
        element: (
            <ProtectedRoute allowedRoles={['admin', 'gym_owner']}>
                <GymView />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/addCompany',
        element: <AddCompany />,
        layout: 'blank',
    },
    // {
    //     path: '/inventory',
    //     element: <Inventory />,
    //     layout: 'default',
    // },
    // {
    //     path: '/clock',
    //     element: <Clock />,
    //     layout: 'default',
    // },
    // {
    //     path: '/managepeople',
    //     element: <ManagePeople />,
    //     layout: 'default',
    // },
    {
        path: '/add/user',
        element: <Addpepople />,
        layout: 'default',
    },
    // {
    //     path: '/edit/user/:id',
    //     element: <EditGaurd />,
    //     layout: 'default',
    // },
    {
        path: '/manage_site',
        element: <ManageSite />,
        layout: 'default',
    },
    {
        path: '/add/site',
        element: <AddSite />,
        layout: 'default',
    },
    {
        path: '/edit/site/:siteId',
        element: <AddSite />,
        layout: 'default',
    },
    {
        path: '/manage_customer',
        element: <ManageTrash />,
        layout: 'default',
    },
    // {
    //     path: '/manage_services',
    //     element: <Manage_services />,
    //     layout: 'default',
    // },
    // {
    //     path: '/schedule',
    //     element: <Shift />,
    //     layout: 'default',
    // },
    {
        path: '/add/Shift',
        element: <AddShift />,
        layout: 'default',
    },
    {
        path: '/timeprocessing',
        element: <Customertimetable />,
        layout: 'default',
    },
    {
        path: '/crm-permissions',
        element: <Permissions />,
        layout: 'default',
    },
    {
        path: '/crm-permissions/edit/:role_id',
        element: <Editpermissions />,
        layout: 'default',
    },
    {
        path: '/profile',
        element: (
            <ProtectedRoute allowedRoles={['admin', 'gym_owner']}>
                <ProfilePage />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    // {
    //     path: '/rejectedShifts',
    //     element: <RejectedShift />,
    //     layout: 'default',
    // },
    // {
    //     path: '/guard/shift',
    //     element: <Guardshift />,
    //     layout: 'default',
    // },
    {
        path: '/Geolocation',
        element: <Geolocation />,
        layout: 'default',
    },
    {
        path: '/ScheduleInterface',
        element: <ScheduleInterface />,
        layout: 'default',
    },
    {
        path: '/qdos/restaurants',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <RestaurantList />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/qdos/coupons',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <CouponList />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/qdos/ride-fares',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <RideFareList />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/qdos/rider-plans',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <RiderPlanForm />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/qdos/orders',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <OrderList />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/qdos/users',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <UserList />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/qdos/riders',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <RiderList />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/qdos/admins',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <CreateAdmin />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
];

export { routes };