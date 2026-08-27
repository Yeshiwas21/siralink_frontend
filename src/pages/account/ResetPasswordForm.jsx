import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Lock, ArrowLeft, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { setPasswordResetApi } from "../../api/userApi";

export default function ResetPasswordForm() {
    const { t } = useTranslation();
    const { uidb64, token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isValidating, setIsValidating] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // 1. Validate token with backend when component mounts
    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await fetch(
                    `http://192.168.3.25:8080/api/users/password-reset/${uidb64}/${token}/`
                );
                if (response.ok) {
                    setTokenValid(true);
                } else {
                    setErrorMessage(t("reset_password.errInvalidLink"));
                }
            } catch {
                setErrorMessage(t("reset_password.errNetwork"));
            } finally {
                setIsValidating(false);
            }
        };

        verifyToken();
    }, [uidb64, token, t]);

    // 2. Handle new password form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        if (password.length < 6) {
            setErrorMessage(t("reset_password.errMinLength"));
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage(t("reset_password.errMismatch"));
            return;
        }

        setIsLoading(true);

        try {
            await setPasswordResetApi({ password, token, uidb64 });
            setIsSuccess(true);
            setTimeout(() => navigate("/login"), 2500);
        } catch (error) {
            const apiError =
                error?.response?.data?.detail ||
                error?.response?.data?.error ||
                t("reset_password.errDefault");
            setErrorMessage(apiError);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
                {/* BRAND ICON */}
                <div className="mx-auto w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-900 dark:text-white shadow-xs mb-4">
                    <ShieldCheck className="w-6 h-6" />
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {t("reset_password.title")}
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
                    {t("reset_password.subtitle")}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
                <div className="bg-white dark:bg-gray-950 py-8 px-6 shadow-sm sm:shadow-md border border-gray-200 dark:border-gray-800 rounded-2xl">

                    {/* LOADING INITIAL TOKEN VERIFICATION */}
                    {isValidating ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-3">
                            <Loader2 className="w-8 h-8 text-gray-900 dark:text-white animate-spin" />
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {t("reset_password.verifying")}
                            </p>
                        </div>
                    ) : !tokenValid ? (

                        /* INVALID/EXPIRED LINK STATE */
                        <div className="text-center space-y-4">
                            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-100 dark:border-red-800/50">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {t("reset_password.invalidTitle")}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {errorMessage}
                            </p>
                            <a
                                href="/forgot-password"
                                className="w-full inline-flex justify-center items-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-colors"
                            >
                                {t("reset_password.requestNewLink")}
                            </a>
                        </div>
                    ) : isSuccess ? (

                        /* SUCCESS STATE */
                        <div className="text-center space-y-4">
                            <div className="mx-auto w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center border border-green-100 dark:border-green-800/50">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {t("reset_password.successTitle")}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t("reset_password.successSubtitle")}
                            </p>
                        </div>
                    ) : (

                        /* RESET FORM STATE */
                        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                            {errorMessage && (
                                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 flex items-start gap-3 text-red-700 dark:text-red-300 text-xs font-medium">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            {/* NEW PASSWORD FIELD */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2"
                                >
                                    {t("reset_password.newPasswordLabel")}
                                </label>
                                <div className="relative rounded-xl shadow-xs">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        id="password"
                                        type="password"
                                        required
                                        minLength={6}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            {/* CONFIRM PASSWORD FIELD */}
                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2"
                                >
                                    {t("reset_password.confirmPasswordLabel")}
                                </label>
                                <div className="relative rounded-xl shadow-xs">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            {/* SUBMIT BUTTON */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 dark:focus:ring-white disabled:opacity-60 disabled:cursor-not-allowed shadow-xs transition-colors duration-200 cursor-pointer"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {t("reset_password.submitting")}
                                    </>
                                ) : (
                                    t("reset_password.submit")
                                )}
                            </button>
                        </form>
                    )}

                    {/* FOOTER LINK */}
                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
                        <a
                            href="/login"
                            className="inline-flex items-center text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors gap-1.5"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>{t("reset_password.backToLogin")}</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}