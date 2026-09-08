import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const analyzeResumeAction = createAsyncThunk(
  'ai/analyzeResume',
  async (resumeText, { rejectWithValue }) => {
    try {
      const response = await api.post('/ai/analyze-resume', { resumeText });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const extractResumeTextAction = createAsyncThunk(
  'ai/extractResumeText',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const response = await api.post('/ai/extract-resume-text', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchProfileResumeTextAction = createAsyncThunk(
  'ai/fetchProfileResumeText',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/ai/profile-resume-text');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const matchJobAction = createAsyncThunk(
  'ai/matchJob',
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/ai/job-match/${jobId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const generateJobDescriptionAction = createAsyncThunk(
  'ai/generateJobDescription',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.post('/ai/generate-job-description', params);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchJobRecommendations = createAsyncThunk(
  'ai/fetchRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/ai/recommendations');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const generateInterviewPrepAction = createAsyncThunk(
  'ai/generateInterviewPrep',
  async (payload, { rejectWithValue }) => {
    try {
      const jobId = typeof payload === 'string' ? payload : payload.jobId;
      const body = typeof payload === 'object' ? payload : {};
      const response = await api.post(`/ai/interview-prep/${jobId}`, body);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchMoreInterviewQuestionsAction = createAsyncThunk(
  'ai/fetchMoreInterviewQuestions',
  async ({ jobId, excludeQuestions = [], page = 2 }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/ai/interview-prep/${jobId}`, {
        excludeQuestions,
        page
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  resumeAnalysis: null,
  jobMatch: null,
  jobDescription: null,
  recommendations: [],
  interviewPrep: null,
  loading: false,
  loadingMore: false,
  error: null
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearAiError: (state) => {
      state.error = null;
    },
    clearJobMatch: (state) => {
      state.jobMatch = null;
    },
    clearInterviewPrep: (state) => {
      state.interviewPrep = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Resume Analyzer
      .addCase(analyzeResumeAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(analyzeResumeAction.fulfilled, (state, action) => {
        state.loading = false;
        state.resumeAnalysis = action.payload.data;
      })
      .addCase(analyzeResumeAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Job Match
      .addCase(matchJobAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(matchJobAction.fulfilled, (state, action) => {
        state.loading = false;
        state.jobMatch = action.payload.data;
      })
      .addCase(matchJobAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Generate Job Description
      .addCase(generateJobDescriptionAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateJobDescriptionAction.fulfilled, (state, action) => {
        state.loading = false;
        state.jobDescription = action.payload.data;
      })
      .addCase(generateJobDescriptionAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Recommendations
      .addCase(fetchJobRecommendations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendations = action.payload.data;
      })
      .addCase(fetchJobRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Interview Prep
      .addCase(generateInterviewPrepAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateInterviewPrepAction.fulfilled, (state, action) => {
        state.loading = false;
        state.interviewPrep = action.payload.data;
      })
      .addCase(generateInterviewPrepAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch More Interview Questions (Preserves Previous Questions)
      .addCase(fetchMoreInterviewQuestionsAction.pending, (state) => {
        state.loadingMore = true;
        state.error = null;
      })
      .addCase(fetchMoreInterviewQuestionsAction.fulfilled, (state, action) => {
        state.loadingMore = false;
        if (state.interviewPrep && action.payload?.data) {
          const incomingTech = action.payload.data.technicalQuestions || [];
          const incomingBeh = action.payload.data.behavioralQuestions || [];

          // Avoid duplicates if any
          const currentTech = state.interviewPrep.technicalQuestions || [];
          const currentBeh = state.interviewPrep.behavioralQuestions || [];

          const existingTechTexts = new Set(currentTech.map((q) => q.question));
          const existingBehTexts = new Set(currentBeh.map((q) => q.question));

          const uniqueNewTech = incomingTech.filter((q) => !existingTechTexts.has(q.question));
          const uniqueNewBeh = incomingBeh.filter((q) => !existingBehTexts.has(q.question));

          state.interviewPrep.technicalQuestions = [...currentTech, ...uniqueNewTech];
          state.interviewPrep.behavioralQuestions = [...currentBeh, ...uniqueNewBeh];
        }
      })
      .addCase(fetchMoreInterviewQuestionsAction.rejected, (state, action) => {
        state.loadingMore = false;
        state.error = action.payload;
      });
  }
});

export const { clearAiError, clearJobMatch, clearInterviewPrep } = aiSlice.actions;
export default aiSlice.reducer;
