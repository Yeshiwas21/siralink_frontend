import React from "react";
import {
    TrendingUp,
    Users,
    ShieldCheck,
    Briefcase,
    Award,
    MapPin,
    ArrowRight,
    HeartHandshake
} from "lucide-react";

export default function OurImpact() {
    const impactStats = [
        { label: "Worker Income Growth", value: "35%", subtext: "Average increase after joining SiraLink" },
        { label: "Jobs Facilitated", value: "10,000+", subtext: "Connecting local talent with clients" },
        { label: "Verified Professionals", value: "1,500+", subtext: "Across 25+ service categories" },
        { label: "Satisfaction Rate", value: "98%", subtext: "Based on post-service client ratings" },
    ];

    const impactPillars = [
        {
            icon: <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
            title: "Economic Empowerment",
            description:
                "By digitizing local services, we enable skilled workers to increase their daily bookings, secure fair compensation, and gain reliable, steady incomes.",
        },
        {
            icon: <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
            title: "Building Trust & Formalization",
            description:
                "Through national ID checks and clear digital credentials, we bring transparency and trust to Ethiopia’s informal service sector.",
        },
        {
            icon: <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
            title: "Equal Opportunity Access",
            description:
                "We level the playing field so tradespeople, technicians, and manual workers can showcase their portfolios and land clients based on skill.",
        },
        {
            icon: <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
            title: "Local Community Growth",
            description:
                "Matching service seekers with nearby experts keeps economic value inside local communities and drastically cuts down service wait times.",
        },
    ];

    const stories = [
        {
            quote:
                "SiraLink changed my plumbing business completely. Before joining, I relied on word-of-mouth. Now I receive regular requests from clients right in my neighborhood.",
            author: "Abebe T.",
            role: "Certified Plumber",
            location: "Addis Ababa",
        },
        {
            quote:
                "Finding verified electricians used to take days of asking around. With SiraLink, I hired a qualified professional within 20 minutes with total peace of mind.",
            author: "Bethlehem M.",
            role: "Homeowner",
            location: "Addis Ababa",
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
                            <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>Our Impact</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                            Driving Real Change in Ethiopia’s Workforce
                        </h1>

                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-normal leading-relaxed">
                            We are dedicated to building a transparent, dignified, and tech-enabled labor ecosystem that creates sustainable livelihoods and simplifies daily life for everyone.
                        </p>
                    </div>
                </div>
            </section>

            {/* KEY METRICS GRID */}
            <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {impactStats.map((stat, index) => (
                        <div
                            key={index}
                            className="p-8 rounded-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-xs flex flex-col justify-between"
                        >
                            <div>
                                <p className="text-4xl sm:text-5xl font-extrabold text-blue-600 dark:text-blue-400">
                                    {stat.value}
                                </p>
                                <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">
                                    {stat.label}
                                </h3>
                            </div>
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                {stat.subtext}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CORE IMPACT AREAS */}
            <section className="py-16 sm:py-24 bg-white dark:bg-gray-950 border-y border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            How SiraLink Makes a Difference
                        </h2>
                        <p className="mt-3 text-gray-600 dark:text-gray-400">
                            Transforming informal labor markets into structured, empowering opportunities.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {impactPillars.map((pillar, idx) => (
                            <div
                                key={idx}
                                className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex gap-5 hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all duration-200 shadow-xs"
                            >
                                <div className="p-3.5 h-fit rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 shrink-0">
                                    {pillar.icon}
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {pillar.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {pillar.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* REAL STORIES / TESTIMONIALS */}
            <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-3">
                        <HeartHandshake className="w-4 h-4" />
                        <span>Community Stories</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Real Impact on Real Lives
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {stories.map((story, index) => (
                        <div
                            key={index}
                            className="p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs flex flex-col justify-between space-y-6"
                        >
                            <p className="text-gray-700 dark:text-gray-300 text-base italic leading-relaxed">
                                "{story.quote}"
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                                        {story.author}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {story.role}
                                    </p>
                                </div>
                                <span className="text-xs px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium">
                                    {story.location}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA BANNER */}
            <section className="py-16 bg-blue-600 dark:bg-blue-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                        Be Part of Our Impact Story
                    </h2>
                    <p className="text-blue-100 max-w-2xl mx-auto text-base sm:text-lg">
                        Join SiraLink today to find reliable local service workers or start growing your own skilled service business.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <a
                            href="/signup/worker"
                            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white text-blue-600 font-bold hover:bg-blue-50 transition-colors duration-200 shadow-md flex items-center justify-center gap-2"
                        >
                            <span>Join as a Skilled Worker</span>
                            <ArrowRight className="w-4 h-4" />
                        </a>
                        <a
                            href="/workers"
                            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-700 dark:bg-blue-800 text-white font-bold border border-blue-500 hover:bg-blue-800 dark:hover:bg-blue-900 transition-colors duration-200 flex items-center justify-center"
                        >
                            Find a Worker
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}