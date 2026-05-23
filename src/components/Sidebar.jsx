import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  CreditCard,
  ShieldCheck,
  ClipboardList,
  TrendingUp,
  MessageCircle,
  Users,
  UserCheck,
  UserCog,
  UserRound,
  FileText,
  Star,
  BarChart3,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

function Sidebar() {
  const { user } = useAuth();

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
                transition-all duration-300
              `}
    >
      {/* HEADER */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="px-3 py-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight truncate leading-5 capitalize">
                {user.name}
              </p>

              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>

                <p className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight truncate leading-5 capitalize">
                  {user.user_type} account
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>
        </div>
      </div>

      {/* NAV */}
      <nav className="flex-1 px-2 py-4 space-y-1 text-sm overflow-y-auto">
        {/* ADMIN */}
        {user.user_type === "admin" && (
          <>
            {!isCollapsed && (
              <div className="px-3 text-xs text-gray-400 uppercase">
                Admin Panel
              </div>
            )}

            <SidebarItem
              icon={<LayoutDashboard size={18} />}
              label="Overview"
              to="/admin/overview"
              collapsed={isCollapsed}
            />

            {/* FLATTENED USERS */}
            <SidebarItem
              icon={<Users size={18} />}
              label="All Users"
              to="/admin/users"
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<UserCheck size={18} />}
              label="Clients"
              to="/admin/clients"
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<UserRound size={18} />}
              label="Workers"
              to="/admin/workers"
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<Briefcase size={18} />}
              label="Jobs"
              to="/admin/jobs"
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<FileText size={18} />}
              label="Applications"
              to="/admin/applications"
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<CreditCard size={18} />}
              label="Payments"
              to="/admin/payments"
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<Star size={18} />}
              label="Reviews"
              to="/admin/reviews"
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<BarChart3 size={18} />}
              label="Reports"
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
              label="Overview"
              to="/client/overview"
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<ClipboardList size={18} />}
              label="Job Posted"
              to="/client/jobs/my"
              collapsed={isCollapsed}
            />

            <SidebarItem
              icon={<CreditCard size={18} />}
              label="Payments"
              to="/client/payments"
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<ShieldCheck size={18} />}
              label="Verification"
              to="/client/verification"
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<Star size={18} />}
              label="My Reviews"
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
              label="Overview"
              to="/worker/overview"
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<Briefcase size={18} />}
              label="Work Completed"
              to="/worker/wokrs-completed"
              collapsed={isCollapsed}
            />

            <SidebarItem
              icon={<TrendingUp size={18} />}
              label="Earnings"
              to="/worker/earnings"
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<ShieldCheck size={18} />}
              label="Verification"
              to="/worker/verification"
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<Star size={18} />}
              label="My Reviews"
              to="/worker/reviews"
              collapsed={isCollapsed}
            />
          </>
        )}
      </nav>
    </aside>
  );
}

/* ITEM */
function SidebarItem({ icon, label, to, collapsed, danger = false }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center ${collapsed ? "justify-center" : "gap-3"}
        px-3 py-2 rounded-lg transition
        ${
          danger
            ? "text-red-500 hover:bg-red-100 dark:hover:bg-red-500/10"
            : isActive
              ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        }`
      }
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}

export default Sidebar;
