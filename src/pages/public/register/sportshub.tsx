import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { urls } from "@/routes";

const SportsHubRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      // TODO: Replace with real API endpoint
      console.log("Register SportsHub", payload);
      navigate(urls.sportshubDashboard);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-fixed bg-cover bg-center relative bg-[url('/bglogin.webp')]">
      <div className="absolute inset-0 bg-black/50" aria-hidden />
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="relative rounded-2xl bg-white/95 backdrop-blur shadow-xl p-6 sm:p-8">
            <div className="mb-6 text-center flex items-center flex-col">
              <img src="/logo.png" className="w-28" alt="Logo" />
              <h1 className="text-2xl font-semibold text-gray-900">Register your Sports Hub</h1>
              <p className="text-sm text-gray-600">Tell us about your venue</p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-800">Sports Hub Name</label>
                <input name="sportsHubName" required className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF7A29]/30" placeholder="e.g., Downtown Sports Center" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800">Email</label>
                <input name="email" type="email" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF7A29]/30" placeholder="you@hub.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800">Hub Contact No</label>
                <input name="hubContactNo" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF7A29]/30" placeholder="+1 555 123 4567" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800">Latitude</label>
                <input name="lat" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF7A29]/30" placeholder="14.5995" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800">Longitude</label>
                <input name="lng" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF7A29]/30" placeholder="120.9842" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-800">Full Location</label>
                <input name="fullLoc" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF7A29]/30" placeholder="Street, City, Country" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800">Owner Name</label>
                <input name="ownerName" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF7A29]/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800">Owner Contact</label>
                <input name="ownerContact" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF7A29]/30" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-800">Social Media</label>
                <input name="socialMedia" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF7A29]/30" placeholder="@yourhub or link" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800">Business Reg. No</label>
                <input name="businessRegNo" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF7A29]/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800">Business Reg. Copy</label>
                <input name="businessRegCopy" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF7A29]/30" placeholder="Link or reference" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800">Mayor's Permit No</label>
                <input name="mayorsPermitNo" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF7A29]/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800">Mayor's Permit Copy</label>
                <input name="mayorsPermitCopy" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF7A29]/30" placeholder="Link or reference" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800">BIR 2303 No</label>
                <input name="bir2303No" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF7A29]/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800">BIR 2303 Copy</label>
                <input name="bir2303Copy" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF7A29]/30" placeholder="Link or reference" />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-gradient-to-r from-[#FF7A29] to-[#E63900] py-2.5 text-white font-medium shadow hover:opacity-95 transition disabled:opacity-70"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account? <a href={urls.login} className="text-[#FF5C00] hover:underline">Sign in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SportsHubRegisterPage;
