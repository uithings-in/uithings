"use client";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
const loginBg = "/loginimage.webp";;

export function LoginModal() {
  const navigate = useRouter();
  const { login, loginWithGoogle, setLoginModalOpen, setRegisterModalOpen } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login({ email, password });
      setLoginModalOpen(false);
      const redirectUrl =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("redirect")
          : null;
      if (redirectUrl) {
        navigate.push(redirectUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (credentialResponse.credential) {
        await loginWithGoogle(credentialResponse.credential);
        setLoginModalOpen(false);
        const redirectUrl =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("redirect")
            : null;
        if (redirectUrl) {
          navigate.push(redirectUrl);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google Auth failed.");
    }
  };

  const handleClose = () => {
    setLoginModalOpen(false);
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("redirect")) {
      navigate.replace(window.location.pathname);
    }
  };

  // Close modal when clicking the backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-[850px] min-h-[550px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200">

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 z-10 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Left Pane - Figma Layout with loginbg.png */}
        <div className="hidden md:flex w-[50%] relative border-r border-[#E5E7EB] overflow-hidden flex-col items-center justify-end text-white pb-12 pt-8">
          <img src={loginBg} alt="Background layout" className="absolute inset-0 w-full h-full object-cover" />

          {/* Logo at Top Left */}
          <div className="absolute top-8 left-10 z-10 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full border-[2px] border-white"></div>
            <span className="font-semibold tracking-wide text-[14px]">Figcomponents</span>
          </div>

          <div className="relative z-10 w-full max-w-[280px] px-4 self-center mt-auto">
            <div className="text-center mb-6">
              <h2 className="text-[22px] font-semibold mb-2 tracking-tight text-white">Your space is waiting</h2>
              <p className="text-gray-300 text-[12px] leading-relaxed max-w-[240px] mx-auto opacity-90">
                One step away from your workspace
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-3 bg-white text-black p-3 rounded-xl font-semibold shadow-lg">
                <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">1</div>
                <span className="text-[12px]">Login to your account</span>
              </div>
              <div className="flex items-center gap-3 bg-[#111111]/80 backdrop-blur-sm text-white p-3 rounded-xl font-medium border border-white/5">
                <div className="w-5 h-5 rounded-full bg-[#333333] flex items-center justify-center text-[10px] text-gray-300 font-bold">2</div>
                <span className="text-gray-400 text-[12px]">Copy the component</span>
              </div>
              <div className="flex items-center gap-3 bg-[#111111]/80 backdrop-blur-sm text-white p-3 rounded-xl font-medium border border-white/5">
                <div className="w-5 h-5 rounded-full bg-[#333333] flex items-center justify-center text-[10px] text-gray-300 font-bold">3</div>
                <span className="text-gray-400 text-[12px]">Paste in your figma</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane - Form */}
        <div className="flex-1 flex flex-col p-6 sm:p-8 bg-white">
          <div className="w-full max-w-[340px] mx-auto flex flex-col justify-center h-full mt-4">
            <div className="text-center mb-5">
              <h2 className="text-2xl font-extrabold font-syne text-[#10131A] mb-1">Welcome Back</h2>
              <p className="text-gray-500 text-[0.8rem] font-medium">Log in to your account</p>
            </div>

            <form onSubmit={onSubmit} className="flex flex-col gap-4 text-left">
              <div>
                <label className="block text-[0.75rem] font-semibold text-gray-700 mb-0.5 font-syne uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  placeholder="name@yourmail.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-gray-900 bg-gray-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] focus:border-transparent transition-all shadow-sm text-sm"
                />
              </div>

              <div>
                <label className="block text-[0.75rem] font-semibold text-gray-700 mb-0.5 font-syne uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-gray-900 bg-gray-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] focus:border-transparent transition-all shadow-sm text-sm"
                />
              </div>

              {error ? <p className="text-red-500 text-xs font-medium bg-red-50 p-2 rounded">{error}</p> : null}

              <button
                className="w-full bg-[#8A2BE2] text-white rounded-lg py-2 font-bold mt-2 shadow-sm shadow-purple-500/20 hover:bg-[#7b22cc] hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 font-syne text-sm"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Processing..." : "Sign In"}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="h-[1px] flex-1 bg-gray-100"></div>
              <span className="text-gray-400 text-[0.7rem] font-medium uppercase tracking-wider">Or continue with</span>
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
                text="signin_with"
              />
            </div>

            <p className="text-center text-gray-500 text-[0.8rem] mt-6 pb-2">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => { setLoginModalOpen(false); setRegisterModalOpen(true); }}
                className="text-[#8A2BE2] hover:text-[#7b22cc] font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
              >
                Create one
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}




