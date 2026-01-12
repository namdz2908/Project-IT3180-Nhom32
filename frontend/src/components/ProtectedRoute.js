import React from "react";
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";

// ProtectedRoute: Only accessible if logged in
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token || token === "undefined" || token === "null") {
    // If NOT logged in, redirect to sign-in page
    return <Navigate to="/authentication/sign-in" replace />;
  }

  // If logged in, render the children (e.g., Dashboard component)
  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
