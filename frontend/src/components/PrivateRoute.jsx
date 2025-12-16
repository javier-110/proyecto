import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    // Check if user is authenticated (e.g., check token in localStorage)
    const isAuthenticated = true; // Replace with actual check

    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
