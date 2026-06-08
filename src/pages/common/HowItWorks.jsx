import React from "react";
import { motion as Motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Create Your Profile",
      desc: "Sign up as a Client or Worker and build your profile with skills, location, and experience.",
      extra:
        "Verified profiles increase trust and improve your chances of getting hired faster.",
    },
    {
      step: "02",
      title: "Post or Discover Jobs",
      desc: "Clients post job requests. Workers browse opportunities based on skills and location.",
      extra: "Smart filtering helps you find the right match quickly.",
    },
    {
      step: "03",
      title: "Connect & Communicate",
      desc: "Chat, negotiate price, and agree on job details before starting.",
      extra: "Clear communication reduces misunderstandings.",
    },
    {
      step: "04",
      title: "Work Progress",
      desc: "Complete work while keeping transparency with updates and tracking.",
      extra: "Clients can request updates anytime.",
    },
    {
      step: "05",
      title: "Payment & Rating",
      desc: "Secure payment release after completion and mutual reviews.",
      extra: "Ratings improve your visibility and trust score.",
    },
  ];

  return (
    <section className="relative py-28 bg-linear-to-b from-gray-50 to-white dark:from-black dark:to-gray-950 overflow-hidden">
      {/* BACKGROUND */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-125 h-125 bg-blue-100 dark:bg-blue-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-125 h-125 bg-purple-100 dark:bg-purple-900/20 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6">
        {/* HEADER */}
        <div className="text-center mb-20">
          <span className="inline-flex px-5 py-2 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300">
            ⚡ Simple Workflow
          </span>

          <h2 className="mt-6 text-4xl font-black text-gray-900 dark:text-white">
            How It Works
          </h2>

          <p className="mt-5 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Step-by-step system showing how clients and workers connect and
            complete jobs.
          </p>
        </div>

        {/* TIMELINE */}
        <div className="relative">
          {steps.map((item, index) => (
            <Motion.div
              key={index}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              viewport={{ amount: 0.4 }} // 🔥 re-triggers when re-entering view
              className="relative flex flex-col items-center text-center"
            >
              {/* NUMBER CIRCLE */}
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-900 dark:bg-white text-white dark:text-black font-black text-lg shadow-md z-10">
                {item.step}
              </div>

              {/* CONTENT */}
              <div className="mt-5 max-w-xl px-2">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  {item.title}
                </h3>

                <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm md:text-base">
                  {item.desc}
                </p>

                <p className="mt-3 text-xs md:text-sm text-gray-500 dark:text-gray-500 italic">
                  {item.extra}
                </p>
              </div>

              {/* CONNECTOR */}
              {index !== steps.length - 1 && (
                <div className="my-8 flex flex-col items-center text-gray-400 dark:text-gray-600">
                  <div className="w-px h-10 bg-gray-300 dark:bg-gray-800" />
                  <ChevronDown className="w-5 h-5 animate-bounce" />
                </div>
              )}
            </Motion.div>
          ))}
        </div>

        {/* BOTTOM INFO CARDS (CONNECTED ON ALL SCREENS) */}
        <div className="mt-20 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* MOBILE VERTICAL LINE */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800 md:hidden"></div>

            {/* DESKTOP HORIZONTAL LINE */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-linear-to-r from-transparent via-gray-300 to-transparent dark:via-gray-700"></div>

            {[
              {
                title: "Trust First System",
                desc: "Built to increase safety, transparency, and confidence for both sides.",
              },
              {
                title: "Fast Matching",
                desc: "Active workers respond quickly to new job postings.",
              },
              {
                title: "Secure Workflow",
                desc: "Payments and communication are structured and protected.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="relative pl-10 md:pl-0 p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition hover:-translate-y-1 hover:shadow-xl"
              >
                {/* NODE (mobile + desktop) */}
                <div className="absolute left-4 top-6 md:left-1/2 md:-top-2 md:-translate-x-1/2 w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-600"></div>

                <h4 className="font-bold text-gray-900 dark:text-white text-base md:text-lg text-left md:text-center">
                  {item.title}
                </h4>

                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed text-left md:text-center">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
