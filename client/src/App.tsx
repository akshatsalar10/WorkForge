import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { AcceptInvitationPage } from './pages/auth/AcceptInvitationPage';
import { OrganizationDashboardPage } from './pages/organization/OrganizationDashboardPage';
import { OrganizationSettingsPage } from './pages/organization/OrganizationSettingsPage';
import { MembersPage } from './pages/organization/MembersPage';
import { InvitationsPage } from './pages/organization/InvitationsPage';
import { TeamsPage } from './pages/team/TeamsPage';
import { TeamDetailsPage } from './pages/team/TeamDetailsPage';
import { ProjectsPage } from './pages/project/ProjectsPage';
import { ProjectDetailsPage } from './pages/project/ProjectDetailsPage';
import { TasksPage } from './pages/task/TasksPage';
import { KanbanBoardPage } from './pages/kanban/KanbanBoardPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { HealthPage } from './pages/HealthPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
        </Route>

        {/* Public Health Page */}
        <Route path="/health" element={<HealthPage />} />

        {/* Protected Application Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<OrganizationDashboardPage />} />
            <Route path="/org-settings" element={<OrganizationSettingsPage />} />
            <Route path="/members" element={<MembersPage />} />
            <Route path="/invitations" element={<InvitationsPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/teams/:teamId" element={<TeamDetailsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
            <Route path="/projects/:projectId/board" element={<KanbanBoardPage />} />
            <Route path="/board" element={<KanbanBoardPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
