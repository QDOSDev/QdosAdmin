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

export const getRestaurantById = (restaurantId: string) => apiClient.get(`/admin/restaurants/${restaurantId}`).then((r) => r.data);

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
    // only "deliver to someone else" orders
    forSomeoneElse?: boolean;
    // order number, or receiver / customer name or phone
    search?: string;
    page?: number;
    limit?: number;
}

export const getOrders = (params: OrderListParams = {}) => apiClient.get('/admin/orders', { params }).then((r) => r.data);

export const getOrderById = (orderId: string) => apiClient.get(`/admin/orders/${orderId}`).then((r) => r.data);

export const getOrderStats = (params: { startDate?: string; endDate?: string } = {}) => apiClient.get('/admin/orders/stats', { params }).then((r) => r.data);

// ---- Rides (cab + parcel) ----

export type RideStatus = 'REQUESTED' | 'ACCEPTED' | 'ARRIVED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface RideListParams {
    // ACTIVE = ACCEPTED + ARRIVED + ONGOING
    status?: RideStatus | 'ACTIVE';
    bookingType?: 'PASSENGER' | 'PARCEL';
    vehicleType?: 'MOTO' | 'AUTO' | 'CAR_ECONOMY' | 'CAR_AC' | 'TEMPO';
    forSomeoneElse?: boolean;
    // ride number, or name/phone of booker, passenger, rider, parcel sender/receiver
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

// { rides, counts (per status + ACTIVE + ALL), revenue (completed rides), pagination }
export const getRides = (params: RideListParams = {}) => apiClient.get('/admin/rides', { params }).then((r) => r.data);

export const getRideById = (rideId: string) => apiClient.get(`/admin/rides/${rideId}`).then((r) => r.data);

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
    // only riders with this service turned on — 'pilot' = Hire a Pilot drivers
    service?: 'delivery' | 'cab' | 'parcel' | 'pilot';
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
// There's only ever one active plan (upserted by an empty filter, not keyed
// by id) — the price + duration of the recharge every rider pays to stay
// online.

export const getRiderPlan = () => apiClient.get('/admin/plan').then((r) => r.data);

export const upsertRiderPlan = (payload: { price: number; durationHours?: number }) => apiClient.post('/admin/plan', payload).then((r) => r.data);

// ---- Platform wallet ----
// The pool RIDE coupon discounts are funded from. When a passenger's fare is
// discounted, the rider is still paid their full commission and the
// difference is debited from here instead — an internal ledger admin tops
// up out of the business's own budget, not a rider's own recharge wallet.

export const getPlatformWallet = () => apiClient.get('/admin/wallet').then((r) => r.data);

export const topUpPlatformWallet = (amount: number) => apiClient.post('/admin/wallet/topup', { amount }).then((r) => r.data);

// ---- Rider payouts ----
// A rider requests a withdrawal of rider.earnings.available against their
// saved bank details (POST /api/v1/riders/payouts, rider-side); admin's job
// here is to see the request + bank details, do the actual bank transfer
// themselves (no payment gateway wired up for payouts), then mark it
// complete or reject it.

export interface PayoutListParams {
    status?: 'PENDING' | 'COMPLETED' | 'REJECTED';
    riderId?: string;
    page?: number;
    limit?: number;
}

export const getPayouts = (params: PayoutListParams = {}) => apiClient.get('/admin/payouts', { params }).then((r) => r.data);

export const getPayoutById = (payoutId: string) => apiClient.get(`/admin/payouts/${payoutId}`).then((r) => r.data);

export const completePayout = (payoutId: string, referenceId: string) => apiClient.patch(`/admin/payouts/${payoutId}/complete`, { referenceId }).then((r) => r.data);

export const rejectPayout = (payoutId: string, reason: string) => apiClient.patch(`/admin/payouts/${payoutId}/reject`, { reason }).then((r) => r.data);

// ---- States & Cities ----
// Cities are geolocated service zones (center point + radius), not just
// labels — a ride's pickup point is matched against them both to pick which
// RideFarePlan.city applies and to enforce a per-city ride ban.

export const getStates = (params: { isActive?: boolean } = {}) => apiClient.get('/admin/states', { params }).then((r) => r.data);

export const createState = (payload: { name: string; code?: string }) => apiClient.post('/admin/states', payload).then((r) => r.data);

export const updateState = (stateId: string, payload: Record<string, any>) => apiClient.patch(`/admin/states/${stateId}`, payload).then((r) => r.data);

export const deleteState = (stateId: string) => apiClient.delete(`/admin/states/${stateId}`).then((r) => r.data);

// Paginated response: { cities, totalCities, currentPage, totalPages } —
// real city data is thousands of rows (see the backend's
// scripts/seedIndiaStatesAndCities.js), so callers that genuinely want
// "all of them" in one shot (e.g. a dropdown) pass a limit past the real
// ceiling (~4300 for India) rather than relying on an unpaginated response.
export const getCities = (params: { stateId?: string; isActive?: boolean; q?: string; page?: number; limit?: number } = {}) =>
    apiClient.get('/admin/cities', { params }).then((r) => r.data);

export const createCity = (payload: { name: string; stateId: string; location: { lat: number; lng: number }; radiusKm?: number }) =>
    apiClient.post('/admin/cities', payload).then((r) => r.data);

export const getCityById = (cityId: string) => apiClient.get(`/admin/cities/${cityId}`).then((r) => r.data);

export const updateCity = (cityId: string, payload: Record<string, any>) => apiClient.patch(`/admin/cities/${cityId}`, payload).then((r) => r.data);

export const deleteCity = (cityId: string) => apiClient.delete(`/admin/cities/${cityId}`).then((r) => r.data);

export const setCityRideBan = (cityId: string, banned: boolean, reason?: string) => apiClient.patch(`/admin/cities/${cityId}/ride-ban`, { banned, reason }).then((r) => r.data);

// ---- Platform settings ----
// Single settings document (GST rate today) that feeds every food order's
// pricing.tax at checkout (services/user/pricing.service.js on the backend).

export const getPlatformSettings = () => apiClient.get('/admin/settings').then((r) => r.data);

export const updatePlatformSettings = (payload: { gstPercentage?: number; onlinePaymentFeePercentage?: number }) => apiClient.patch('/admin/settings', payload).then((r) => r.data);

// ---- Parcel pricing ----
// A flat surcharge per parcel weight bucket, added on top of the normal
// distance/time ride fare for a PARCEL booking (see POST
// /api/v1/user/rides/book -> fare.parcelSurcharge on the backend). Always
// exactly 4 fixed rows (self-seeded with a 0 surcharge server-side) — this
// is an edit-in-place table, not a create/delete list.

export type ParcelWeightBucket = 'UPTO_2KG' | '2_5KG' | '5_10KG' | 'ABOVE_10KG';

export const getParcelPricingTiers = () => apiClient.get('/admin/parcel-pricing').then((r) => r.data);

export const updateParcelPricingTier = (weightBucket: ParcelWeightBucket, payload: { surchargeAmount?: number; isActive?: boolean }) =>
    apiClient.patch(`/admin/parcel-pricing/${weightBucket}`, payload).then((r) => r.data);

// ---- Delivery surge pricing ----
// Backend-driven automatic surge for food delivery, zoned by the existing
// City service areas (Locations page) — a flat admin-configured base
// delivery fee gets multiplied up when a zone's live demand (active orders)
// outpaces its supply (online, available, fresh-location riders). See
// services/delivery/deliverySurge.service.js on the backend for the full
// algorithm (thresholds, hysteresis/stability, min-demand gate, caps).

export interface DeliverySurgeSettings {
    _id?: string;
    enabled: boolean;
    baseDeliveryFee: number;
    riderBaseFare: number;
    riderPerKmRate: number;
    rollingWindowMinutes: number;
    riderFreshnessMinutes: number;
    updateIntervalSeconds: number;
    minDemandForSurge: number;
    maxMultiplier: number;
    maxAdditionalFee: number | null;
    thresholds: { ratio: number; multiplier: number }[];
    stabilityPeriodMinutes: number;
    quoteValiditySeconds: number;
}

export const getDeliverySurgeSettings = () => apiClient.get('/admin/delivery-surge/settings').then((r) => r.data);

export const updateDeliverySurgeSettings = (payload: Partial<DeliverySurgeSettings>) =>
    apiClient.patch('/admin/delivery-surge/settings', payload).then((r) => r.data);

export interface CitySurgeOverride {
    enabled?: boolean | null;
    baseDeliveryFee?: number | null;
    maxMultiplier?: number | null;
    maxAdditionalFee?: number | null;
    minDemandForSurge?: number | null;
}

export const updateCitySurgeOverride = (cityId: string, payload: CitySurgeOverride) =>
    apiClient.patch(`/admin/delivery-surge/cities/${cityId}/override`, payload).then((r) => r.data);

export const getDeliverySurgeStatus = () => apiClient.get('/admin/delivery-surge/status').then((r) => r.data);

// Cab/parcel rides share this exact same engine/settings/override — see the
// backend's services/ride/rideSurge.service.js. One row per (city,
// vehicleType, bookingType) pool instead of one per city, since cab and
// parcel draw from separate rider pools even for the same vehicle type.
export const getDeliveryRideSurgeStatus = () => apiClient.get('/admin/delivery-surge/ride-status').then((r) => r.data);

export const previewDeliveryFee = (lat: number, lng: number) => apiClient.post('/admin/delivery-surge/preview', { lat, lng }).then((r) => r.data);

export const getDeliverySurgeAudit = (params: { page?: number; limit?: number } = {}) =>
    apiClient.get('/admin/delivery-surge/audit', { params }).then((r) => r.data);

// ---- Chat (read-only, for support/dispute investigation) ----
// Admin only ever reads a rider<->customer thread here, never sends into it
// — the live back-and-forth happens entirely between the app rider/customer
// (see POST /user/chats and POST /riders/chats on the backend).

export const getChatMessages = (refType: 'Order' | 'Ride', refId: string) =>
    apiClient.get(`/admin/chats/${refType}/${refId}/messages`, { params: { limit: 200 } }).then((r) => r.data);

// ---- Advertisements (home screen carousel banners in the user app) ----

export interface Advertisement {
    _id: string;
    image: { url: string; public_id: string };
    title?: string;
    linkUrl?: string;
    displayOrder: number;
    isActive: boolean;
    startDate?: string | null;
    endDate?: string | null;
    createdAt?: string;
}

// multiple files in one request — each becomes its own banner
export const uploadAdvertisements = (files: File[]) => {
    const form = new FormData();
    files.forEach((file) => form.append('images', file));
    return apiClient.post('/admin/advertisements', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
};

export const getAdvertisements = (params: { page?: number; limit?: number } = {}) =>
    apiClient.get('/admin/advertisements', { params }).then((r) => r.data);

export const updateAdvertisement = (adId: string, payload: Partial<Pick<Advertisement, 'title' | 'linkUrl' | 'displayOrder' | 'isActive' | 'startDate' | 'endDate'>>) =>
    apiClient.patch(`/admin/advertisements/${adId}`, payload).then((r) => r.data);

export const deleteAdvertisement = (adId: string) => apiClient.delete(`/admin/advertisements/${adId}`).then((r) => r.data);

// ---- Hire a Pilot (a driver drives the customer's own car for an hours package) ----
// Customer pays package + surcharges + platform fee online; time beyond the
// package is billed per minute (extraPerHour / 60) and paid to the pilot in
// cash. Money values are snapshotted per booking, so edits here only affect
// new bookings.

export type PilotTripType = 'ONE_WAY' | 'ROUND_TRIP';
export type PilotTransmission = 'MANUAL' | 'AUTOMATIC' | 'LUXURY';
export type PilotBookingStatus = 'PAYMENT_PENDING' | 'SEARCHING' | 'ACCEPTED' | 'ARRIVED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';

export interface PilotSettings {
    isEnabled: boolean;
    extraPerHour: number;
    extraGraceMinutes: number;
    platformFee: number;
    commissionPercentage: number;
    requestValidityMinutes: number;
    searchRadiusKm: number;
    cancellationFee: number;
    minScheduleLeadMinutes: number;
    maxAdvanceBookingDays: number;
    tripTypeSurcharge: Record<PilotTripType, number>;
    transmissionSurcharge: Record<PilotTransmission, number>;
}

export interface PilotPackage {
    _id: string;
    name?: string;
    hours: number;
    kmLimit?: number;
    price: number;
    badge?: string;
    extraPerHour?: number;
    displayOrder: number;
    isActive: boolean;
}

// null clears name / badge / extraPerHour (extraPerHour null -> use the global rate)
export type PilotPackagePayload = {
    name?: string | null;
    hours?: number;
    kmLimit?: number;
    price?: number;
    badge?: string | null;
    extraPerHour?: number | null;
    displayOrder?: number;
    isActive?: boolean;
};

export interface PilotBookingListParams {
    status?: string; // comma-separated PilotBookingStatus values
    startDate?: string;
    endDate?: string;
    search?: string; // booking number
    page?: number;
    limit?: number;
}

export const getPilotSettings = () => apiClient.get('/admin/pilot/settings').then((r) => r.data);

export const updatePilotSettings = (payload: Partial<PilotSettings>) => apiClient.patch('/admin/pilot/settings', payload).then((r) => r.data);

export const getPilotPackages = () => apiClient.get('/admin/pilot/packages').then((r) => r.data);

export const createPilotPackage = (payload: PilotPackagePayload) => apiClient.post('/admin/pilot/packages', payload).then((r) => r.data);

export const updatePilotPackage = (packageId: string, payload: PilotPackagePayload) => apiClient.patch(`/admin/pilot/packages/${packageId}`, payload).then((r) => r.data);

export const deletePilotPackage = (packageId: string) => apiClient.delete(`/admin/pilot/packages/${packageId}`).then((r) => r.data);

export const getPilotBookings = (params: PilotBookingListParams = {}) => apiClient.get('/admin/pilot/bookings', { params }).then((r) => r.data);

export const getPilotBookingById = (bookingId: string) => apiClient.get(`/admin/pilot/bookings/${bookingId}`).then((r) => r.data);

// pilot applications — Hire a Pilot has its own approval, separate from the rider account
export type PilotApplicationStatus = 'pending' | 'approved' | 'rejected';

export const getPilotApplications = (params: { status?: PilotApplicationStatus; search?: string; page?: number; limit?: number } = {}) =>
    apiClient.get('/admin/pilot/applications', { params }).then((r) => r.data);

export const reviewPilotApplication = (riderId: string, payload: { status: 'approved' | 'rejected'; reason?: string }) =>
    apiClient.patch(`/admin/pilot/applications/${riderId}`, payload).then((r) => r.data);

// live monitor: { serverTime, counts, bookings (SEARCHING/ACCEPTED/ARRIVED/ONGOING), pilots (online or on a job) }
export const getPilotLive = () => apiClient.get('/admin/pilot/live').then((r) => r.data);

// full refund unless refundAmount is given (partial)
export const cancelPilotBooking = (bookingId: string, payload: { reason?: string; refundAmount?: number }) =>
    apiClient.post(`/admin/pilot/bookings/${bookingId}/cancel`, payload).then((r) => r.data);

// only for a booking whose refund.status is FAILED
export const retryPilotRefund = (bookingId: string) => apiClient.post(`/admin/pilot/bookings/${bookingId}/refund`).then((r) => r.data);
