import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  Sun,
  Moon,
  Globe,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import ThemedLogo from "../common/ThemedLogo";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "am", name: "አማርኛ" },
  { code: "om", name: "Afaan Oromo" },
  { code: "tg", name: "ትግርኛ" },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("jobs");
  const [openCategory, setOpenCategory] = useState(false);

  // Separate states for Desktop and Mobile language dropdowns
  const [desktopLangOpen, setDesktopLangOpen] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);

  // References for Outside Click Detection
  const searchCategoryRef = useRef(null);
  const desktopLangRef = useRef(null);
  const mobileLangRef = useRef(null);
  const profileDropdownRef = useRef(null);

  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAuth = user?.isAuthenticated;

  const currentLangCode = i18n.resolvedLanguage?.split("-")[0] || "en";
  const currentLanguage =
    LANGUAGES.find((lang) => lang.code === currentLangCode)?.name || "English";

  const languageButtonClass = (lang) =>
    `w-full px-4 py-2 text-left text-sm transition text-gray-700 dark:text-gray-300 cursor-pointer ${currentLangCode === lang
      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
      : "hover:bg-gray-100 dark:hover:bg-gray-800"
    }`;

  const navLinkClass = ({ isActive }) =>
    `relative flex items-center h-16 text-sm transition-colors duration-200 ${isActive
      ? "text-black dark:text-white font-medium after:absolute after:left-0 after:right-0 after:bottom-[10px] after:h-[2px] after:bg-black dark:after:bg-white"
      : "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
    }`;

  const mobileLinkClass =
    "relative inline-flex items-center gap-2 w-fit px-2 py-1.5 text-gray-800 dark:text-gray-200 after:absolute after:left-2 after:bottom-0 after:h-[2px] after:w-0 after:bg-current after:transition-all after:duration-200 hover:after:w-[calc(100%-1rem)]";

  const getDisplayName = () => {
    if (!user) return "U";

    if (user.is_staff) {
      const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
      return fullName || t("navbar.admin");
    }

    if (user.user_type === "worker") {
      const fullName = [user.worker?.first_name, user.worker?.last_name]
        .filter(Boolean)
        .join(" ");
      return fullName || t("navbar.worker");
    }

    if (user.user_type === "client") {
      const clientType = user.client?.client_type;
      if (clientType === "company") {
        return user.client?.company_name || t("navbar.client");
      }
      const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
      return fullName || t("navbar.client");
    }

    return t("navbar.user");
  };

  const getProfileImage = () => {
    if (!user) return null;
    if (user.worker?.profile_image) return user.worker.profile_image;
    if (user.client?.avatar) return user.client.avatar;
    return null;
  };

  const profileImage = getProfileImage();
  const displayName = getDisplayName();

  const closeAllDropdowns = () => {
    setDropdown(false);
    setMobileProfileOpen(false);
    setDesktopLangOpen(false);
    setMobileLangOpen(false);
    setOpenCategory(false);
  };

  const closeMobile = () => {
    setOpen(false);
    closeAllDropdowns();
  };

  const toggleMobileMenu = () => {
    setOpen((prev) => {
      const nextState = !prev;
      closeAllDropdowns();
      return nextState;
    });
  };

  const handleLogout = async () => {
    closeAllDropdowns();
    setOpen(false);
    await logout();
    navigate("/");
  };

  const handleLanguageChange = async (code) => {
    await i18n.changeLanguage(code);
    localStorage.setItem("siralink_language", code);
    closeAllDropdowns();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    closeAllDropdowns();
    setOpen(false);
    const targetRoute = category === "jobs" ? "/jobs" : "/workers";
    navigate(`${targetRoute}?q=${encodeURIComponent(search.trim())}`);
  };

  // Close open menus outside click handler & Escape key press
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchCategoryRef.current &&
        !searchCategoryRef.current.contains(e.target)
      ) {
        setOpenCategory(false);
      }
      if (
        desktopLangRef.current &&
        !desktopLangRef.current.contains(e.target)
      ) {
        setDesktopLangOpen(false);
      }
      if (
        mobileLangRef.current &&
        !mobileLangRef.current.contains(e.target)
      ) {
        setMobileLangOpen(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target)
      ) {
        setDropdown(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeAllDropdowns();
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Prevent background scrolling when mobile menu drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  return (
    <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
      {/* TOP BAR */}
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
        {/* LEFT */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            className="md:hidden text-gray-800 dark:text-gray-200 cursor-pointer p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            onClick={toggleMobileMenu}
            aria-label="Toggle Navigation Menu"
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <div className="flex items-center shrink-0">
            <Link to="/" onClick={closeMobile} className="flex items-center h-6 md:h-7">
              <ThemedLogo alt="SiraLink" className="h-full w-auto object-contain" />
            </Link>
          </div>
        </div>

        {/* LANGUAGE + THEME IN MOBILE VIEW */}
        <div className="flex items-center gap-2 md:hidden ml-auto">
          {/* MOBILE LANGUAGE DROPDOWN */}
          <div className="relative inline-flex items-center" ref={mobileLangRef}>
            <button
              onClick={() => {
                setMobileLangOpen((prev) => !prev);
                setMobileProfileOpen(false);
              }}
              aria-expanded={mobileLangOpen}
              aria-haspopup="true"
              aria-label="Select Language"
              className="flex items-center gap-1 px-2 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              <Globe size={17} />
              <span className="min-w-fit">{currentLanguage}</span>
              <ChevronDown
                size={12}
                className={`transition-transform ${mobileLangOpen ? "rotate-180" : ""}`}
              />
            </button>

            {mobileLangOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg overflow-hidden z-50">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={languageButtonClass(lang.code)}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* THEME */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Dark Mode"
            className="flex items-center justify-center w-9 h-9 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>

        {/* SEARCH FORM (DESKTOP) */}
        <div className="hidden md:flex flex-1 justify-center">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center w-80 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full px-3 shadow-sm hover:shadow-md transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-300"
          >
            <Search size={16} className="text-gray-500 dark:text-gray-400 mr-2 shrink-0" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("navbar.searchPlaceholder")}
              className="flex-1 py-2 text-sm bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />

            <div
              className="relative border-l border-gray-200 dark:border-gray-700"
              ref={searchCategoryRef}
            >
              <button
                type="button"
                onClick={() => {
                  setOpenCategory((prev) => !prev);
                  setDropdown(false);
                  setDesktopLangOpen(false);
                }}
                aria-expanded={openCategory}
                aria-haspopup="true"
                className="px-3 py-2 text-sm flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-gray-100 transition whitespace-nowrap cursor-pointer"
              >
                {category === "jobs" ? t("navbar.jobs") : t("navbar.workers")}
                <ChevronDown
                  size={14}
                  className={`text-gray-500 dark:text-gray-300 transition-transform duration-200 ${openCategory ? "rotate-180" : ""
                    }`}
                />
              </button>

              {openCategory && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in">
                  <button
                    type="button"
                    onClick={() => {
                      setCategory("jobs");
                      setOpenCategory(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 cursor-pointer"
                  >
                    {t("navbar.jobs")}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCategory("workers");
                      setOpenCategory(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 cursor-pointer"
                  >
                    {t("navbar.workers")}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* RIGHT SIDE (DESKTOP) */}
        <div className="flex items-center gap-6 ml-auto">
          <nav className="font-bold hidden md:flex items-center gap-5">
            {!isAuth && (
              <>
                <NavLink to="/jobs" className={navLinkClass}>
                  {t("navbar.findWork")}
                </NavLink>

                <NavLink to="/workers" className={navLinkClass}>
                  {t("navbar.hireWorkers")}
                </NavLink>
              </>
            )}

            {isAuth && (
              <>
                {user?.user_type === "worker" ? (
                  <>
                    <NavLink to="/jobs" className={navLinkClass}>
                      {t("navbar.findWork")}
                    </NavLink>

                    <NavLink to="/worker/jobs/applied" className={navLinkClass}>
                      {t("navbar.deliverWork")}
                    </NavLink>
                  </>
                ) : user?.user_type === "client" ? (
                  <>
                    <NavLink to="/workers" className={navLinkClass}>
                      {t("navbar.findWorkers")}
                    </NavLink>

                    <NavLink className={navLinkClass} to="/client/jobs/post">
                      {t("navbar.postJob")}
                    </NavLink>
                  </>
                ) : null}

                <NavLink to="/ca/messages" className={navLinkClass}>
                  {t("navbar.messages")}
                </NavLink>

                <NavLink to="/ca/notifications" className={navLinkClass} aria-label="Notifications">
                  <Bell size={20} />
                </NavLink>

                <NavLink to="/ca/help" className={navLinkClass} aria-label="Help">
                  <HelpCircle size={20} />
                </NavLink>
              </>
            )}

            {!isAuth && (
              <NavLink to="/how-it-works" className={navLinkClass}>
                {t("navbar.howItWorks")}
              </NavLink>
            )}

            {/* DESKTOP LANGUAGE DROPDOWN */}
            <div className="relative flex items-center" ref={desktopLangRef}>
              <button
                onClick={() => {
                  setDesktopLangOpen((prev) => !prev);
                  setDropdown(false);
                }}
                aria-expanded={desktopLangOpen}
                aria-haspopup="true"
                aria-label="Select Language"
                className="flex items-center gap-1 h-16 text-sm transition-colors duration-200 text-gray-800 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer"
              >
                <Globe size={17} />
                <span className="min-w-fit">{currentLanguage}</span>
                <ChevronDown
                  size={12}
                  className={`transition-transform ${desktopLangOpen ? "rotate-180" : ""}`}
                />
              </button>

              {desktopLangOpen && (
                <div className="absolute left-0 top-full mt-1 w-44 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg overflow-hidden z-50">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={languageButtonClass(lang.code)}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* DESKTOP THEME SECTION */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="flex items-center justify-center w-9 h-9 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition cursor-pointer"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </nav>

          {/* PROFILE (DESKTOP) */}
          <div className="hidden md:flex items-center">
            {!isAuth ? (
              <div className="font-bold flex items-center gap-4">
                <NavLink to="/login" className={navLinkClass}>
                  {t("navbar.login")}
                </NavLink>

                <Link
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-200"
                  to="/signup"
                >
                  {t("navbar.getStarted")}
                </Link>
              </div>
            ) : (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => {
                    setDropdown((prev) => !prev);
                    setDesktopLangOpen(false);
                  }}
                  aria-expanded={dropdown}
                  aria-haspopup="true"
                  aria-label="Profile Menu"
                  className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 rounded-full transition cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center border border-gray-300 dark:border-gray-600">
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
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {displayName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <div className="flex flex-col text-sm">
                      <Link
                        to="/account/profile"
                        onClick={closeAllDropdowns}
                        className="px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      >
                        {t("navbar.profile")}
                      </Link>

                      <Link
                        to="/account/settings"
                        onClick={closeAllDropdowns}
                        className="px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      >
                        {t("navbar.settings")}
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition"
                      >
                        {t("navbar.logout")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE MENU DRAWER */}
      {open && (
        <div className="md:hidden border-t bg-white dark:bg-gray-950 dark:border-gray-800 px-4 py-4 space-y-4 text-sm transition-colors duration-300 h-[calc(100vh-4rem)] overflow-y-auto">
          {/* AUTHENTICATED USER HEADER */}
          {isAuth && (
            <div className="border-b border-gray-200 dark:border-gray-800 pb-3">
              <button
                onClick={() => {
                  setMobileProfileOpen((prev) => !prev);
                  setMobileLangOpen(false);
                }}
                className="w-full flex items-center justify-between py-1 cursor-pointer"
                aria-expanded={mobileProfileOpen}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0 border border-gray-300 dark:border-gray-600">
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
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <ChevronDown
                  size={16}
                  className={`text-gray-600 dark:text-gray-300 transition-transform duration-200 ${mobileProfileOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {/* Collapsible Sub-menu */}
              {mobileProfileOpen && (
                <div className="flex flex-col mt-2 ml-3 border-l-2 border-gray-200 dark:border-gray-800 pl-3 space-y-2 pt-1">
                  <Link
                    to="/account/profile"
                    onClick={closeMobile}
                    className={mobileLinkClass}
                  >
                    {t("navbar.profile")}
                  </Link>

                  <Link
                    to="/account/settings"
                    onClick={closeMobile}
                    className={mobileLinkClass}
                  >
                    {t("navbar.settings")}
                  </Link>

                  <button
                    onClick={handleLogout}
                    className={`${mobileLinkClass} w-full text-left text-red-600 dark:text-red-400 cursor-pointer`}
                  >
                    {t("navbar.logout")}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MOBILE SEARCH BAR */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl px-3 py-1.5"
          >
            <Search size={16} className="text-gray-500 dark:text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("navbar.searchPlaceholder")}
              className="flex-1 px-2 py-1 outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="text-xs bg-transparent text-gray-600 dark:text-gray-300 outline-none border-l border-gray-300 dark:border-gray-700 pl-2 cursor-pointer"
            >
              <option value="jobs" className="dark:bg-gray-900">
                {t("navbar.jobs")}
              </option>
              <option value="workers" className="dark:bg-gray-900">
                {t("navbar.workers")}
              </option>
            </select>
          </form>

          {/* NAVIGATION LINKS */}
          <div className="flex flex-col space-y-1 pt-1">
            {!isAuth && (
              <>
                <Link onClick={closeMobile} to="/jobs" className={mobileLinkClass}>
                  {t("navbar.findWork")}
                </Link>
                <Link onClick={closeMobile} to="/workers" className={mobileLinkClass}>
                  {t("navbar.hireWorkers")}
                </Link>
                <Link onClick={closeMobile} to="/how-it-works" className={mobileLinkClass}>
                  {t("navbar.howItWorks")}
                </Link>
                <div className="pt-2 flex flex-col gap-2">
                  <Link onClick={closeMobile} to="/login" className={mobileLinkClass}>
                    {t("navbar.login")}
                  </Link>
                  <Link
                    onClick={closeMobile}
                    to="/signup"
                    className="w-full text-center bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                  >
                    {t("navbar.getStarted")}
                  </Link>
                </div>
              </>
            )}

            {isAuth && (
              <>
                {user?.user_type === "worker" && (
                  <>
                    <Link onClick={closeMobile} to="/jobs" className={mobileLinkClass}>
                      {t("navbar.findWork")}
                    </Link>
                    <Link onClick={closeMobile} to="/worker/jobs/applied" className={mobileLinkClass}>
                      {t("navbar.deliverWork")}
                    </Link>
                  </>
                )}

                {user?.user_type === "client" && (
                  <>
                    <Link onClick={closeMobile} to="/workers" className={mobileLinkClass}>
                      {t("navbar.findWorkers")}
                    </Link>
                    <Link onClick={closeMobile} to="/client/jobs/post" className={mobileLinkClass}>
                      {t("navbar.postJob")}
                    </Link>
                  </>
                )}

                <Link onClick={closeMobile} to="/ca/messages" className={mobileLinkClass}>
                  {t("navbar.messages")}
                </Link>

                <Link onClick={closeMobile} to="/ca/notifications" className={mobileLinkClass}>
                  <Bell size={16} />
                  <span>{t("navbar.notifications")}</span>
                </Link>

                <Link onClick={closeMobile} to="/ca/help" className={mobileLinkClass}>
                  <HelpCircle size={16} />
                  <span>{t("navbar.help")}</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;