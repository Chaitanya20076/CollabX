import { useContext } from "react";

import {
  Navigate,
  useLocation,
} from "react-router-dom";

import Loader from "../components/Common/Loader";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } =
    useContext(AuthContext);
  const location = useLocation();

  if (loading) return <Loader />;

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Allow Google auth users (who are implicitly verified) but force password users to verify.
  // user.providerData is an array. Password users have providerId === "password".
  const isPasswordUser = user.providerData?.some(p => p.providerId === "password");
  
  if (!user.emailVerified && isPasswordUser) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

export default ProtectedRoute;
