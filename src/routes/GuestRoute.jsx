import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getHomeRoute } from "../utils/getHomeRoute";

export default function GuestRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="p-8 text-gray-500 dark:text-gray-400 font-medium">
                Loading...
            </div>
        );
    }

    if (user?.isAuthenticated) {
        return <Navigate to={getHomeRoute(user)} replace />;
    }

    return <Outlet />;
}