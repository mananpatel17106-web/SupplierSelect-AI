import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import requirementReducer from '../features/requirements/requirementSlice';
import quotationReducer from '../features/quotations/quotationSlice';
import analysisReducer from '../features/analysis/analysisSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    requirements: requirementReducer,
    quotations: quotationReducer,
    analysis: analysisReducer,
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
