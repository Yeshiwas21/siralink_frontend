import React, { useState } from "react";
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    Send,
    MessageSquare,
    CheckCircle2,
    AlertCircle,
    Headphones
} from "lucide-react";

export default function ContactUs() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        subject: "General Inquiry",
        message: "",
    });

    const [status, setStatus] = useState({ type: null, message: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: null, message: "" });

        // Simulate API request
        try {
            await new Promise((resolve) => setTimeout(resolve, 1200));
            setStatus({
                type: "success",
                message: "Thank you for reaching out! Our team will get back to you within 24 hours.",
            });
            setFormData({
                fullName: "",
                email: "",
                phone: "",
                subject: "General Inquiry",
                message: "",
            });
        } catch {
            setStatus({
                type: "error",
                message: "Something went wrong while sending your message. Please try again. ",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const contactDetails = [
        {
            icon: <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
            title: "Call Us",
            info: "+251 911 000 000",
            subtext: "Mon-Sat from 8:00 AM to 6:00 PM (EAT)",
            href: "tel:+251911000000",
        },
        {
            icon: <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
            title: "Email Us",
            info: "support@siralink.com",
            subtext: "We usually respond within a few hours",
            href: "mailto:support@siralink.com",
        },
        {
            icon: <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
            title: "Visit Our Office",
            info: "Bole Sub-City, Ward 03",
            subtext: "Addis Ababa, Ethiopia",
            href: "#",
        },
        {
            icon: <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
            title: "Operating Hours",
            info: "Monday – Saturday",
            subtext: "8:30 AM – 5:30 PM (EAT)",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
            {/* HEADER SECTION - UPDATED */}
            <section className="relative overflow-hidden py-16 lg:py-24 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider shadow-xs">
                        <Headphones className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>We're Here to Help</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-gray-900 dark:text-white">
                        Let's Start a Conversation
                    </h1>

                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-normal leading-relaxed">
                        Have questions about finding service workers, managing bookings, or partnering with SiraLink? Reach out to our support team directly.
                    </p>
                </div>
            </section>

            {/* MAIN CONTENT CONTAINER */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* LEFT SIDE: Contact Info */}
                    <div className="lg:col-span-5 space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Contact Information
                            </h2>
                            <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                                Reach out directly via phone or email, or drop by our headquarters in Addis Ababa.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                            {contactDetails.map((item, index) => (
                                <div
                                    key={index}
                                    className="p-5 rounded-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 flex items-start gap-4 shadow-xs"
                                >
                                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 shrink-0">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                            {item.title}
                                        </h3>
                                        {item.href ? (
                                            <a
                                                href={item.href}
                                                className="text-base font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                            >
                                                {item.info}
                                            </a>
                                        ) : (
                                            <p className="text-base font-bold text-gray-900 dark:text-white">
                                                {item.info}
                                            </p>
                                        )}
                                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                            {item.subtext}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* QUICK FAQ ADMONITION */}
                        <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
                            <div className="flex gap-3">
                                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200">
                                        Are you a service provider?
                                    </h4>
                                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                                        If you want to offer plumbing, electrical, carpentry, or technical services on SiraLink, you can register directly via our onboard workflow.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Contact Form */}
                    <div className="lg:col-span-7">
                        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-xs space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Send Us a Message
                                </h2>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    Fill out the details below and we will get back to you shortly.
                                </p>
                            </div>

                            {status.type && (
                                <div
                                    className={`p-4 rounded-xl flex items-start gap-3 text-sm ${status.type === "success"
                                        ? "bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                                        : "bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
                                        }`}
                                >
                                    {status.type === "success" ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                                    )}
                                    <span>{status.message}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            required
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            placeholder="Abebe Bikila"
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                            Email Address <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="abebe@example.com"
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+251 9..."
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                            Subject
                                        </label>
                                        <select
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors"
                                        >
                                            <option value="General Inquiry">General Inquiry</option>
                                            <option value="Technical Support">Technical Support</option>
                                            <option value="Worker Registration">Worker Verification</option>
                                            <option value="Partnership">Business Partnership</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                        Message <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="message"
                                        required
                                        rows="5"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="How can we help you?"
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors resize-none"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <span>Sending message...</span>
                                    ) : (
                                        <>
                                            <span>Send Message</span>
                                            <Send className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}