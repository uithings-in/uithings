"use client";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import type { RegisterOtpInfo, RegisterVerification } from "../api/auth";
const loginBg = "/loginimage.webp";

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

function formatCountdown(totalSeconds: number) {
  const safeSeconds = Math.max(totalSeconds, 0);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function RegisterModal() {
  const {
    requestRegisterOtp,
    verifyRegisterOtp,
    completeRegister,
    resendRegisterOtp,
    loginWithGoogle,
    setRegisterModalOpen,
    switchAuthModal,
  } = useAuth();
  const [step, setStep] = useState<"details" | "otp" | "password">("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpInfo, setOtpInfo] = useState<RegisterOtpInfo | null>(null);
  const [registration, setRegistration] =
    useState<RegisterVerification | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [expiresCountdown, setExpiresCountdown] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(
      () => setResendCountdown((value) => Math.max(value - 1, 0)),
      1000,
    );
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  useEffect(() => {
    if (expiresCountdown <= 0) return;
    const timer = setTimeout(
      () => setExpiresCountdown((value) => Math.max(value - 1, 0)),
      1000,
    );
    return () => clearTimeout(timer);
  }, [expiresCountdown]);

  async function onSubmitDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      const info = await requestRegisterOtp({ name, email });
      setOtpInfo(info);
      setStep("otp");
      setOtp("");
      setResendCountdown(info.resendAfter);
      setExpiresCountdown(info.expiresIn);
    } catch (err) {
      setError(getErrorMessage(err, "Could not send the verification code."));
    } finally {
      setSubmitting(false);
    }
  }

  async function onSubmitOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    setSubmitting(true);
    try {
      const verification = await verifyRegisterOtp({ email, otp });
      setRegistration(verification);
      setStep("password");
      setPassword("");
      setConfirmPassword("");
      setExpiresCountdown(verification.expiresIn);
      setNotice("Email verified. Create a password to finish signing up.");
    } catch (err) {
      setError(getErrorMessage(err, "Verification failed."));
    } finally {
      setSubmitting(false);
    }
  }

  async function onSubmitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!registration) {
      setError("Please verify your email again.");
      setStep("details");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await completeRegister({
        registrationToken: registration.registrationToken,
        password,
      });
      setRegisterModalOpen(false);
    } catch (err) {
      setError(getErrorMessage(err, "Could not create your account."));
    } finally {
      setSubmitting(false);
    }
  }

  async function onResend() {
    setError("");
    setNotice("");
    setResending(true);
    try {
      const info = await resendRegisterOtp(email);
      setOtpInfo(info);
      setResendCountdown(info.resendAfter);
      setExpiresCountdown(info.expiresIn);
      setOtp("");
      setNotice("A new verification code has been sent.");
    } catch (err) {
      setError(getErrorMessage(err, "Could not resend the code."));
    } finally {
      setResending(false);
    }
  }

  function goBackToDetails() {
    setStep("details");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setRegistration(null);
    setError("");
    setNotice("");
  }

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (credentialResponse.credential) {
        await loginWithGoogle(credentialResponse.credential);
        setRegisterModalOpen(false);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Google Auth failed."));
    }
  };

  // Close modal when clicking the backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setRegisterModalOpen(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-[850px] min-h-[550px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={() => setRegisterModalOpen(false)}
          className="absolute right-3 top-3 z-10 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Left Pane - Figma Layout with loginbg.png */}
        <div className="hidden md:flex w-[50%] relative border-r border-[#E5E7EB] overflow-hidden flex-col items-center justify-end text-white pb-12 pt-8">
          <img
            src={loginBg}
            alt="Background layout"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Logo at Top Left */}
          <div className="absolute top-8 left-10 z-10 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full border-[2px] border-white"></div>
            <span className="font-semibold tracking-wide text-[14px]">
              Figcomponents
            </span>
          </div>

          <div className="relative z-10 w-full max-w-[280px] px-4 self-center mt-auto">
            <div className="text-center mb-6">
              <h2 className="text-[22px] font-semibold mb-2 tracking-tight text-white">
                {step === "details"
                  ? "Get Started with Us"
                  : step === "otp"
                    ? "Almost there"
                    : "One last step"}
              </h2>
              <p className="text-gray-300 text-[12px] leading-relaxed max-w-[240px] mx-auto opacity-90">
                {step === "details"
                  ? "Complete these easy steps to register your account."
                  : step === "otp"
                    ? "Confirm your email to unlock your workspace."
                    : "Create a password to secure your account."}
              </p>
            </div>

            <div className="space-y-2.5">
              <div
                className={`flex items-center gap-3 p-3 rounded-xl font-semibold shadow-lg ${
                  step === "details"
                    ? "bg-white text-black"
                    : "bg-[#111111]/80 backdrop-blur-sm text-white border border-white/5"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    step === "details"
                      ? "bg-black text-white"
                      : "bg-[#333333] text-gray-300"
                  }`}
                >
                  1
                </div>
                <span
                  className={
                    step === "details" ? "text-[12px]" : "text-gray-400 text-[12px]"
                  }
                >
                  Your details
                </span>
              </div>
              <div
                className={`flex items-center gap-3 p-3 rounded-xl font-semibold shadow-lg ${
                  step === "otp"
                    ? "bg-white text-black"
                    : "bg-[#111111]/80 backdrop-blur-sm text-white border border-white/5"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    step === "otp"
                      ? "bg-black text-white"
                      : "bg-[#333333] text-gray-300"
                  }`}
                >
                  2
                </div>
                <span
                  className={
                    step === "otp" ? "text-[12px]" : "text-gray-400 text-[12px]"
                  }
                >
                  Verify your email
                </span>
              </div>
              <div
                className={`flex items-center gap-3 p-3 rounded-xl font-semibold shadow-lg ${
                  step === "password"
                    ? "bg-white text-black"
                    : "bg-[#111111]/80 backdrop-blur-sm text-white border border-white/5"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    step === "password"
                      ? "bg-black text-white"
                      : "bg-[#333333] text-gray-300"
                  }`}
                >
                  3
                </div>
                <span
                  className={
                    step === "password"
                      ? "text-[12px]"
                      : "text-gray-400 text-[12px]"
                  }
                >
                  Create your password
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane - Form */}
        <div className="flex-1 flex flex-col p-6 sm:p-8 bg-white">
          <div className="w-full max-w-[340px] mx-auto flex flex-col justify-center h-full">
            <div className="text-center mb-5">
              <h2 className="text-2xl font-extrabold font-syne text-[#10131A] mb-1">
                {step === "details"
                  ? "Create Account"
                  : step === "otp"
                    ? "Verify your email"
                    : "Create a password"}
              </h2>
              <p className="text-gray-500 text-[0.8rem] font-medium">
                {step === "details"
                  ? "Sign up and get 365 days free trial"
                  : step === "otp"
                    ? `Enter the 6-digit code sent to ${email}`
                    : `Set a password for ${email}`}
              </p>
            </div>

            {step === "details" ? (
              <>
                <form
                  onSubmit={onSubmitDetails}
                  className="flex flex-col gap-3 text-left"
                >
                  <div>
                    <label className="block text-[0.75rem] font-semibold text-gray-700 mb-0.5 font-syne uppercase tracking-wider">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Filmora"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                      minLength={2}
                      maxLength={80}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-gray-900 bg-gray-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] focus:border-transparent transition-all shadow-sm text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[0.75rem] font-semibold text-gray-700 mb-0.5 font-syne uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="name@yourmail.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-gray-900 bg-gray-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] focus:border-transparent transition-all shadow-sm text-sm"
                    />
                  </div>

                  {error ? (
                    <p className="text-red-500 text-xs font-medium bg-red-50 p-2 rounded">
                      {error}
                    </p>
                  ) : null}

                  <button
                    className="w-full bg-[#8A2BE2] text-white rounded-lg py-2 font-bold mt-1 shadow-sm shadow-purple-500/20 hover:bg-[#7b22cc] hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 font-syne text-sm"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? "Sending code..." : "Send Verification Code"}
                  </button>
                </form>

                <div className="flex items-center gap-3 my-4">
                  <div className="h-[1px] flex-1 bg-gray-100"></div>
                  <span className="text-gray-400 text-[0.7rem] font-medium uppercase tracking-wider">
                    Or continue with
                  </span>
                  <div className="h-[1px] flex-1 bg-gray-100"></div>
                </div>

                <div className="w-full flex justify-center items-center overflow-visible">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError("Google login failed.")}
                    shape="rectangular"
                    theme="outline"
                    size="large"
                    width="340"
                    text="signup_with"
                  />
                </div>

                <p className="text-center text-gray-500 text-[0.8rem] mt-5 pb-2">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchAuthModal("login")}
                    className="text-[#8A2BE2] hover:text-[#7b22cc] font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
                  >
                    Sign in
                  </button>
                </p>
              </>
            ) : step === "otp" ? (
              <form
                onSubmit={onSubmitOtp}
                className="flex flex-col gap-3 text-left"
              >
                <div>
                  <label className="block text-[0.75rem] font-semibold text-gray-700 mb-0.5 font-syne uppercase tracking-wider">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    value={otp}
                    onChange={(event) =>
                      setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    maxLength={6}
                    required
                    autoFocus
                    className="w-full px-3 py-3 rounded-lg border border-gray-200 text-gray-900 bg-gray-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] focus:border-transparent transition-all shadow-sm text-center text-xl font-bold tracking-[0.5em]"
                  />
                  <p className="text-gray-400 text-[0.7rem] mt-1.5">
                    {expiresCountdown > 0
                      ? `Code expires in ${formatCountdown(expiresCountdown)}`
                      : "This code has expired. Request a new one."}
                  </p>
                </div>

                {notice ? (
                  <p className="text-emerald-600 text-xs font-medium bg-emerald-50 p-2 rounded">
                    {notice}
                  </p>
                ) : null}

                {error ? (
                  <p className="text-red-500 text-xs font-medium bg-red-50 p-2 rounded">
                    {error}
                  </p>
                ) : null}

                <button
                  className="w-full bg-[#8A2BE2] text-white rounded-lg py-2 font-bold mt-1 shadow-sm shadow-purple-500/20 hover:bg-[#7b22cc] hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 font-syne text-sm"
                  type="submit"
                  disabled={submitting || expiresCountdown <= 0}
                >
                  {submitting ? "Verifying..." : "Verify & Continue"}
                </button>

                <div className="flex items-center justify-between gap-2 mt-1">
                  <button
                    type="button"
                    onClick={goBackToDetails}
                    className="text-gray-500 hover:text-gray-700 text-[0.75rem] font-semibold bg-transparent border-none p-0 cursor-pointer"
                  >
                    Use a different email
                  </button>
                  <button
                    type="button"
                    onClick={onResend}
                    disabled={resending || resendCountdown > 0}
                    className="text-[#8A2BE2] hover:text-[#7b22cc] text-[0.75rem] font-bold bg-transparent border-none p-0 cursor-pointer disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {resending
                      ? "Sending..."
                      : resendCountdown > 0
                        ? `Resend in ${formatCountdown(resendCountdown)}`
                        : "Resend code"}
                  </button>
                </div>

                {otpInfo ? (
                  <p className="text-center text-gray-400 text-[0.7rem] mt-2">
                    Wrong email?{" "}
                    <button
                      type="button"
                      onClick={goBackToDetails}
                      className="text-[#8A2BE2] hover:text-[#7b22cc] font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
                    >
                      Edit your details
                    </button>
                  </p>
                ) : null}
              </form>
            ) : (
              <form
                onSubmit={onSubmitPassword}
                className="flex flex-col gap-3 text-left"
              >
                <div>
                  <label className="block text-[0.75rem] font-semibold text-gray-700 mb-0.5 font-syne uppercase tracking-wider">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={6}
                    maxLength={128}
                    autoFocus
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-gray-900 bg-gray-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] focus:border-transparent transition-all shadow-sm text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[0.75rem] font-semibold text-gray-700 mb-0.5 font-syne uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    minLength={6}
                    maxLength={128}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-gray-900 bg-gray-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] focus:border-transparent transition-all shadow-sm text-sm"
                  />
                </div>

                {notice ? (
                  <p className="text-emerald-600 text-xs font-medium bg-emerald-50 p-2 rounded">
                    {notice}
                  </p>
                ) : null}

                {error ? (
                  <p className="text-red-500 text-xs font-medium bg-red-50 p-2 rounded">
                    {error}
                  </p>
                ) : null}

                <button
                  className="w-full bg-[#8A2BE2] text-white rounded-lg py-2 font-bold mt-1 shadow-sm shadow-purple-500/20 hover:bg-[#7b22cc] hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 font-syne text-sm"
                  type="submit"
                  disabled={submitting || expiresCountdown <= 0}
                >
                  {submitting ? "Creating account..." : "Create Account"}
                </button>

                <p className="text-center text-gray-400 text-[0.7rem] mt-1">
                  {expiresCountdown > 0
                    ? `Finish within ${formatCountdown(expiresCountdown)}`
                    : "Verification expired. Please verify your email again."}
                </p>

                <button
                  type="button"
                  onClick={goBackToDetails}
                  className="text-gray-500 hover:text-gray-700 text-[0.75rem] font-semibold bg-transparent border-none p-0 cursor-pointer self-center"
                >
                  Start over
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
