import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/jobs', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchJobById = createAsyncThunk(
  'jobs/fetchJobById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/jobs/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createJob = createAsyncThunk(
  'jobs/createJob',
  async (jobData, { rejectWithValue }) => {
    try {
      const response = await api.post('/jobs', jobData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateJob = createAsyncThunk(
  'jobs/updateJob',
  async ({ id, jobData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/jobs/${id}`, jobData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteJob = createAsyncThunk(
  'jobs/deleteJob',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/jobs/${id}`);
      return { id, message: response.data.message };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateJobStatus = createAsyncThunk(
  'jobs/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/jobs/${id}/status`, { status });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchRecruiterJobs = createAsyncThunk(
  'jobs/fetchRecruiterJobs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/jobs/recruiter/my-jobs');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  jobs: [],
  currentJob: null,
  recruiterJobs: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  },
  filters: {
    search: '',
    location: '',
    jobType: 'All',
    workplaceType: 'All',
    experienceLevel: 'All',
    category: 'All',
    sort: 'newest',
    page: 1
  },
  loading: false,
  error: null
};

const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload, page: action.payload.page || 1 };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearCurrentJob: (state) => {
      state.currentJob = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Jobs
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.data.jobs;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Job By Id
      .addCase(fetchJobById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJob = action.payload.data;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Job
      .addCase(createJob.fulfilled, (state, action) => {
        state.recruiterJobs.unshift(action.payload.data);
      })

      // Update Job
      .addCase(updateJob.fulfilled, (state, action) => {
        const index = state.recruiterJobs.findIndex((j) => j._id === action.payload.data._id);
        if (index !== -1) {
          state.recruiterJobs[index] = action.payload.data;
        }
      })

      // Delete Job
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.recruiterJobs = state.recruiterJobs.filter((j) => j._id !== action.payload.id);
      })

      // Fetch Recruiter Jobs
      .addCase(fetchRecruiterJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRecruiterJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.recruiterJobs = action.payload.data;
      })
      .addCase(fetchRecruiterJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setFilters, resetFilters, clearCurrentJob } = jobSlice.actions;
export default jobSlice.reducer;
