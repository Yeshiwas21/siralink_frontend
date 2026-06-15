import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getHomeRoute } from "../../utils/getHomeRoute";

function NotFound() {
  const { user } = useAuth();

  const homeRoute = getHomeRoute(user);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-5xl font-extrabold text-gray-800">404</h1>

      <p className="text-gray-600 dark:text-gray-100 mt-2 text-lg">
        Oops! The page you’re looking for doesn’t exist.
      </p>

      <Link
        to={homeRoute}
        className="mt-6 inline-block bg-amber-300 text-black font-semibold px-5 py-2 rounded-lg hover:bg-amber-400 transition"
      >
        {user?.isAuthenticated ? "Go to Overview" : "Go to Home"}
      </Link>
    </div>
  );
}

export default NotFound;
