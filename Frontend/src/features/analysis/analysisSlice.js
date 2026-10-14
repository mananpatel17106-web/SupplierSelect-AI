import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import analysisService from './analysisService';

export const runAnalysisThunk = createAsyncThunk(
  'analysis/run',
  async (requirementId, { rejectWithValue }) => {
    try {
      const response = await analysisService.runAnalysis(requirementId);
      return response.data; // { suppliers, recommendation }
    } catch (err) {
      return rejectWithValue(err.formattedMessage || 'Failed to run analysis');
    }
  }
);

export const fetchAnalysisByRequirement = createAsyncThunk(
  'analysis/fetchByRequirement',
  async (requirementId, { rejectWithValue }) => {
    try {
      const response = await analysisService.getByRequirement(requirementId);
      return response.data || [];
    } catch (err) {
      return rejectWithValue(err.formattedMessage || 'Failed to fetch analysis records');
    }
  }
);

export const fetchAnalysisByQuotation = createAsyncThunk(
  'analysis/fetchByQuotation',
  async (quotationId, { rejectWithValue }) => {
    try {
      const response = await analysisService.getByQuotation(quotationId);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.formattedMessage || 'Analysis not found for this quotation');
    }
  }
);

const initialState = {
  currentAnalysis: null, // { suppliers, recommendation }
  savedAnalyses: [], // records from GET /analysis/requirement/:id
  singleQuotationAnalysis: null,
  isRunning: false,
  isLoading: false,
  error: null,
};

const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    clearAnalysisError: (state) => {
      state.error = null;
    },
    clearCurrentAnalysis: (state) => {
      state.currentAnalysis = null;
      state.savedAnalyses = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Run analysis
      .addCase(runAnalysisThunk.pending, (state) => {
        state.isRunning = true;
        state.error = null;
      })
      .addCase(runAnalysisThunk.fulfilled, (state, action) => {
        state.isRunning = false;
        state.currentAnalysis = action.payload;
      })
      .addCase(runAnalysisThunk.rejected, (state, action) => {
        state.isRunning = false;
        state.error = action.payload;
      })

      // Fetch by requirement
      .addCase(fetchAnalysisByRequirement.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnalysisByRequirement.fulfilled, (state, action) => {
        state.isLoading = false;
        state.savedAnalyses = action.payload;
      })
      .addCase(fetchAnalysisByRequirement.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch by quotation
      .addCase(fetchAnalysisByQuotation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnalysisByQuotation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.singleQuotationAnalysis = action.payload;
      })
      .addCase(fetchAnalysisByQuotation.rejected, (state, action) => {
        state.isLoading = false;
        state.singleQuotationAnalysis = null;
      });
  },
});

export const { clearAnalysisError, clearCurrentAnalysis } = analysisSlice.actions;
export default analysisSlice.reducer;
