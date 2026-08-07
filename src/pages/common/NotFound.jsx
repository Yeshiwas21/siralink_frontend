import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { getHomeRoute } from "../../utils/getHomeRoute";

function NotFound() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const homeRoute = getHomeRoute(user);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-5xl font-extrabold text-gray-800 dark:text-white">404</h1>

      <p className="text-gray-600 dark:text-gray-100 mt-2 text-lg">
        {t("not_found.description")}
      </p>

      <Link
        to={homeRoute}
        className="mt-6 inline-block bg-amber-300 text-black font-semibold px-5 py-2 rounded-lg hover:bg-amber-400 transition"
      >
        {user?.isAuthenticated ? t("not_found.go_to_overview") : t("not_found.go_to_home")}
      </Link>
    </div>
  );
}

export default NotFound;