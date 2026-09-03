import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    CheckCircle2,
    AlertCircle,
    Loader2,
    ShieldCheck,
} from "lucide-react";
import { verifyEmailApi } from "../../api/userApi";

export default function VerifyEmail() {
    const { t } = useTranslation();
    const { uidb64, token } = useParams();
    const navigate = useNavigate();

    const [isVerifying, setIsVerifying] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                await verifyEmailApi({
                    uidb64,
                    token,
                });

                setIsSuccess(true);

                // Redirect to login after successful verification
                setTimeout(() => {
                    navigate("/login");
                }, 2500);
            } catch (error) {
                const apiError =
                    error?.response?.data?.detail ||
                    error?.response?.data?.error ||
                    t("email_verification.errDefault");

                setErrorMessage(apiError);
            } finally {
                setIsVerifying(false);
            }
        };

        if (!uidb64 || !token) {
            setErrorMessage(
                t("email_verification.errInvalidLink")
            );
            setIsVerifying(false);
            return;
        }

        verifyEmail();
    }, [uidb64, token, navigate, t]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">

            {/* HEADER */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">

                {/* BRAND ICON */}
                <div className="mx-auto w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-900 dark:text-white shadow-xs mb-4">
                    <ShieldCheck className="w-6 h-6" />
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {t("email_verification.title")}
                </h2>

                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
                    {t("email_verification.subtitle")}
                </p>
            </div>

            {/* CARD */}
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
                <div className="bg-white dark:bg-gray-950 py-8 px-6 shadow-sm sm:shadow-md border border-gray-200 dark:border-gray-800 rounded-2xl">

                    {/* VERIFYING */}
                    {isVerifying ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">

                            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white flex items-center justify-center border border-gray-200 dark:border-gray-700">
                                <Loader2 className="w-6 h-6 animate-spin" />
                            </div>

                            <div className="text-center">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {t("email_verification.verifyingTitle")}
                                </h3>

                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    {t("email_verification.verifyingSubtitle")}
                                </p>
                            </div>
                        </div>

                    ) : isSuccess ? (

                        /* SUCCESS */
                        <div className="text-center space-y-4">

                            <div className="mx-auto w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center border border-green-100 dark:border-green-800/50">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {t("email_verification.successTitle")}
                            </h3>

                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t("email_verification.successSubtitle")}
                            </p>

                            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                {t("email_verification.redirecting")}
                            </div>
                        </div>

                    ) : (

                        /* ERROR */
                        <div className="text-center space-y-4">

                            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-100 dark:border-red-800/50">
                                <AlertCircle className="w-6 h-6" />
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {t("email_verification.invalidTitle")}
                            </h3>

                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {errorMessage}
                            </p>

                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="w-full inline-flex justify-center items-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                {t("email_verification.goToLogin")}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}