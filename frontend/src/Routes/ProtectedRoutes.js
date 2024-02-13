import {React, useEffect} from 'react';
import { Outlet, Navigate } from 'react-router-dom';

const ProtectedRoute = ({ component: Component, ...rest }) => {
    const storedUserData = localStorage.getItem('ssma-auth');
    const userData = storedUserData ? JSON.parse(storedUserData) : null;
    console.log(userData);
    const current_time = new Date().getTime();
    console.log(current_time);
    if(storedUserData && userData.sessionExpirationTime >= current_time){
        return <Outlet />;
    }
    
    return <Navigate to="/" />;
};

export default ProtectedRoute;