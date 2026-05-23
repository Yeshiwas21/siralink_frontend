import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("jobs");
  const [openCategory, setOpenCategory] = useState(false);

  const location = useLocation();
  const dropdownRef = useRef(null);

  const { theme, toggleTheme } = useTheme();

  const { user } = useAuth();
  const isAuth = user?.isAuthenticated;

  const navLinkClass = ({ isActive }) =>
    `relative flex items-center h-16 text-sm transition-colors duration-200
    ${
      isActive
        ? "text-black dark:text-white font-medium after:absolute after:left-0 after:right-0 after:bottom-[10px] after:h-[2px] after:bg-black dark:after:bg-white"
        : "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
    }`;

  const mobileLinkClass =
    "relative inline-flex items-center gap-2 w-fit px-2 py-1.5 text-gray-800 dark:text-gray-200 after:absolute after:left-2 after:bottom-0 after:h-[2px] after:w-0 after:bg-current after:transition-all after:duration-200 hover:after:w-[calc(100%-1rem)]";

  const getDisplayName = () => {
    if (!user) return "U";

    if (user.is_staff) {
      const first = user.first_name?.trim();
      const last = user.last_name?.trim();

      const fullName = [first, last].filter(Boolean).join(" ");

      return fullName || "Admin";
    }

    if (user.user_type === "client") {
      return user.client?.company_name || "Client";
    }

    if (user.user_type === "worker") {
      const first = user.worker?.first_name?.trim();
      const last = user.worker?.last_name?.trim();

      const fullName = [first, last].filter(Boolean).join(" ");

      return fullName || "Worker";
    }

    return "User";
  };

  const getProfileImage = () => {
    if (!user) return null;

    return (
      user.profile_image ||
      user.user_image ||
      user.worker?.profile_image ||
      user.client?.company_logo ||
      null
    );
  };

  const profileImage = getProfileImage();
  const displayName = getDisplayName();

  const closeMobile = () => {
    setOpen(false);
    setMobileProfileOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenCategory(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // For profile dropdowns
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDropdown(false);
      setMobileProfileOpen(false);
    }, 0);

    return () => clearTimeout(timeout);
  }, [location.pathname]);

  return (
    <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
      {" "}
      {/* TOP BAR */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
        {/* LEFT */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            className="md:hidden text-gray-800 dark:text-gray-200"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>

          <Link
            to="/"
            className="text-xl font-bold text-blue-600 dark:text-blue-400"
          >
            EthioWorks
          </Link>
        </div>

        {/* THEME IN MOBILE VIEW*/}
        <div className="flex items-center gap-3 md:hidden ml-auto">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-9 h-9 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>

        {/* SEARCH */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="flex items-center w-80 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full px-3 shadow-sm hover:shadow-md transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-300">
            <Search
              size={16}
              className="text-gray-500 dark:text-gray-400 mr-2"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="flex-1 py-2 text-sm bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />

            <div
              className="relative border-l border-gray-200 dark:border-gray-700"
              ref={dropdownRef}
            >
              <button
                type="button"
                onClick={() => setOpenCategory((prev) => !prev)}
                className="px-3 py-2 text-sm flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition whitespace-nowrap"
              >
                {category === "jobs" ? "Jobs" : "Workers"}

                <span
                  className={`text-[10px] transition-transform duration-200 ${openCategory ? "rotate-180" : ""}`}
                >
                  <ChevronDown
                    size={14}
                    className="text-gray-500 dark:text-gray-300"
                  />
                </span>
              </button>

              {openCategory && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in">
                  <button
                    onClick={() => {
                      setCategory("jobs");
                      setOpenCategory(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
                  >
                    Jobs
                  </button>

                  <button
                    onClick={() => {
                      setCategory("workers");
                      setOpenCategory(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
                  >
                    Workers
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-6 ml-auto">
          {/* NAV */}
          <nav className="hidden md:flex items-center gap-5">
            {!isAuth && (
              <>
                <NavLink to="/jobs" className={navLinkClass}>
                  Find Work
                </NavLink>

                <NavLink to="/workers" className={navLinkClass}>
                  Hire Workers
                </NavLink>
              </>
            )}

            {isAuth && (
              <>
                {user?.user_type === "worker" ? (
                  <>
                    <NavLink to="/jobs" className={navLinkClass}>
                      Find Work
                    </NavLink>

                    <NavLink to="/worker/jobs/applied" className={navLinkClass}>
                      Deliver Work
                    </NavLink>
                  </>
                ) : user?.user_type === "client" ? (
                  <>
                    <NavLink to="/workers" className={navLinkClass}>
                      Find Workers
                    </NavLink>

                    <NavLink className={navLinkClass} to="/client/jobs/post">
                      Post Job
                    </NavLink>
                  </>
                ) : null}

                {/* COMMON */}
                <NavLink to="/ca/messages" className={navLinkClass}>
                  Messages
                </NavLink>

                <NavLink to="/ca/notifications" className={navLinkClass}>
                  <Bell size={20} />
                </NavLink>

                <NavLink to="/ca/help" className={navLinkClass}>
                  <HelpCircle size={20} />
                </NavLink>
              </>
            )}

            {!isAuth && (
              <NavLink to="/how-it-works" className={navLinkClass}>
                How it Works
              </NavLink>
            )}

            {/* THEME */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-9 h-9 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </nav>

          {/* PROFILE */}
          <div className="hidden md:flex items-center">
            {!isAuth ? (
              <div className="flex items-center gap-4">
                <NavLink to="/login" className={navLinkClass}>
                  Login
                </NavLink>

                <Link
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                  to="/signup"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropdown(!dropdown)}
                  className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 rounded-full transition"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center border">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {displayName?.charAt(0)}
                      </span>
                    )}
                  </div>
                </button>

                {dropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50">
                    <div className="px-4 py-3 border-b bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {displayName}
                      </p>

                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.email}
                      </p>
                    </div>

                    <div className="flex flex-col text-sm">
                      <Link
                        to="/account/profile"
                        className="px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Profile
                      </Link>

                      <Link
                        to="/account/settings"
                        className="px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Settings
                      </Link>

                      <Link
                        to="/logout"
                        className="px-4 py-2  text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Logout
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* MOBILE */}
      {open && (
        <div className="md:hidden border-t bg-white dark:bg-gray-950 dark:border-gray-800 px-4 py-3 space-y-3 text-sm transition-colors duration-300">
          {/* SEARCH */}
          <div className="flex items-center border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg px-2">
            <Search size={16} className="text-gray-500 dark:text-gray-400" />

            <input
              placeholder="Search"
              className="flex-1 px-2 py-2 outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            {/* PROFILE */}
            {isAuth && (
              <>
                <button
                  onClick={() => setMobileProfileOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                          {displayName?.charAt(0)}
                        </span>
                      )}
                    </div>

                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {displayName}
                      </p>

                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs transition-transform ${
                      mobileProfileOpen ? "rotate-180" : ""
                    }`}
                  >
                    <ChevronDown
                      size={14}
                      className="text-gray-600 dark:text-gray-300 transition-transform duration-200"
                    />
                  </span>
                </button>

                {mobileProfileOpen && (
                  <div className="flex flex-col ml-11 border-l border-gray-200 dark:border-gray-800 pl-3 space-y-1">
                    <Link
                      to="/account/profile"
                      onClick={closeMobile}
                      className={mobileLinkClass}
                    >
                      Profile
                    </Link>

                    <Link
                      to="/account/settings"
                      onClick={closeMobile}
                      className={mobileLinkClass}
                    >
                      Settings
                    </Link>

                    <Link
                      to="/logout"
                      onClick={closeMobile}
                      className={mobileLinkClass}
                    >
                      Logout
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* GUEST */}
            {!isAuth && (
              <>
                <Link
                  onClick={closeMobile}
                  to="/jobs"
                  className={mobileLinkClass}
                >
                  Find Work
                </Link>

                <Link
                  onClick={closeMobile}
                  to="/workers"
                  className={mobileLinkClass}
                >
                  Hire Workers
                </Link>

                <Link
                  onClick={closeMobile}
                  to="/login"
                  className={mobileLinkClass}
                >
                  Login
                </Link>

                <Link
                  onClick={closeMobile}
                  to="/signup"
                  className={
                    mobileLinkClass +
                    "text-blue-600 dark:text-blue-400 font-medium"
                  }
                >
                  Get Started
                </Link>
              </>
            )}

            {/* AUTH */}
            {isAuth && (
              <>
                {user?.user_type === "worker" ? (
                  <>
                    <Link
                      onClick={closeMobile}
                      to="/jobs"
                      className={mobileLinkClass}
                    >
                      Find Work
                    </Link>

                    <Link
                      onClick={closeMobile}
                      to="/worker/jobs/applied"
                      className={mobileLinkClass}
                    >
                      Deliver Work
                    </Link>
                  </>
                ) : user?.user_type === "client" ? (
                  <>
                    <Link
                      onClick={closeMobile}
                      to="/workers"
                      className={mobileLinkClass}
                    >
                      Find Workers
                    </Link>

                    <Link
                      onClick={closeMobile}
                      to="/client/jobs/post"
                      className={mobileLinkClass}
                    >
                      Post Job
                    </Link>
                  </>
                ) : null}

                <Link
                  onClick={closeMobile}
                  to="/ca/messages"
                  className={mobileLinkClass}
                >
                  Messages
                </Link>

                <Link
                  onClick={closeMobile}
                  to="/ca/notifications"
                  className={mobileLinkClass}
                >
                  <Bell size={14} />
                  <span>Notifications</span>
                </Link>

                <Link
                  onClick={closeMobile}
                  to="/ca/help"
                  className={mobileLinkClass}
                >
                  <HelpCircle size={14} />
                  <span>Help</span>
                </Link>
              </>
            )}

            {/* HOW IT WORKS */}
            {!isAuth && (
              <Link
                onClick={closeMobile}
                to="/how-it-works"
                className={mobileLinkClass}
              >
                How it Works
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
