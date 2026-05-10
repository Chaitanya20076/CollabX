import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Home from "../pages/Home/Home";
import About from "../pages/About/About";
import Workflow from "../pages/Workflow/Workflow";
import Pricing from "../pages/Pricing/Pricing";
import PrivacyPolicy from "../pages/PrivacyPolicy/PrivacyPolicy";
import TermsConditions from "../pages/TermsConditions/TermsConditions";
import Login from "../pages/Login/Login";
import Signup from "../pages/Signup/Signup";
import Dashboard from "../pages/Dashboard/Dashboard";
import NotFound from "../pages/NotFound/NotFound";
import SetupLoader from "../pages/SetupLoader/SetupLoader";
import VerifyEmail from "../pages/Auth/VerifyEmail";
import AIChat from "../pages/AIChat/AIChat";
import PaymentConfirm from "../pages/PaymentConfirm/PaymentConfirm";
import RefundRequest from "../pages/Refund/RefundRequest";
import RefundConfirm from "../pages/Refund/RefundConfirm";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="workflow" element={<Workflow />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="terms-and-conditions" element={<TermsConditions />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="verify-email" element={<VerifyEmail />} />
        <Route path="payment-confirm/:token" element={<PaymentConfirm />} />
        <Route path="refund-confirm/:token" element={<RefundConfirm />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="refund/:id"
          element={
            <ProtectedRoute>
              <RefundRequest />
            </ProtectedRoute>
          }
        />
        <Route
          path="setup-loader"
          element={
            <ProtectedRoute>
              <SetupLoader />
            </ProtectedRoute>
          }
        />
        <Route
          path="ai-chat"
          element={
            <ProtectedRoute>
              <AIChat />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
