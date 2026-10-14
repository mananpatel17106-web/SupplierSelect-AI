import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  lastRefreshed: null,
  activeFilter: 'all',
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setLastRefreshed: (state) => {
      state.lastRefreshed = new Date().toISOString();
    },
    setActiveFilter: (state, action) => {
      state.activeFilter = action.payload;
    },
  },
});

export const { setLastRefreshed, setActiveFilter } = dashboardSlice.actions;
export default dashboardSlice.reducer;
