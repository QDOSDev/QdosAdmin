import apiClient from '../utils/api';

// ---- Admin auth ----

export const adminLogin = (email: string, password: string) => apiClient.post('/admin/login', { email, password }).then((r) => r.data);

export const createAdmin = (payload: { name: string; email: string; password: string }) => apiClient.post('/admin/create', payload).then((r) => r.data);

export const refreshToken = (refreshToken: string) => apiClient.post('/auth/refresh-token', { refreshToken }).then((r) => r.data);

// ---- Restaurants ----

export interface RestaurantListParams {
    status?: string;
    isBlocked?: boolean;
    page?: number;
    limit?: number;
}

export const getRestaurants = (params: RestaurantListParams = {}) => apiClient.get('/admin/restaurants', { params }).then((r) => r.data);

export const updateRestaurantStatus = (restaurantId: string, status: string) => apiClient.patch(`/admin/restaurants/${restaurantId}/status`, { status }).then((r) => r.data);

export const blockRestaurant = (restaurantId: string, reason?: string) => apiClient.patch(`/admin/restaurants/${restaurantId}/block`, { reason }).then((r) => r.data);

export const unblockRestaurant = (restaurantId: string) => apiClient.patch(`/admin/restaurants/${restaurantId}/unblock`).then((r) => r.data);

export const editRestaurant = (restaurantId: string, payload: Record<string, any>) => apiClient.patch(`/admin/restaurants/${restaurantId}`, payload).then((r) => r.data);

export const setRestaurantCommission = (restaurantId: string, type: 'PERCENTAGE' | 'FIXED', value: number) =>
    apiClient.patch(`/admin/restaurants/${restaurantId}/commission`, { type, value }).then((r) => r.data);

// ---- Coupons ----

export interface CouponListParams {
    status?: 'active' | 'inactive';
    page?: number;
    limit?: number;
}

export const getCoupons = (params: CouponListParams = {}) => apiClient.get('/admin/coupons', { params }).then((r) => r.data);

export const getCouponById = (couponId: string) => apiClient.get(`/admin/coupons/${couponId}`).then((r) => r.data);

export const createCoupon = (payload: Record<string, any>) => apiClient.post('/admin/coupons', payload).then((r) => r.data);

export const updateCoupon = (couponId: string, payload: Record<string, any>) => apiClient.patch(`/admin/coupons/${couponId}`, payload).then((r) => r.data);

export const deleteCoupon = (couponId: string) => apiClient.delete(`/admin/coupons/${couponId}`).then((r) => r.data);

// ---- Orders ----

export interface OrderListParams {
    status?: string;
    userId?: string;
    restaurantId?: string;
    riderId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

export const getOrders = (params: OrderListParams = {}) => apiClient.get('/admin/orders', { params }).then((r) => r.data);

export const getOrderById = (orderId: string) => apiClient.get(`/admin/orders/${orderId}`).then((r) => r.data);

export const getOrderStats = (params: { startDate?: string; endDate?: string } = {}) => apiClient.get('/admin/orders/stats', { params }).then((r) => r.data);

export const forceCancelOrder = (orderId: string, reason?: string) => apiClient.post(`/admin/orders/${orderId}/force-cancel`, { reason }).then((r) => r.data);

// ---- Users ----

export interface UserListParams {
    role?: 'user' | 'partner';
    isBlocked?: boolean;
    q?: string;
    page?: number;
    limit?: number;
}

export const getUsers = (params: UserListParams = {}) => apiClient.get('/admin/users', { params }).then((r) => r.data);

export const getUserById = (userId: string) => apiClient.get(`/admin/users/${userId}`).then((r) => r.data);

export const blockUser = (userId: string, reason?: string) => apiClient.patch(`/admin/users/${userId}/block`, { reason }).then((r) => r.data);

export const unblockUser = (userId: string) => apiClient.patch(`/admin/users/${userId}/unblock`).then((r) => r.data);

// ---- Riders (admin management) ----

export interface RiderListParams {
    status?: 'pending' | 'approved' | 'rejected' | 'blocked';
    page?: number;
    limit?: number;
}

export const getRiders = (params: RiderListParams = {}) => apiClient.get('/admin/riders', { params }).then((r) => r.data);

export const getRiderById = (riderId: string) => apiClient.get(`/admin/riders/${riderId}`).then((r) => r.data);

export const updateRiderStatus = (riderId: string, status: 'pending' | 'approved' | 'rejected' | 'blocked', rejectionReason?: string) =>
    apiClient.patch(`/admin/riders/${riderId}/status`, { status, rejectionReason }).then((r) => r.data);

// ---- Ride fare plans ----

export const getRideFarePlans = () => apiClient.get('/admin/ride-fares').then((r) => r.data);

export const upsertRideFarePlan = (payload: Record<string, any>) => apiClient.post('/admin/ride-fares', payload).then((r) => r.data);

// ---- Rider plan ----

export const upsertRiderPlan = (payload: { type: 'daily' | 'weekly' | 'monthly'; amount: number; features: string[] }) =>
    apiClient.post('/admin/plan', payload).then((r) => r.data);
