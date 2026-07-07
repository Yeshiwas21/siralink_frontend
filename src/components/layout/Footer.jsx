import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import ThemedLogo from "../common/ThemedLogo";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaApple,
} from "react-icons/fa6";
import { ChevronDown, ChevronUp } from "lucide-react";
import { AiFillAndroid, AiOutlineAndroid } from "react-icons/ai";

function Footer() {
  const footerLinkClass =
    "relative text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full";

  const footerIconClass =
    "text-gray-600 dark:text-gray-300 hover:text-white hover:bg-gray-900 dark:hover:bg-white dark:hover:text-black p-2 rounded-full transition-all duration-300 hover:scale-110";

  const appIconsClass =
    "flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition";

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
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <ThemedLogo
                alt="SiraLink"
                className="h-6 md:h-7 w-auto object-contain"
              />
            </Link>

            {/* Tagline */}
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              Connecting clients with skilled workers across Ethiopia. Build,
              hire, and grow with ease.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <button
              onClick={() => toggleSection("quick")}
              className="w-full flex items-center justify-start gap-2 mb-3 md:cursor-default"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Quick Links
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
              className={`space-y-2 text-sm transition-all ${
                openSections.quick ? "block" : "hidden"
              } md:block`}
            >
              <li>
                <Link className={footerLinkClass} to="/jobs">
                  Find Jobs
                </Link>
              </li>
              <li>
                <Link className={footerLinkClass} to="/hire">
                  Hire Talent
                </Link>
              </li>
              <li>
                <Link className={footerLinkClass} to="/how-it-works">
                  How It Works
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
                For Workers
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
              className={`space-y-2 text-sm transition-all ${
                openSections.workers ? "block" : "hidden"
              } md:block`}
            >
              <li>
                <Link className={footerLinkClass} to="/jobs/available">
                  Browse Jobs
                </Link>
              </li>

              <li>
                <Link className={footerLinkClass} to="/signup/worker">
                  Become a Worker
                </Link>
              </li>

              <li>
                <Link className={footerLinkClass} to="/nearest-works">
                  Find Nearest Works
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
                For Clients
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
              className={`space-y-2 text-sm transition-all ${
                openSections.clients ? "block" : "hidden"
              } md:block`}
            >
              <li>
                <Link className={footerLinkClass} to="/jobs/post">
                  Post a Job
                </Link>
              </li>

              <li>
                <Link className={footerLinkClass} to="/signup/client">
                  Become a Client
                </Link>
              </li>

              <li>
                <Link className={footerLinkClass} to="/nearest-workers">
                  Find Nearest Workers
                </Link>
              </li>
            </ul>
          </div>
          {/* About the COmpany */}
          <div>
            <button
              onClick={() => toggleSection("company")}
              className="w-full flex items-center justify-start gap-2 mb-3 md:cursor-default"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Company
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
              className={`space-y-2 text-sm transition-all ${
                openSections.company ? "block" : "hidden"
              } md:block`}
            >
              <li>
                <Link className={footerLinkClass} to="/about-us">
                  About Us
                </Link>
              </li>
              <li>
                <Link className={footerLinkClass} to="/contact-us">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link className={footerLinkClass} to="/our-impact">
                  Our Impact
                </Link>
              </li>
              <li>
                <Link className={footerLinkClass} to="/terms">
                  Terms of Service
                </Link>
              </li>{" "}
              <li>
                <Link className={footerLinkClass} to="/privacy">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        {/* FOLLOW US + MOBILE APP */}
        <div className="mt-10 pt-6 md:px-8">
          <div className="flex items-center justify-between flex-wrap gap-6">
            {/* LEFT SIDE */}
            <div className="flex items-center gap-5 flex-wrap">
              <span className="text-gray-900 dark:text-white">Follow us</span>

              <a href="https://facebook.com" className={footerIconClass}>
                <FaFacebookF size={18} />
              </a>

              <a href="https://instagram.com" className={footerIconClass}>
                <FaInstagram size={18} />
              </a>

              <a href="https://linkedin.com" className={footerIconClass}>
                <FaLinkedinIn size={18} />
              </a>

              <a href="https://x.com" className={footerIconClass}>
                <FaXTwitter size={18} />
              </a>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-gray-900 dark:text-white">Mobile App</span>

              <a href="#" className={appIconsClass}>
                <FaApple size={18} />
              </a>

              <a href="#" className={appIconsClass}>
                <AiFillAndroid size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-6 text-center text-sm text-gray-600 dark:text-gray-200">
          © {new Date().getFullYear()} SiraLink Ethiopia. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
export default Footer;
