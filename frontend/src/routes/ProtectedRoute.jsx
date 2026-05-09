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

  return children;
};

export default ProtectedRoute;
