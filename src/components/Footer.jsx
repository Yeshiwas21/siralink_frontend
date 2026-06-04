import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  const footerLinkClass =
    "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200";

  return (
    <footer className="bg-white dark:bg-gray-950 text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-800 mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* TOP SECTION */}
        <div className="grid md:grid-cols-4 gap-8">
          {/* BRAND */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              EthioWorks Hub
            </h2>

            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 mt-3">
              Connecting clients with skilled workers across Ethiopia. Build,
              hire, and grow with ease.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Quick Links
            </h3>

            <ul className="space-y-2 text-sm">
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
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              For Workers
            </h3>

            <ul className="space-y-2 text-sm">
              <li>
                <Link className={footerLinkClass} to="/jobs/available">
                  Browse Jobs
                </Link>
              </li>

              <li>
                <Link className={footerLinkClass} to="/register/worker">
                  Become a Worker
                </Link>
              </li>

              <li>
                <Link className={footerLinkClass} to="/verification">
                  Verification
                </Link>
              </li>
            </ul>
          </div>

          {/* CLIENTS */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              For Clients
            </h3>

            <ul className="space-y-2 text-sm">
              <li>
                <Link className={footerLinkClass} to="/jobs/post">
                  Post a Job
                </Link>
              </li>

              <li>
                <Link className={footerLinkClass} to="/register/client">
                  Become a Client
                </Link>
              </li>

              <li>
                <Link className={footerLinkClass} to="/payments/client">
                  Payments
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-10 pt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} EthioWorks Hub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
export default Footer;
