import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ThemedLogo from "../common/ThemedLogo";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaApple,
  FaTelegram,
} from "react-icons/fa6";
import { ChevronDown, ChevronUp } from "lucide-react";
import { AiFillAndroid } from "react-icons/ai";

function Footer() {
  const { t } = useTranslation();

  const footerLinkClass =
    "relative text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full";

  const footerIconClass =
    "text-gray-600 dark:text-gray-300 hover:text-white hover:bg-gray-900 dark:hover:bg-white dark:hover:text-black p-2 rounded-full transition-all duration-300 hover:scale-110";

  const appIconsClass =
    "flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800";

  const [openSections, setOpenSections] = useState({
    quick: false,
    workers: false,
    clients: false,
    company: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <footer className="bg-white dark:bg-gray-950 text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-800 mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* TOP SECTION */}
        <div className="grid md:grid-cols-5 gap-8">
          {/* BRAND */}
          <div className="space-y-3 max-w-sm">
            <Link to="/" className="flex items-center">
              <ThemedLogo
                alt="SiraLink"
                className="h-6 md:h-7 w-auto object-contain"
              />
            </Link>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {t("footer.tagline")}
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <button
              onClick={() => toggleSection("quick")}
              className="w-full flex items-center justify-start gap-2 mb-3 md:cursor-default"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t("footer.sections.quick_links")}
              </h3>
              <span className="md:hidden">
                {openSections.quick ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </span>
            </button>
            <ul
              className={`space-y-2 text-sm transition-all ${openSections.quick ? "block" : "hidden"
                } md:block`}
            >
              <li>
                <Link className={footerLinkClass} to="/jobs">
                  {t("footer.links.find_jobs")}
                </Link>
              </li>
              <li>
                <Link className={footerLinkClass} to="/hire">
                  {t("footer.links.hire_talent")}
                </Link>
              </li>
              <li>
                <Link className={footerLinkClass} to="/how-it-works">
                  {t("footer.links.how_it_works")}
                </Link>
              </li>
            </ul>
          </div>

          {/* WORKERS */}
          <div>
            <button
              onClick={() => toggleSection("workers")}
              className="w-full flex items-center justify-start gap-2 mb-3 md:cursor-default"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t("footer.sections.for_workers")}
              </h3>
              <span className="md:hidden">
                {openSections.workers ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </span>
            </button>
            <ul
              className={`space-y-2 text-sm transition-all ${openSections.workers ? "block" : "hidden"
                } md:block`}
            >
              <li>
                <Link className={footerLinkClass} to="/jobs/available">
                  {t("footer.links.browse_jobs")}
                </Link>
              </li>
              <li>
                <Link className={footerLinkClass} to="/signup/worker">
                  {t("footer.links.become_worker")}
                </Link>
              </li>
              <li>
                <Link className={footerLinkClass} to="/nearest-works">
                  {t("footer.links.nearest_works")}
                </Link>
              </li>
            </ul>
          </div>

          {/* CLIENTS */}
          <div>
            <button
              onClick={() => toggleSection("clients")}
              className="w-full flex items-center justify-start gap-2 mb-3 md:cursor-default"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t("footer.sections.for_clients")}
              </h3>
              <span className="md:hidden">
                {openSections.clients ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </span>
            </button>
            <ul
              className={`space-y-2 text-sm transition-all ${openSections.clients ? "block" : "hidden"
                } md:block`}
            >
              <li>
                <Link className={footerLinkClass} to="/jobs/post">
                  {t("footer.links.post_job")}
                </Link>
              </li>
              <li>
                <Link className={footerLinkClass} to="/signup/client">
                  {t("footer.links.become_client")}
                </Link>
              </li>
              <li>
                <Link className={footerLinkClass} to="/nearest-workers">
                  {t("footer.links.nearest_workers")}
                </Link>
              </li>
            </ul>
          </div>

          {/* COMPANY */}
          <div>
            <button
              onClick={() => toggleSection("company")}
              className="w-full flex items-center justify-start gap-2 mb-3 md:cursor-default"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t("footer.sections.company")}
              </h3>
              <span className="md:hidden">
                {openSections.company ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </span>
            </button>
            <ul
              className={`space-y-2 text-sm transition-all ${openSections.company ? "block" : "hidden"
                } md:block`}
            >
              <li>
                <Link className={footerLinkClass} to="/about-us">
                  {t("footer.links.about_us")}
                </Link>
              </li>
              <li>
                <Link className={footerLinkClass} to="/contact-us">
                  {t("footer.links.contact_us")}
                </Link>
              </li>
              <li>
                <Link className={footerLinkClass} to="/our-impact">
                  {t("footer.links.our_impact")}
                </Link>
              </li>
              <li>
                <Link className={footerLinkClass} to="/terms">
                  {t("footer.links.terms")}
                </Link>
              </li>
              <li>
                <Link className={footerLinkClass} to="/privacy">
                  {t("footer.links.privacy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* FOLLOW US + MOBILE APP SECTION */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            {/* FOLLOW US */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-sm">
              <span className="font-medium text-gray-900 dark:text-white mr-1">
                {t("footer.follow_us")}
              </span>

              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                <a
                  href="https://facebook.com/siralink"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footerIconClass}
                  aria-label="Facebook"
                >
                  <FaFacebookF size={16} />
                </a>

                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footerIconClass}
                  aria-label="Instagram"
                >
                  <FaInstagram size={16} />
                </a>

                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footerIconClass}
                  aria-label="LinkedIn"
                >
                  <FaLinkedinIn size={16} />
                </a>

                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footerIconClass}
                  aria-label="X"
                >
                  <FaXTwitter size={16} />
                </a>

                <a
                  href="https://t.me/siralink_ethiopia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footerIconClass}
                  aria-label="Telegram"
                >
                  <FaTelegram size={16} />
                </a>
              </div>
            </div>

            {/* MOBILE APP */}
            <div className="flex items-center gap-3 text-sm border-t border-gray-100 dark:border-gray-800/60 pt-4 w-full sm:w-auto sm:border-0 sm:pt-0">
              <span className="font-medium text-gray-900 dark:text-white">
                {t("footer.mobile_app")}
              </span>

              <div className="flex items-center gap-1">
                <a href="#" className={appIconsClass} aria-label="iOS App">
                  <FaApple size={18} />
                </a>

                <a href="#" className={appIconsClass} aria-label="Android App">
                  <AiFillAndroid size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-6 pt-6 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
}

export default Footer;