import { urls } from "@/routes";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const email = (form.get("email") as string) ?? "";
    const password = (form.get("password") as string) ?? "";
    console.log({ email, password });
    navigate(urls.superadmindashboard);
  }

  function handleGoogle() {
    window.location.href = "/api/auth/google";
  }

  return (
    <div className="min-h-screen w-full bg-fixed bg-cover bg-center relative bg-[url('/bglogin.webp')]">
      <div className="absolute inset-0 bg-black/50" aria-hidden />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          <svg
            className="pointer-events-none absolute inset-0 -z-10"
            viewBox="0 0 480 640"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden
          >
            <defs>
              <linearGradient id="waveGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#FFC857" />
                <stop offset="40%" stopColor="#FF7A29" />
                <stop offset="100%" stopColor="#E63900" />
              </linearGradient>

              <filter
                id="waveGlow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="12" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <path
              d="M 10 420 C 150 260, 300 540, 470 320"
              fill="none"
              stroke="url(#waveGrad)"
              strokeWidth="24"
              strokeLinecap="round"
              opacity="0.35"
              filter="url(#waveGlow)"
            />
            <path
              d="M 10 420 C 150 260, 300 540, 470 320"
              fill="none"
              stroke="url(#waveGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.95"
            />
          </svg>

          <div className="relative rounded-2xl bg-white/90 backdrop-blur shadow-xl p-6 sm:p-8">
            <div className="mb-6 text-center flex items-center flex-col">
              <img src="/logo.png" className="w-28" alt="Logo" />
              <h1 className="text-2xl font-semibold text-gray-900">
                Welcome back
              </h1>
              <p className="text-sm text-gray-600">Sign in to continue</p>
            </div>

            <button
              onClick={handleGoogle}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 hover:bg-gray-50 transition"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 48 48"
                className="-ml-1"
                aria-hidden
              >
                <path
                  fill="#FFC107"
                  d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.2 6 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10 0 19-7.3 19-20 0-1.2-.1-2.3-.4-3.5z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.3 14.7l6.6 4.8C14.5 16.2 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.2 6 29.4 4 24 4 16 4 9.1 8.6 6.3 14.7z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.1C29.2 35.6 26.7 36 24 36c-5.2 0-9.6-3.1-11.3-7.5l-6.5 5C9 39.2 16 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.5 5.6-6.7 6.7l6.3 5.1C38 36.8 41 31.9 41 24c0-1.2-.1-2.3-.4-3.5z"
                />
              </svg>
              Continue with Google
            </button>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs uppercase tracking-wider text-gray-500">
                or
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-800"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF7A29]/30"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-800"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="text-xs text-[#FF5C00] hover:underline"
                  >
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF7A29]/30"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="remember"
                    className="h-4 w-4 rounded border-gray-300"
                    defaultChecked
                  />
                  <span>Remember me</span>
                </label>
                <a
                  href="/forgot"
                  className="text-sm text-[#FF5C00] hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gradient-to-r from-[#FF7A29] to-[#E63900] py-2.5 text-white font-medium shadow hover:opacity-95 transition disabled:opacity-70"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Don’t have an account?{" "}
              <a href="/register" className="text-[#FF5C00] hover:underline">
                Create one
              </a>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-white/80">
            By continuing you agree to our Terms & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
