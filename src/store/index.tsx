
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import themeConfigSlice from './themeConfigSlice';
import customerSlice from './customerConfigSlice';

const rootReducer = combineReducers({
    themeConfig: themeConfigSlice,
    customerConfig: customerSlice,
});

const store = configureStore({
    reducer: rootReducer,
});

export default store;

export type IRootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
