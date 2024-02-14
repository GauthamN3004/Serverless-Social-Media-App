import {React, useEffect} from 'react';
import { Outlet, Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element: Element, ...rest }) => {
    const storedUserData = localStorage.getItem('ssma-auth');
    const userData = storedUserData ? JSON.parse(storedUserData) : null;
    const current_time = new Date().getTime();
    if(storedUserData && userData.sessionExpirationTime >= current_time){
        return <Outlet {...rest} userData={userData} currentTime={current_time}/>;
    }
    
    return <Navigate to="/" />;
};

export default ProtectedRoute;