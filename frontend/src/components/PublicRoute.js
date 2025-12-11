import React from "react";
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";

// PublicRoute: Only accessible if NOT logged in
export default function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  if (token) {
    // If logged in, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }
  // If not logged in, render the children (e.g., SignIn component)
  return children;
}

PublicRoute.propTypes = {
  children: PropTypes.node,
};
