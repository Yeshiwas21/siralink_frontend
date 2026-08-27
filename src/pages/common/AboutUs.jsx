import React from "react";
import {
    ShieldCheck,
    Briefcase,
    Zap,
    Users,
    Search,
    CheckCircle2,
    ArrowRight,
    Info
} from "lucide-react";

export default function AboutUs() {
    const stats = [
        { label: "Verified Skilled Workers", value: "1,500+" },
        { label: "Jobs Completed", value: "10,000+" },
        { label: "Satisfied Clients", value: "98%" },
        { label: "Service Categories", value: "25+" },
    ];

    const values = [
        {
            icon: <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
            title: "Trust & Verification",
            description:
                "We verify worker credentials, identity details, and locations so clients can hire with complete peace of mind.",
        },
        {
            icon: <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
            title: "Empowering Local Workers",
            description:
                "We give independent contractors digital tools, portfolios, and visibility to build sustainable, high-earning careers.",
        },
        {
            icon: <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
            title: "Seamless & Instant",
            description:
                "From searching for a plumber to managing bookings, our web and mobile apps make finding talent quick and effortless.",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
            {/* HERO SECTION */}
            <section className="relative overflow-hidden py-20 lg:py-28 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
                <div className="absolute inset-0 bg-linear-to-br from-blue-50/50 via-transparent to-transparent dark:from-blue-950/20 pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        {/* UPDATED LABEL & ICON */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 text-xs font-semibold uppercase tracking-wider">
                            <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>Who We Are</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                            Connecting Ethiopian Talent with Every Opportunity
                        </h1>

                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-normal leading-relaxed">
                            SiraLink is a trusted local service marketplace built to transform how individuals and businesses connect with top-tier, verified service professionals across Ethiopia.
                        </p>
                    </div>
                </div>
            </section>

            {/* STATS SECTION */}
            <section className="py-12 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                        {stats.map((stat, index) => (
                            <div key={index} className="p-4">
                                <p className="text-3xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-400">
                                    {stat.value}
                                </p>
                                <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* MISSION & VISION */}
            <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Our Mission
                        </h2>
                        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                            Our mission is to empower local professionals by expanding their reach while giving clients a single, dependable platform to discover, verify, and hire qualified talent with confidence.
                        </p>
                        <div className="space-y-3 pt-2">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                <span className="text-gray-700 dark:text-gray-200 font-medium">
                                    Direct connection between clients and skilled professionals
                                </span>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                <span className="text-gray-700 dark:text-gray-200 font-medium">
                                    Transparent identity, skill, and location verification
                                </span>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                <span className="text-gray-700 dark:text-gray-200 font-medium">
                                    Digital tools tailored for Ethiopia's growing workforce
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 rounded-3xl bg-linear-to-br from-blue-600 to-indigo-700 text-white shadow-xl space-y-6">
                        <h3 className="text-2xl font-bold">Our Vision</h3>
                        <p className="text-blue-100 text-base leading-relaxed">
                            We envision an Ethiopian labor market where any skilled worker—from plumbers and electricians to technical specialists—can build a thriving business based on merit and skill, while clients access reliable services instantly.
                        </p>
                        <div className="pt-4 border-t border-blue-500/40 flex items-center justify-between text-xs text-blue-200">
                            <span>SiraLink Core Purpose</span>
                            <span>Local • Reliable • Empowering</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* CORE VALUES */}
            <section className="py-16 sm:py-24 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            What We Stand For
                        </h2>
                        <p className="mt-3 text-gray-600 dark:text-gray-400">
                            The core principles driving our local marketplace platform.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {values.map((item, idx) => (
                            <div
                                key={idx}
                                className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all duration-200 shadow-xs"
                            >
                                <div className="p-3 w-fit rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 mb-5">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        How SiraLink Works
                    </h2>
                    <p className="mt-3 text-gray-600 dark:text-gray-400">
                        A simple process designed for both service seekers and skilled workers.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {/* FOR CLIENTS */}
                    <div className="p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                <Search className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                For Clients
                            </h3>
                        </div>
                        <ul className="space-y-4">
                            <li className="flex gap-3">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold shrink-0 mt-0.5">
                                    1
                                </span>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                        Search & Discover
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        Browse verified workers across service categories in your location.
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold shrink-0 mt-0.5">
                                    2
                                </span>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                        Review Profiles
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        Compare skills, national ID status, experience, and past work.
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold shrink-0 mt-0.5">
                                    3
                                </span>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                        Connect & Hire
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        Book direct help and get your job done efficiently.
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* FOR WORKERS */}
                    <div className="p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                <Users className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                For Service Workers
                            </h3>
                        </div>
                        <ul className="space-y-4">
                            <li className="flex gap-3">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold shrink-0 mt-0.5">
                                    1
                                </span>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                        Create Your Profile
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        Highlight your category, experience, national ID, and portfolio.
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold shrink-0 mt-0.5">
                                    2
                                </span>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                        Gain Visibility
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        Get listed in our categorized directory so nearby clients find you.
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold shrink-0 mt-0.5">
                                    3
                                </span>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                        Grow Your Business
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        Build a digital reputation and increase your daily work opportunities.
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* CTA BANNER */}
            <section className="py-16 bg-blue-600 dark:bg-blue-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                        Ready to get started with SiraLink?
                    </h2>
                    <p className="text-blue-100 max-w-2xl mx-auto text-base sm:text-lg">
                        Join hundreds of Ethiopian workers growing their business or find the right professional for your next job today.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <a
                            href="/signup/worker"
                            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white text-blue-600 font-bold hover:bg-blue-50 transition-colors duration-200 shadow-md flex items-center justify-center gap-2"
                        >
                            <span>Join as a Worker</span>
                            <ArrowRight className="w-4 h-4" />
                        </a>
                        <a
                            href="/workers"
                            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-700 dark:bg-blue-800 text-white font-bold border border-blue-500 hover:bg-blue-800 dark:hover:bg-blue-900 transition-colors duration-200 flex items-center justify-center"
                        >
                            Find a Service Worker
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}