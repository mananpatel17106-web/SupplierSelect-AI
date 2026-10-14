import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import quotationService from './quotationService';

export const uploadQuotationThunk = createAsyncThunk(
  'quotations/upload',
  async ({ formData, onProgress }, { rejectWithValue }) => {
    try {
      const response = await quotationService.upload(formData, onProgress);
      return response.data; // { quotation, processing }
    } catch (err) {
      return rejectWithValue(err.formattedMessage || 'Failed to upload quotation');
    }
  }
);

export const fetchQuotationsByRequirement = createAsyncThunk(
  'quotations/fetchByRequirement',
  async (requirementId, { rejectWithValue }) => {
    try {
      const response = await quotationService.getByRequirement(requirementId);
      return response.data || [];
    } catch (err) {
      return rejectWithValue(err.formattedMessage || 'Failed to fetch quotations');
    }
  }
);

export const fetchQuotationById = createAsyncThunk(
  'quotations/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await quotationService.getById(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.formattedMessage || 'Quotation not found');
    }
  }
);

export const deleteQuotationThunk = createAsyncThunk(
  'quotations/delete',
  async (id, { rejectWithValue }) => {
    try {
      await quotationService.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.formattedMessage || 'Failed to delete quotation');
    }
  }
);

const initialState = {
  quotations: [],
  currentQuotation: null,
  latestUploadResult: null,
  uploadProgress: 0,
  isLoading: false,
  isUploading: false,
  error: null,
};

const quotationSlice = createSlice({
  name: 'quotations',
  initialState,
  reducers: {
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    clearQuotationError: (state) => {
      state.error = null;
    },
    clearLatestUploadResult: (state) => {
      state.latestUploadResult = null;
      state.uploadProgress = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload
      .addCase(uploadQuotationThunk.pending, (state) => {
        state.isUploading = true;
        state.uploadProgress = 0;
        state.error = null;
      })
      .addCase(uploadQuotationThunk.fulfilled, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 100;
        state.latestUploadResult = action.payload;
        if (action.payload?.quotation) {
          state.quotations.unshift(action.payload.quotation);
        }
      })
      .addCase(uploadQuotationThunk.rejected, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 0;
        state.error = action.payload;
      })

      // Fetch by requirement
      .addCase(fetchQuotationsByRequirement.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuotationsByRequirement.fulfilled, (state, action) => {
        state.isLoading = false;
        state.quotations = action.payload;
      })
      .addCase(fetchQuotationsByRequirement.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch by ID
      .addCase(fetchQuotationById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuotationById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentQuotation = action.payload;
      })
      .addCase(fetchQuotationById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteQuotationThunk.fulfilled, (state, action) => {
        state.quotations = state.quotations.filter((q) => q.id !== action.payload);
        if (state.currentQuotation?.id === action.payload) {
          state.currentQuotation = null;
        }
      });
  },
});

export const { setUploadProgress, clearQuotationError, clearLatestUploadResult } = quotationSlice.actions;
export default quotationSlice.reducer;
