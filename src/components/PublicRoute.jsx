import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export const PublicRoute = ({ children }) => {
    const { isAuthenticated } = useContext(AuthContext);
    if(isAuthenticated) {
        return <Navigate to="/dashboard"/>
    }
    return children;
};