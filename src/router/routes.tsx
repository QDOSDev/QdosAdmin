import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoutes';
const Index = lazy(() => import('../pages/dashboard/Index'));
const Login = lazy(() => import('../pages/Auth/Login'));

const RestaurantList = lazy(() => import('../pages/Qdos/Restaurants/RestaurantList'));
const CouponList = lazy(() => import('../pages/Qdos/Coupons/CouponList'));
const RideFareList = lazy(() => import('../pages/Qdos/RideFares/RideFareList'));
const ParcelPricingList = lazy(() => import('../pages/Qdos/ParcelPricing/ParcelPricingList'));
const PilotPricing = lazy(() => import('../pages/Qdos/HirePilot/PilotPricing'));
const PilotBookings = lazy(() => import('../pages/Qdos/HirePilot/PilotBookings'));
const PilotLive = lazy(() => import('../pages/Qdos/HirePilot/PilotLive'));
const PilotApprovals = lazy(() => import('../pages/Qdos/HirePilot/PilotApprovals'));
const DeliverySurgeSettings = lazy(() => import('../pages/Qdos/DeliverySurge/DeliverySurgeSettings'));
const RiderPlanForm = lazy(() => import('../pages/Qdos/RiderPlans/RiderPlanForm'));
const PlatformWallet = lazy(() => import('../pages/Qdos/Wallet/PlatformWallet'));
const PayoutList = lazy(() => import('../pages/Qdos/Payouts/PayoutList'));
const LocationList = lazy(() => import('../pages/Qdos/Locations/LocationList'));
const PlatformSettings = lazy(() => import('../pages/Qdos/Settings/PlatformSettings'));
const OrderList = lazy(() => import('../pages/Qdos/Orders/OrderList'));
const RideList = lazy(() => import('../pages/Qdos/Rides/RideList'));
const UserList = lazy(() => import('../pages/Qdos/Users/UserList'));
const RiderList = lazy(() => import('../pages/Qdos/Riders/RiderList'));
const CreateAdmin = lazy(() => import('../pages/Qdos/Admins/CreateAdmin'));
const AdvertisementList = lazy(() => import('../pages/Qdos/Advertisements/AdvertisementList'));

const routes = [
    {
        path: '/',
        element: <Login />,
        layout: 'blank',
    },
    {
        path: '/dashboard',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <Index />
            </ProtectedRoute>
        ),
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
        path: '/qdos/parcel-pricing',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <ParcelPricingList />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/qdos/delivery-surge',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <DeliverySurgeSettings />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/qdos/advertisements',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <AdvertisementList />
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
        path: '/qdos/wallet',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <PlatformWallet />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/qdos/payouts',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <PayoutList />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/qdos/pilot-pricing',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <PilotPricing />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/qdos/pilot-approvals',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <PilotApprovals />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/qdos/pilot-live',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <PilotLive />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/qdos/pilot-bookings',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <PilotBookings />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/qdos/locations',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <LocationList />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/qdos/settings',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <PlatformSettings />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/qdos/rides',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <RideList />
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
    // old template URLs (gym, HRM, tickets, ...) and typos land on the dashboard
    {
        path: '*',
        element: <Navigate to="/dashboard" replace />,
        layout: 'blank',
    },
];

export { routes };