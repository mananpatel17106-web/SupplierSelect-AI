import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Main App Pages
import Dashboard from '../pages/dashboard/Dashboard';
import Requirements from '../pages/requirements/Requirements';
import CreateRequirement from '../pages/requirements/CreateRequirement';
import RequirementDetails from '../pages/requirements/RequirementDetails';
import EditRequirement from '../pages/requirements/EditRequirement';
import Quotations from '../pages/quotations/Quotations';
import UploadQuotation from '../pages/quotations/UploadQuotation';
import QuotationDetails from '../pages/quotations/QuotationDetails';
import AnalysisResults from '../pages/analysis/AnalysisResults';
import AnalysisHistory from '../pages/analysis/AnalysisHistory';
import Reports from '../pages/reports/Reports';
import Settings from '../pages/settings/Settings';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Application Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Purchase Requirements */}
        <Route path="requirements" element={<Requirements />} />
        <Route path="requirements/new" element={<CreateRequirement />} />
        <Route path="requirements/:id" element={<RequirementDetails />} />
        <Route path="requirements/:id/edit" element={<EditRequirement />} />

        {/* Supplier Quotations */}
        <Route path="quotations" element={<Quotations />} />
        <Route path="quotations/upload" element={<UploadQuotation />} />
        <Route path="quotations/:id" element={<QuotationDetails />} />

        {/* AI Analysis & Decision Support */}
        <Route path="analysis" element={<AnalysisResults />} />
        <Route path="analysis/:requirementId" element={<AnalysisResults />} />
        <Route path="analysis/history" element={<AnalysisHistory />} />

        {/* Reports & Analytics */}
        <Route path="reports" element={<Reports />} />

        {/* Settings */}
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
