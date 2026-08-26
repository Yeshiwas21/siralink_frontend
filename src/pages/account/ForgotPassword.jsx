import React, { useState } from "react";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2, KeyRound } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call to Django / FastAPI backend endpoint
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // On success:
      setIsSubmitted(true);
    } catch (error) {
      setErrorMessage("Failed to send reset link. Please try again later.", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* BRAND LOGO / ICON */}
        <div className="mx-auto w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-900 dark:text-white shadow-xs mb-4">
          <KeyRound className="w-6 h-6" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Forgot password?
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
          No worries, we'll send you instructions to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-gray-950 py-8 px-6 shadow-sm sm:shadow-md border border-gray-200 dark:border-gray-800 rounded-2xl">
          {isSubmitted ? (
            /* SUCCESS STATE */
            <div className="text-center space-y-5">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center border border-green-100 dark:border-green-800/50">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Check your email
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We sent a password reset link to{" "}
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{email}</span>
                </p>
              </div>

              <div className="pt-2 space-y-3">
                <a
                  href={`mailto:${email}`}
                  className="w-full inline-flex justify-center items-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 shadow-xs transition-colors duration-200"
                >
                  Open email app
                </a>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="w-full text-xs font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
                >
                  Didn't receive the email? Click to resend
                </button>
              </div>
            </div>
          ) : (
            /* FORM STATE */
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 flex items-start gap-3 text-red-700 dark:text-red-300 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2"
                >
                  Email address
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 dark:focus:ring-white disabled:opacity-60 disabled:cursor-not-allowed shadow-xs transition-colors duration-200 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  "Reset password"
                )}
              </button>
            </form>
          )}

          {/* BACK TO LOGIN FOOTER */}
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
            <a
              href="/login"
              className="inline-flex items-center text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to log in</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}