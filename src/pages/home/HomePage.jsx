import React from "react";
import { Link, Navigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  Wrench,
  Zap,
  Sparkles,
  BookOpen,
  Hammer,
  Paintbrush,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getHomeRoute } from "../../utils/getHomeRoute";

function HomePage() {
  const { user, loading } = useAuth();

  const services = [
    {
      name: "Plumbing",
      icon: Wrench,
      color:
        "text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-900/60",
    },
    {
      name: "Electrical",
      icon: Zap,
      color:
        "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-950/60",
    },
    {
      name: "Cleaning",
      icon: Sparkles,
      color:
        "text-green-600 bg-green-100 dark:text-emerald-400 dark:bg-emerald-950/60",
    },
    {
      name: "Tutoring",
      icon: BookOpen,
      color:
        "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-950/60",
    },
    {
      name: "Appliance Repair",
      icon: Wrench,
      color:
        "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-950/60",
    },
    {
      name: "Painting",
      icon: Paintbrush,
      color: "text-pink-600 bg-pink-100 dark:text-pink-400 dark:bg-pink-950/60",
    },
    {
      name: "Carpentry",
      icon: Hammer,
      color:
        "text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-950/60",
    },
  ];

  // wait auth check
  if (loading) {
    return (
      <div className="p-8 text-gray-500 dark:text-gray-400 font-medium">
        Loading...
      </div>
    );
  }

  // if logged in → redirect to dashboard
  if (user?.isAuthenticated) {
    return <Navigate to={getHomeRoute(user)} replace />;
  }

  // 🔥 NOT LOGGED IN → show landing page
  return (
    <div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 transition-colors duration-300 min-h-screen">
      {/* HERO SECTION */}
      <section className="bg-white dark:bg-gray-950 py-20 border-b border-gray-100 dark:border-gray-900">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
              Find Skilled Workers or Get Hired Fast in Ethiopia
            </h1>

            <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              EthioWorks connects clients and skilled workers for jobs like
              plumbing, electrical work, cleaning, tutoring and more.
            </p>

            <div className="mt-6 flex gap-4">
              <Link
                to="/jobs/available"
                className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-950 dark:hover:bg-gray-200 transition-colors font-medium shadow-sm"
              >
                Find Work
              </Link>

              <Link
                to="/hire"
                className="border border-gray-300 dark:border-gray-800 text-gray-800 dark:text-gray-200 px-6 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors font-medium"
              >
                Hire Talent
              </Link>
            </div>
          </div>

          <div className="flex justify-center">
            <img
              src="src/assets/workers.png"
              alt="workers"
              className="rounded-2xl shadow-xl border border-transparent dark:border-gray-900 dark:shadow-black/40"
            />
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="py-16 overflow-hidden bg-gray-50 dark:bg-gray-900/40">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 text-sm font-semibold">
            Categories
          </span>

          <h2 className="text-3xl font-black mb-10 text-gray-900 dark:text-white">
            Popular Services
          </h2>

          <div className="relative overflow-hidden">
            <Motion.div
              className="flex gap-6"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 20, ease: "linear", repeat: Infinity }}
            >
              {[...services, ...services].map((service, index) => {
                const Icon = service.icon;

                return (
                  <div
                    key={index}
                    className="min-w-62.5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md dark:hover:border-gray-700 transition-all duration-300"
                  >
                    {/* TOP ROW: ICON + TITLE */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 flex items-center justify-center rounded-lg ${service.color}`}
                      >
                        <Icon size={22} />
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {service.name}
                      </h3>
                    </div>

                    {/* DESCRIPTION BELOW */}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 leading-relaxed ">
                      Find verified {service.name.toLowerCase()} professionals
                    </p>
                  </div>
                );
              })}
            </Motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative overflow-hidden bg-white dark:bg-gray-950 py-24 border-y border-gray-100 dark:border-gray-900">
        {/* BACKGROUND EFFECTS */}
        <div className="absolute inset-0 opacity-30 dark:opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-gray-200 dark:bg-slate-900/40 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-100 dark:bg-purple-950/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6">
          {/* HEADER */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 text-sm font-semibold">
              Simple Process
            </span>

            <h2 className="mt-5 text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              How EthioWorks Hub Works
            </h2>

            <p className="mt-5 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              A fast and seamless way for clients and skilled professionals to
              connect, collaborate, and grow together.
            </p>
          </div>

          {/* STEPS */}
          <div className="relative grid md:grid-cols-3 gap-8">
            {/* CONNECTING LINE */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>

            {[
              {
                step: "01",
                title: "Post a Job",
                desc: "Clients publish jobs with clear budgets, requirements, and timelines.",
              },
              {
                step: "02",
                title: "Receive Applications",
                desc: "Skilled workers apply with proposals, experience, and ratings.",
              },
              {
                step: "03",
                title: "Hire & Collaborate",
                desc: "Choose the best professional, complete the work, and pay securely.",
              },
            ].map((item, index) => (
              <Motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="relative group"
              >
                <div className="relative z-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl dark:shadow-black/30 transition-all duration-300 overflow-hidden">
                  {/* HOVER GLOW */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-linear-to-br from-gray-500/5 to-slate-500/5"></div>

                  {/* STEP NUMBER */}
                  <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br from-gray-800 to-gray-950 dark:from-gray-100 dark:to-gray-300 text-white dark:text-gray-950 text-2xl font-black shadow-lg mx-auto">
                    {item.step}
                  </div>

                  {/* CONTENT */}
                  <div className="relative text-center mt-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {item.title}
                    </h3>

                    <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  {/* BOTTOM ACCENT */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-100 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </div>
              </Motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST / STATS */}
      <section className="relative py-20 overflow-hidden bg-gray-50 dark:bg-gray-900/40 border-y border-gray-100 dark:border-gray-800">
        <div className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-72 h-72 bg-gray-200 dark:bg-gray-900/40 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-slate-200 dark:bg-slate-900/40 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6">
          {/* HEADER */}
          <div className="text-center mb-14">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold">
              Platform Insights
            </span>

            <h2 className="mt-5 text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              Trusted Across Ethiopia
            </h2>

            <p className="mt-5 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Thousands of professionals and clients use EthioWorks to connect,
              hire, and build opportunities every day.
            </p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "10K+", label: "Active Workers" },
              { value: "5K+", label: "Jobs Posted" },
              { value: "98%", label: "Successful Hires" },
              { value: "24/7", label: "Platform Support" },
            ].map((item, index) => (
              <Motion.div
                key={index}
                whileHover={{ y: -6, scale: 1.03 }}
                transition={{ duration: 0.2 }}
                className="group relative overflow-hidden bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-800 rounded-3xl p-8 text-center shadow-lg dark:shadow-black/20"
              >
                <div className="absolute inset-0 bg-linear-to-br from-gray-500/5 to-slate-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <h3 className="relative text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                  {item.value}
                </h3>

                <p className="relative mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {item.label}
                </p>
              </Motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 text-sm font-semibold">
              Why EthioWorks
            </span>

            <h2 className="mt-5 text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              Built for Ethiopia’s Workforce
            </h2>

            <p className="mt-5 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              A modern platform helping clients and skilled professionals
              connect faster, work smarter, and grow confidently.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-7">
            {[
              {
                title: "Verified Professionals",
                desc: "Hire trusted workers with verified profiles, reviews, and proven experience.",
              },
              {
                title: "Secure Payments",
                desc: "Safe transactions and transparent payments for both clients and workers.",
              },
              {
                title: "Fast Hiring",
                desc: "Post jobs, receive applications quickly, and hire in minutes.",
              },
            ].map((item, index) => (
              <Motion.div
                key={index}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="group relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-8 shadow-sm hover:shadow-2xl dark:shadow-black/10"
              >
                <div className="absolute top-0 left-0 h-1 w-full bg-linear-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-100"></div>

                <div className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-800 dark:text-gray-200 font-bold text-xl">
                  {index + 1}
                </div>

                <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">
                  {item.title}
                </h3>

                <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </Motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative py-20 overflow-hidden bg-gray-50 dark:bg-gray-900/40 border-y border-gray-100 dark:border-gray-800">
        <div className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none">
          <div className="absolute top-10 right-20 w-80 h-80 bg-gray-200 dark:bg-gray-800/50 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold">
              Testimonials
            </span>

            <h2 className="mt-5 text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              Trusted by Clients & Workers
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-7">
            {[
              {
                name: "Abel T.",
                role: "Client",
                text: "EthioWorks helped me hire a skilled electrician within a day.",
              },
              {
                name: "Meron A.",
                role: "Worker",
                text: "I found consistent freelance work and reliable clients.",
              },
              {
                name: "Samuel K.",
                role: "Client",
                text: "The platform is clean, professional, and easy to use.",
              },
            ].map((item, index) => (
              <Motion.div
                key={index}
                whileHover={{ y: -6 }}
                className="group bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-lg dark:shadow-black/20"
              >
                <div className="flex items-center gap-1 text-yellow-500">
                  ★ ★ ★ ★ ★
                </div>

                <p className="mt-5 text-gray-600 dark:text-gray-300 leading-relaxed text-lg italic">
                  "{item.text}"
                </p>

                <div className="mt-8 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-gray-700 to-gray-900 text-white flex items-center justify-center font-bold">
                    {item.name.charAt(0)}
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      {item.name}
                    </h4>

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.role}
                    </p>
                  </div>
                </div>
              </Motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-24 bg-linear-to-r from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-gray-950 dark:to-black transition-colors duration-300">
        {/* soft glow background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300 dark:bg-blue-900 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center px-5 py-2 rounded-full border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-md text-sm font-semibold tracking-wide text-gray-800 dark:text-gray-200">
              Ethiopia’s Modern Hiring Platform
            </span>

            <h2 className="mt-8 text-4xl md:text-5xl font-black tracking-tight leading-tight text-gray-900 dark:text-white">
              Ready to Get Started?
            </h2>

            <p className="mt-6 text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
              Join thousands of professionals and clients using EthioWorks to
              build careers, hire talent, and grow businesses across Ethiopia.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Create Account
              </Link>

              <Link
                to="/jobs/available"
                className="inline-flex items-center justify-center border border-gray-300 dark:border-white/20 bg-white/60 dark:bg-white/5 backdrop-blur-md text-gray-900 dark:text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/80 dark:hover:bg-white/10 hover:scale-105 transition-all duration-300"
              >
                Browse Jobs
              </Link>
            </div>
          </Motion.div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
