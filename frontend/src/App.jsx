import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { fetchCurrentUser } from './redux/slices/authSlice';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRoute from './components/common/RoleRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Profile from './pages/Profile';

// Job Seeker Pages
import JobSeekerDashboard from './pages/JobSeekerDashboard';
import Applications from './pages/Applications';
import SavedJobs from './pages/SavedJobs';
import AiResumeAnalyzer from './pages/AiResumeAnalyzer';
import InterviewPrep from './pages/InterviewPrep';

// Recruiter Pages
import RecruiterDashboard from './pages/RecruiterDashboard';
import ManageJobs from './pages/ManageJobs';
import CreateJob from './pages/CreateJob';
import EditJob from './pages/EditJob';
import ManageApplications from './pages/ManageApplications';
import CandidateList from './pages/CandidateList';

function App() {
  const dispatch = useDispatch();
  const { token, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-zinc-900 dark:bg-[#09090b] dark:text-zinc-100 selection:bg-zinc-800 selection:text-white transition-colors duration-200">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route
            path="/jobs"
            element={
              isAuthenticated && user?.role === 'recruiter' ? (
                <Navigate to="/recruiter/jobs" replace />
              ) : (
                <Jobs />
              )
            }
          />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyOTP />} />

          {/* Protected Profile (Both Roles) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Job Seeker Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <RoleRoute role="jobseeker">
                <JobSeekerDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <RoleRoute role="jobseeker">
                <Applications />
              </RoleRoute>
            }
          />
          <Route
            path="/saved-jobs"
            element={
              <RoleRoute role="jobseeker">
                <SavedJobs />
              </RoleRoute>
            }
          />
          <Route
            path="/ai-resume-analyzer"
            element={
              <RoleRoute role="jobseeker">
                <AiResumeAnalyzer />
              </RoleRoute>
            }
          />
          <Route
            path="/interview-preparation"
            element={
              <RoleRoute role="jobseeker">
                <InterviewPrep />
              </RoleRoute>
            }
          />

          {/* Recruiter Protected Routes */}
          <Route
            path="/recruiter/dashboard"
            element={
              <RoleRoute role="recruiter">
                <RecruiterDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/recruiter/jobs"
            element={
              <RoleRoute role="recruiter">
                <ManageJobs />
              </RoleRoute>
            }
          />
          <Route
            path="/recruiter/jobs/create"
            element={
              <RoleRoute role="recruiter">
                <CreateJob />
              </RoleRoute>
            }
          />
          <Route
            path="/recruiter/jobs/:id/edit"
            element={
              <RoleRoute role="recruiter">
                <EditJob />
              </RoleRoute>
            }
          />
          <Route
            path="/recruiter/jobs/:id/applications"
            element={
              <RoleRoute role="recruiter">
                <ManageApplications />
              </RoleRoute>
            }
          />
          <Route
            path="/recruiter/candidates"
            element={
              <RoleRoute role="recruiter">
                <CandidateList />
              </RoleRoute>
            }
          />
          <Route
            path="/recruiter/profile"
            element={
              <RoleRoute role="recruiter">
                <Profile />
              </RoleRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {/* Global Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#18181b',
            color: '#f4f4f5',
            fontSize: '12px',
            border: '1px solid #27272a',
            borderRadius: '10px'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#18181b'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#18181b'
            }
          }
        }}
      />
    </div>
  );
}

export default App;
