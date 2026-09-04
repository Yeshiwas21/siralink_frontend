import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Mail,
    RefreshCw,
    CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

import { requestEmailVerification } from "../../services/userServices";

const EmailVerificationRequired = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    const email = location.state?.email;

    const [resending, setResending] = useState(false);
    const [resent, setResent] = useState(false);

    const handleResendVerification = async () => {
        if (!email || resending) return;

        try {
            setResending(true);

            await requestEmailVerification(email);

            setResent(true);

            toast.success(
                t("email_verification_required.resendSuccess")
            );
        } catch (err) {
            const backendErrors = err?.response?.data;

            const message =
                backendErrors?.detail ||
                backendErrors?.message ||
                backendErrors?.email?.[0] ||
                t("email_verification_required.resendError");

            toast.error(message);
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-950">

            <div className="w-full max-w-md">

                {/* Main Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8">

                    {/* Email Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Mail
                                size={30}
                                className="text-blue-600 dark:text-blue-400"
                            />
                        </div>
                    </div>

                    {/* Heading */}
                    <div className="text-center">

                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {t("email_verification_required.title")}
                        </h1>

                        <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
                            {t("email_verification_required.subtitle")}
                        </p>

                    </div>

                    {/* Email Address */}
                    {email && (
                        <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">

                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                {t(
                                    "email_verification_required.emailSentTo"
                                )}
                            </p>

                            <p className="font-medium text-gray-900 dark:text-white break-all">
                                {email}
                            </p>

                        </div>
                    )}

                    {/* Instructions */}
                    <div className="mt-6 space-y-4">

                        {/* Step 1 */}
                        <div className="flex items-start gap-3">

                            <CheckCircle2
                                size={20}
                                className="text-green-500 shrink-0 mt-0.5"
                            />

                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t(
                                    "email_verification_required.step1"
                                )}
                            </p>

                        </div>

                        {/* Step 2 */}
                        <div className="flex items-start gap-3">

                            <CheckCircle2
                                size={20}
                                className="text-green-500 shrink-0 mt-0.5"
                            />

                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t(
                                    "email_verification_required.step2"
                                )}
                            </p>

                        </div>

                        {/* Step 3 */}
                        <div className="flex items-start gap-3">

                            <CheckCircle2
                                size={20}
                                className="text-green-500 shrink-0 mt-0.5"
                            />

                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t(
                                    "email_verification_required.step3"
                                )}
                            </p>

                        </div>

                    </div>

                    {/* Resend Verification Email */}
                    <div className="mt-8">

                        <button
                            type="button"
                            onClick={handleResendVerification}
                            disabled={resending || !email}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                        >

                            <RefreshCw
                                size={18}
                                className={
                                    resending
                                        ? "animate-spin"
                                        : ""
                                }
                            />

                            {resending
                                ? t(
                                    "email_verification_required.sending"
                                )
                                : resent
                                    ? t(
                                        "email_verification_required.resendAgain"
                                    )
                                    : t(
                                        "email_verification_required.resend"
                                    )}

                        </button>

                    </div>

                    {/* Go To Login */}
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="mt-4 w-full flex items-center justify-center px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition cursor-pointer"
                    >
                        {t(
                            "email_verification_required.goToLogin"
                        )}
                    </button>

                    {/* Help Text */}
                    <p className="mt-6 text-center text-xs text-gray-600 dark:text-gray-300">
                        {t(
                            "email_verification_required.spamNote"
                        )}
                    </p>

                </div>

            </div>

        </div>
    );
};

export default EmailVerificationRequired;