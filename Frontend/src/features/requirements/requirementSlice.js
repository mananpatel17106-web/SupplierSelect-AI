import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import requirementService from './requirementService';

export const fetchRequirements = createAsyncThunk(
  'requirements/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await requirementService.getAll();
      return response.data || [];
    } catch (err) {
      return rejectWithValue(err.formattedMessage || 'Failed to fetch requirements');
    }
  }
);

export const fetchRequirementById = createAsyncThunk(
  'requirements/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await requirementService.getById(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.formattedMessage || 'Requirement not found');
    }
  }
);

export const createRequirementThunk = createAsyncThunk(
  'requirements/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await requirementService.create(data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.formattedMessage || 'Failed to create requirement');
    }
  }
);

export const updateRequirementThunk = createAsyncThunk(
  'requirements/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await requirementService.update(id, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.formattedMessage || 'Failed to update requirement');
    }
  }
);

export const deleteRequirementThunk = createAsyncThunk(
  'requirements/delete',
  async (id, { rejectWithValue }) => {
    try {
      await requirementService.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.formattedMessage || 'Failed to delete requirement');
    }
  }
);

const initialState = {
  requirements: [],
  currentRequirement: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
};

const requirementSlice = createSlice({
  name: 'requirements',
  initialState,
  reducers: {
    clearRequirementError: (state) => {
      state.error = null;
    },
    clearCurrentRequirement: (state) => {
      state.currentRequirement = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchRequirements.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRequirements.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requirements = action.payload;
      })
      .addCase(fetchRequirements.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch By ID
      .addCase(fetchRequirementById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRequirementById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRequirement = action.payload;
      })
      .addCase(fetchRequirementById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createRequirementThunk.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createRequirementThunk.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.requirements.unshift(action.payload);
        state.currentRequirement = action.payload;
      })
      .addCase(createRequirementThunk.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateRequirementThunk.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateRequirementThunk.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.currentRequirement = action.payload;
        state.requirements = state.requirements.map((req) =>
          req.id === action.payload.id ? action.payload : req
        );
      })
      .addCase(updateRequirementThunk.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteRequirementThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteRequirementThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requirements = state.requirements.filter((req) => req.id !== action.payload);
        if (state.currentRequirement?.id === action.payload) {
          state.currentRequirement = null;
        }
      })
      .addCase(deleteRequirementThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRequirementError, clearCurrentRequirement } = requirementSlice.actions;
export default requirementSlice.reducer;
