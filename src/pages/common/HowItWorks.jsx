import React from "react";
import { motion as Motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      step: "01",
      title: t("how_it_works.steps.step1.title"),
      desc: t("how_it_works.steps.step1.desc"),
      extra: t("how_it_works.steps.step1.extra"),
    },
    {
      step: "02",
      title: t("how_it_works.steps.step2.title"),
      desc: t("how_it_works.steps.step2.desc"),
      extra: t("how_it_works.steps.step2.extra"),
    },
    {
      step: "03",
      title: t("how_it_works.steps.step3.title"),
      desc: t("how_it_works.steps.step3.desc"),
      extra: t("how_it_works.steps.step3.extra"),
    },
    {
      step: "04",
      title: t("how_it_works.steps.step4.title"),
      desc: t("how_it_works.steps.step4.desc"),
      extra: t("how_it_works.steps.step4.extra"),
    },
    {
      step: "05",
      title: t("how_it_works.steps.step5.title"),
      desc: t("how_it_works.steps.step5.desc"),
      extra: t("how_it_works.steps.step5.extra"),
    },
  ];

  const infoCards = [
    {
      title: t("how_it_works.features.trust.title"),
      desc: t("how_it_works.features.trust.desc"),
    },
    {
      title: t("how_it_works.features.speed.title"),
      desc: t("how_it_works.features.speed.desc"),
    },
    {
      title: t("how_it_works.features.security.title"),
      desc: t("how_it_works.features.security.desc"),
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
            ⚡ {t("how_it_works.badge")}
          </span>

          <h2 className="mt-6 text-4xl font-black text-gray-900 dark:text-white">
            {t("how_it_works.title")}
          </h2>

          <p className="mt-5 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t("how_it_works.subtitle")}
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
              viewport={{ amount: 0.4 }}
              className="relative flex flex-col items-center text-center"
            >
              {/* NUMBER CIRCLE */}
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-900 dark:bg-white text-white dark:text-black font-black text-lg shadow-md z-10">
                {item.step}
              </div>

              {/* CONTENT */}
              <div className="mt-5 max-w-xl px-2">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {item.title}
                </h3>

                <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm md:text-base">
                  {item.desc}
                </p>

                <p className="mt-3 text-xs md:text-sm text-gray-500 dark:text-gray-300 italic">
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

        {/* BOTTOM INFO CARDS */}
        <div className="mt-20 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* MOBILE VERTICAL LINE */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800 md:hidden"></div>

            {/* DESKTOP HORIZONTAL LINE */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-linear-to-r from-transparent via-gray-300 to-transparent dark:via-gray-700"></div>

            {infoCards.map((item, i) => (
              <div
                key={i}
                className="relative pl-10 md:pl-0 p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition hover:-translate-y-1 hover:shadow-xl"
              >
                {/* NODE */}
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