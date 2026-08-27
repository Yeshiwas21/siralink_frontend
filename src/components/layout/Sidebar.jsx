import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";

// Consolidated Lucide imports (including the 3 non-dollar financial metrics)
import {
  LayoutDashboard, Briefcase, ShieldCheck, ClipboardList, Users, UserCheck,
  UserRound, FileText, Star, BarChart3, PanelLeftClose, PanelLeftOpen,
  ReceiptText, Handshake, TrendingUp
} from "lucide-react";

function Sidebar() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);

  /* AUTO COLLAPSE ON MOBILE */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    handleResize(); // run once on mount
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!user || !user.isAuthenticated) return null;

  const isCollapsed = collapsed;

  return (
    <aside
      className={`
        ${isCollapsed ? "w-20" : "w-64"}
        min-h-screen sticky top-0
        bg-white dark:bg-[#0f172a]
        text-gray-900 dark:text-white
        flex flex-col
        border-r border-gray-200 dark:border-gray-800
        transition-all duration-300 z-30
      `}
    >
      {/* HEADER */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="px-3 py-2">
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight truncate leading-5 capitalize">
                  {t(`user_type.${user.user_type}`)} {t("account")}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex items-center justify-center p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            title={isCollapsed ? t("expand", "Expand") : t("collapse", "Collapse")}
          >
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>
      </div>

      {/* NAV */}
      <nav className="flex-1 px-3 py-4 space-y-1 text-sm overflow-y-auto">
        {/* ADMIN */}
        {user.user_type === "admin" && (
          <>
            {!isCollapsed && (
              <div className="px-3 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {t("admin_panel")}
              </div>
            )}

            <SidebarItem
              icon={<LayoutDashboard size={18} />}
              label={t("nav.overview")}
              to="/admin/overview"
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<Users size={18} />}
              label={t("nav.all_users")}
              to="/admin/users"
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<UserCheck size={18} />}
              label={t("nav.clients")}
              to="/admin/clients"
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<UserRound size={18} />}
              label={t("nav.workers")}
              to="/admin/workers"
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<Briefcase size={18} />}
              label={t("nav.jobs")}
              to="/admin/jobs"
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<FileText size={18} />}
              label={t("nav.applications")}
              to="/admin/applications"
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<ReceiptText size={18} />}
              label={t("nav.payments")}
              to="/admin/payments"
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<Star size={18} />}
              label={t("nav.reviews")}
              to="/admin/reviews"
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<BarChart3 size={18} />}
              label={t("nav.reports")}
              to="/admin/reports"
              collapsed={isCollapsed}
            />
          </>
        )}

        {/* CLIENT */}
        {user.user_type === "client" && (
          <>
            <SidebarItem
              icon={<LayoutDashboard size={18} />}
              label={t("nav.overview")}
              to="/client/overview"
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<ClipboardList size={18} />}
              label={t("nav.jobs_posted")}
              to="/client/jobs/my"
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<Handshake size={18} />}
              label={t("nav.payments")}
              to="/client/payments"
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<ShieldCheck size={18} />}
              label={t("nav.verification")}
              to="/client/verification"
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<Star size={18} />}
              label={t("nav.my_reviews")}
              to="/client/reviews"
              collapsed={isCollapsed}
            />
          </>
        )}

        {/* WORKER */}
        {user.user_type === "worker" && (
          <>
            <SidebarItem
              icon={<LayoutDashboard size={18} />}
              label={t("nav.overview")}
              to="/worker/overview"
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<Briefcase size={18} />}
              label={t("nav.proposals")}
              to="/worker/proposals"
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<Briefcase size={18} />}
              label={t("nav.works_completed")}
              to="/worker/works-completed"
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<TrendingUp size={18} />}
              label={t("nav.earnings")}
              to="/worker/earnings"
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<ShieldCheck size={18} />}
              label={t("nav.verification")}
              to="/worker/verification"
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<Star size={18} />}
              label={t("nav.my_reviews")}
              to="/worker/reviews"
              collapsed={isCollapsed}
            />
          </>
        )}
      </nav>
    </aside>
  );
}

/* SIDEBAR ITEM COMPONENT */
function SidebarItem({ icon, label, to, collapsed, danger = false }) {
  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `flex items-center ${collapsed ? "justify-center" : "gap-3"}
        px-3 py-2.5 rounded-lg font-medium transition-colors duration-150
        ${danger
          ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
          : isActive
            ? "bg-gray-100 dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 font-semibold"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white"
        }`
      }
    >
      <span className="shrink-0">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

export default Sidebar;