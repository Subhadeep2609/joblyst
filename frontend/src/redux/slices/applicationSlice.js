import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const applyJob = createAsyncThunk(
  'applications/apply',
  async ({ jobId, formData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/applications/${jobId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchMyApplications = createAsyncThunk(
  'applications/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/applications/my');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchJobApplications = createAsyncThunk(
  'applications/fetchForJob',
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/applications/job/${jobId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateApplicationStatus = createAsyncThunk(
  'applications/updateStatus',
  async ({ id, status, note }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/applications/${id}/status`, { status, note });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const saveJobToBookmarks = createAsyncThunk(
  'applications/saveJob',
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/applications/saved-jobs/${jobId}`);
      return { jobId, message: response.data.message };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const unsaveJobFromBookmarks = createAsyncThunk(
  'applications/unsaveJob',
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/applications/saved-jobs/${jobId}`);
      return { jobId, message: response.data.message };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchSavedJobs = createAsyncThunk(
  'applications/fetchSaved',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/applications/saved-jobs');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  myApplications: [],
  jobApplicationsData: {
    job: null,
    applications: []
  },
  savedJobs: [],
  loading: false,
  submitting: false,
  error: null
};

const applicationSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    clearApplicationError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Apply
      .addCase(applyJob.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(applyJob.fulfilled, (state, action) => {
        state.submitting = false;
        state.myApplications.unshift(action.payload.data);
      })
      .addCase(applyJob.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // Fetch My Applications
      .addCase(fetchMyApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.myApplications = action.payload.data;
      })
      .addCase(fetchMyApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Job Applications (Recruiter)
      .addCase(fetchJobApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.jobApplicationsData = action.payload.data;
      })
      .addCase(fetchJobApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Status
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        const updated = action.payload.data;
        const index = state.jobApplicationsData.applications.findIndex((a) => a._id === updated._id);
        if (index !== -1) {
          state.jobApplicationsData.applications[index] = updated;
        }
      })

      // Fetch Saved
      .addCase(fetchSavedJobs.fulfilled, (state, action) => {
        state.savedJobs = action.payload.data;
      })

      // Save Job
      .addCase(saveJobToBookmarks.fulfilled, (state, action) => {
        // Optimistic / sync
      })

      // Unsave Job
      .addCase(unsaveJobFromBookmarks.fulfilled, (state, action) => {
        state.savedJobs = state.savedJobs.filter((j) => j._id !== action.payload.jobId);
      });
  }
});

export const { clearApplicationError } = applicationSlice.actions;
export default applicationSlice.reducer;
