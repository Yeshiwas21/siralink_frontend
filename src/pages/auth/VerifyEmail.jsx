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
    const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await verifyEmailApi({
                    uidb64,
                    token,
                });

                /*
                 * Newly verified account
                 *
                 * Expected backend response:
                 * {
                 *     "detail": "Email verified successfully.",
                 *     "already_verified": false
                 * }
                 */

                if (response?.already_verified === true) {
                    setIsAlreadyVerified(true);
                } else {
                    setIsSuccess(true);
                }

                // Redirect to login after 2.5 seconds
                setTimeout(() => {
                    navigate("/login");
                }, 2500);

            } catch (error) {
                const responseData = error?.response?.data;

                /*
                 * Already verified
                 *
                 * This handles the case where the backend currently
                 * returns an error response such as:
                 *
                 * {
                 *     "detail": "This email has already been verified."
                 * }
                 *
                 * Instead of showing "Verification Failed",
                 * we show "Already Verified".
                 */

                const detail =
                    responseData?.detail ||
                    responseData?.error ||
                    "";

                const alreadyVerified =
                    responseData?.already_verified === true ||
                    detail.toLowerCase().includes("already been verified") ||
                    detail.toLowerCase().includes("already verified");

                if (alreadyVerified) {
                    setIsAlreadyVerified(true);

                    setTimeout(() => {
                        navigate("/login");
                    }, 2500);

                    return;
                }

                /*
                 * Actual verification failure
                 */
                setErrorMessage(
                    detail ||
                    t("email_verification.errDefault")
                );
            } finally {
                setIsVerifying(false);
            }
        };

        /*
         * Validate verification URL
         */
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

                {/* ICON */}
                <div className="mx-auto w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-900 dark:text-white shadow-xs mb-4">
                    <ShieldCheck className="w-6 h-6" />
                </div>

                {/* TITLE */}
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {t("email_verification.title")}
                </h2>

                {/* SUBTITLE */}
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
                    {t("email_verification.subtitle")}
                </p>

            </div>

            {/* CARD */}
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">

                <div className="bg-white dark:bg-gray-950 py-8 px-6 shadow-sm sm:shadow-md border border-gray-200 dark:border-gray-800 rounded-2xl">

                    {isVerifying ? (

                        <div className="flex flex-col items-center justify-center py-8 space-y-4">

                            {/* LOADING ICON */}
                            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white flex items-center justify-center border border-gray-200 dark:border-gray-700">

                                <Loader2 className="w-6 h-6 animate-spin" />

                            </div>

                            {/* TEXT */}
                            <div className="text-center">

                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {t(
                                        "email_verification.verifyingTitle"
                                    )}
                                </h3>

                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    {t(
                                        "email_verification.verifyingSubtitle"
                                    )}
                                </p>

                            </div>

                        </div>

                    ) : isSuccess ? (

                        <div className="text-center space-y-4">

                            {/* SUCCESS ICON */}
                            <div className="mx-auto w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center border border-green-100 dark:border-green-800/50">

                                <CheckCircle2 className="w-6 h-6" />

                            </div>

                            {/* STATUS */}
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {t(
                                    "email_verification.successTitle"
                                )}
                            </h3>

                            {/* DESCRIPTION */}
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t(
                                    "email_verification.successSubtitle"
                                )}
                            </p>

                            {/* REDIRECT */}
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-500">

                                <Loader2 className="w-3.5 h-3.5 animate-spin" />

                                {t(
                                    "email_verification.redirecting"
                                )}

                            </div>

                        </div>

                    ) : isAlreadyVerified ? (

                        <div className="text-center space-y-4">

                            {/* VERIFIED ICON */}
                            <div className="mx-auto w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center border border-green-100 dark:border-green-800/50">

                                <ShieldCheck className="w-6 h-6" />

                            </div>

                            {/* STATUS */}
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {t(
                                    "email_verification.alreadyVerifiedTitle"
                                )}
                            </h3>

                            {/* DESCRIPTION */}
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t(
                                    "email_verification.alreadyVerifiedSubtitle"
                                )}
                            </p>

                            {/* STATUS BADGE */}
                            <div className="flex justify-center">

                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800/50">

                                    <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400" />

                                    <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                                        {t(
                                            "email_verification.alreadyVerifiedStatus"
                                        )}
                                    </span>

                                </div>

                            </div>

                            {/* REDIRECT */}
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-500">

                                <Loader2 className="w-3.5 h-3.5 animate-spin" />

                                {t(
                                    "email_verification.redirecting"
                                )}

                            </div>

                        </div>

                    ) : (

                        <div className="text-center space-y-4">

                            {/* ERROR ICON */}
                            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-100 dark:border-red-800/50">

                                <AlertCircle className="w-6 h-6" />

                            </div>

                            {/* STATUS */}
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {t(
                                    "email_verification.invalidTitle"
                                )}
                            </h3>

                            {/* ERROR MESSAGE */}
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {errorMessage}
                            </p>

                            {/* LOGIN BUTTON */}
                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="w-full inline-flex justify-center items-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                {t(
                                    "email_verification.goToLogin"
                                )}
                            </button>

                        </div>

                    )}

                </div>
            </div>
        </div>
    );
}