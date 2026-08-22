import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { message } from 'antd';
import axios from 'axios';
import Cookies from 'js-cookie';

const endpoint = import.meta.env.VITE_API_LIVEHOST;
const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;
const token = Cookies.get('token');

const initialState = {
    customers: [],
    loading: false,
    error: null,
    users: [],
    gym: [],
    gyms: [],
    requests: [],
    profileData: [],
    GymownerGym: [],
    activeGym: null,
    gymCounts: {
        pending: 0,
        approved: 0,
        rejected: 0,
    },
    AdminReqList: [],
    GymOwnergymCounts: {
        pending: 0,
        approved: 0,
        rejected: 0,
    },
    pagination: {
        totalUsers: 0,
        totalPages: 1,
        currentPage: 1,
        hasNextPage: false,
        hasPreviousPage: false,
        nextPage: null,
        previousPage: null,
    },
    gymOwnerpagination: {
        totalUsers: 0,
        totalPages: 1,
        currentPage: 1,
        hasNextPage: false,
        hasPreviousPage: false,
        nextPage: null,
        previousPage: null,
    },
};

export const fetchCustomers = createAsyncThunk('customer/fetchCustomers', async (_, { rejectWithValue }) => {
    try {
        const { data } = await axios.get(`${endpoint}?route=admin/Get/Customer`, {
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (data.status) {
            return data.Data;
        } else {
            return rejectWithValue('Failed to fetch customers.');
        }
    } catch (error) {
        return rejectWithValue('Error fetching customer data.');
    }
});

export const fetchUsers = createAsyncThunk(
    'customer/fetchUsers',
    async (
        args: {
            page?: number;
            limit?: number;
            name?: string;
            email?: string;
            role?: string;
        } = {},
        { rejectWithValue }
    ) => {
        try {
            const { page = 1, limit = 10, name = '', email = '', role = '' } = args;

            const { data } = await axios.get(`${endpoint}/v1/admin/list/listingUser`, {
                params: { page, limit, name, email, role },
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (data.success) {
                return data.data;
            } else {
                return rejectWithValue('Failed to fetch users.');
            }
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.message || 'Error fetching user data.');
        }
    }
);

export const fetchGym = createAsyncThunk(
    'customer/fetchGym',
    async (
        args: {
            page?: number;
            limit?: number;
            name?: string;
            email?: string;
            role?: string;
            pan?: string;
            license_no?: string;
            address?: string;
            phone?: string;
            status?: string;
        } = {},
        { rejectWithValue }
    ) => {
        try {
            const { page = 1, limit = 10, name = '', email = '', role = '', pan = '', license_no = '', address = '', phone = '', status = '' } = args;

            const { data } = await axios.get(`${endpoint}/v1/admin/list/listingGym`, {
                params: {
                    page,
                    limit,
                    name,
                    email,
                    role,
                    pan,
                    license_no,
                    address,
                    phone,
                    status,
                },
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (data.success) {
                return {
                    gyms: data.data,
                    pagination: data.pagination,
                    counts: data.counts,
                };
            } else {
                return rejectWithValue('Failed to fetch gym data.');
            }
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.message || 'Error fetching gym data.');
        }
    }
);

export const activeGym = createAsyncThunk('customer/activeGym', async (gymId: string, { rejectWithValue }) => {
    try {
        const { data } = await axios.post(
            `${endpoint}/v1/gymOwner/updateGym/gymUpd`,
            { gymId },
            {
                headers: {
                    token: token,
                },
            }
        );
        if (data.success) {
            window.location.reload();
            return {
                activeGym: data.gym,
            };
        } else {
            return rejectWithValue('Failed to fetch gym data.');
        }
    } catch (error: any) {
        return rejectWithValue(error?.response?.data?.message || 'Error fetching gym data.');
    }
});

export const GymownerGymList = createAsyncThunk(
    'customer/GymownerGymList',
    async (
        args: {
            page?: number;
            limit?: number;
            name?: string;
            status?: string;
        } = {},
        { rejectWithValue }
    ) => {
        try {
            const { page = 1, limit = 10, name = '', status = '' } = args;

            const { data } = await axios.get(`${endpoint}/v1/gymOwner/listing/gymList`, {
                params: {
                    page,
                    limit,
                    name,
                    status,
                },
                headers: {
                    'Content-Type': 'application/json',
                    token: token,
                },
            });
            if (data.success) {
                return {
                    gyms: data.data,
                    pagination: data.pagination,
                    counts: data.counts,
                };
            } else {
                return rejectWithValue('Failed to fetch gym data.');
            }
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.message || 'Error fetching gym data.');
        }
    }
);

export const profile = createAsyncThunk('customer/profile', async (_, { rejectWithValue }) => {
    try {
        const token = Cookies.get('token');
        const { data } = await axios.get(`${endpoint}/v1/auth/getProfile`, {
            headers: {
                token: token,
            },
        });

        if (data.success) {
            return data.data[0];
        } else {
            return rejectWithValue('Failed to fetch profile data.');
        }
    } catch (error: any) {
        return rejectWithValue(error?.response?.data?.message || 'Error fetching profile data.');
    }
});

export const requestList = createAsyncThunk('customer/requestList', async (_, { rejectWithValue }) => {
    try {
        const { data } = await axios.get(`${endpoint}/v1/gymOwner/listing/reqList`, {
            headers: {
                token: token,
            },
        });

        if (data.success) {
            return data.data;
        } else {
            return rejectWithValue('Failed to fetch profile data.');
        }
    } catch (error: any) {
        return rejectWithValue(error?.response?.data?.message || 'Error fetching profile data.');
    }
});

export const AdminrequestList = createAsyncThunk('customer/AdminrequestList', async (_, { rejectWithValue }) => {
    try {
        const { data } = await axios.get(`${endpoint}/v1/admin/list/listingreq`, {
            headers: {
                token: token,
            },
        });

        if (data.success) {
            return data.data;
        } else {
            return rejectWithValue('Failed to fetch profile data.');
        }
    } catch (error: any) {
        return rejectWithValue(error?.response?.data?.message || 'Error fetching profile data.');
    }
});

const customerSlice = createSlice({
    name: 'customer',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCustomers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCustomers.fulfilled, (state, action) => {
                state.loading = false;
                state.customers = action.payload;
            })
            .addCase(fetchCustomers.rejected, (state, action) => {
                state.loading = false;
                message.error(action.payload as string);
            })
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.users;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                message.error(action.payload as string);
            })
            .addCase(fetchGym.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGym.fulfilled, (state, action) => {
                state.loading = false;
                state.gym = action.payload.gyms;
                state.pagination = action.payload.pagination;
                state.gymCounts = action.payload.counts || {
                    pending: 0,
                    approved: 0,
                    rejected: 0,
                };
            })
            .addCase(fetchGym.rejected, (state, action) => {
                state.loading = false;
                message.error(action.payload as string);
            })

            .addCase(activeGym.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(activeGym.fulfilled, (state, action) => {
                state.loading = false;
                state.activeGym = action.payload.activeGym;
            })
            .addCase(activeGym.rejected, (state, action) => {
                state.loading = false;
                message.error(action.payload as string);
            })
            .addCase(GymownerGymList.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(GymownerGymList.fulfilled, (state, action) => {
                state.loading = false;
                state.GymownerGym = action.payload.gyms;
                state.gymOwnerpagination = action.payload.pagination;
                state.GymOwnergymCounts = action.payload.counts || {
                    pending: 0,
                    approved: 0,
                    rejected: 0,
                };
            })
            .addCase(GymownerGymList.rejected, (state, action) => {
                state.loading = false;
                message.error(action.payload as string);
            })
            .addCase(profile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(profile.fulfilled, (state, action) => {
                state.loading = false;
                state.profileData = action.payload;
            })
            .addCase(profile.rejected, (state, action) => {
                state.loading = false;
                message.error(action.payload as string);
            })
            .addCase(requestList.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(requestList.fulfilled, (state, action) => {
                state.loading = false;
                state.requests = action.payload;
            })
            .addCase(requestList.rejected, (state, action) => {
                state.loading = false;
                message.error(action.payload as string);
            })
            .addCase(AdminrequestList.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(AdminrequestList.fulfilled, (state, action) => {
                state.loading = false;
                state.AdminReqList = action.payload;
            })
            .addCase(AdminrequestList.rejected, (state, action) => {
                state.loading = false;
                message.error(action.payload as string);
            });
    },
});

export default customerSlice.reducer;
