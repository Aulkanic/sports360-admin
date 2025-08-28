import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { urls } from "@/routes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaLocationArrow, FaRegBuilding, FaUser } from "react-icons/fa";
import { MdEmail, MdLocalPhone, MdMap, MdNumbers } from "react-icons/md";

const SportsHubRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

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

  const sectionClass = useMemo(() => "rounded-xl border bg-card p-4 md:p-6", []);

  return (
    <div className="min-h-screen w-full bg-fixed bg-cover bg-center relative bg-[url('/bglogin.webp')]">
      <div className="absolute inset-0 bg-black/50" aria-hidden />
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-5xl">
          <div className="relative rounded-2xl bg-white/95 backdrop-blur shadow-xl p-4 sm:p-8">
            <div className="mb-6 text-center flex items-center flex-col gap-2">
              <img src="/logo.png" className="w-28" alt="Logo" />
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Register your Sports Hub</h1>
              <p className="text-sm text-gray-600">Tell us about your venue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className={sectionClass}>
                <div className="flex items-center gap-2 mb-3">
                  <FaRegBuilding className="text-primary" />
                  <h2 className="text-lg font-semibold">Hub Details</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-800">Sports Hub Name</label>
                    <Input name="sportsHubName" required placeholder="e.g., Downtown Sports Center" />
                    <p className="text-xs text-muted-foreground mt-1">This will be visible to users.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800">Email</label>
                    <div className="flex gap-2">
                      <span className="inline-flex items-center px-2 text-muted-foreground"><MdEmail /></span>
                      <Input name="email" type="email" placeholder="you@hub.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800">Hub Contact No</label>
                    <div className="flex gap-2">
                      <span className="inline-flex items-center px-2 text-muted-foreground"><MdLocalPhone /></span>
                      <Input name="hubContactNo" placeholder="+1 555 123 4567" />
                    </div>
                  </div>
                </div>
              </div>

              <div className={sectionClass}>
                <div className="flex items-center gap-2 mb-3">
                  <MdMap className="text-primary" />
                  <h2 className="text-lg font-semibold">Location</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-800">Latitude</label>
                    <Input name="lat" placeholder="14.5995" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800">Longitude</label>
                    <Input name="lng" placeholder="120.9842" />
                  </div>
                  <div className="sm:col-span-2 flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-800">Full Address</label>
                      <Input name="fullLoc" placeholder="Street, City, Country" />
                    </div>
                    <Button type="button" variant="outline" onClick={() => {
                      if (!navigator.geolocation) return;
                      setGeoLoading(true);
                      navigator.geolocation.getCurrentPosition((pos) => {
                        const form = document.querySelector("form") as HTMLFormElement | null;
                        if (form) {
                          const latInput = form.elements.namedItem("lat") as HTMLInputElement | null;
                          const lngInput = form.elements.namedItem("lng") as HTMLInputElement | null;
                          if (latInput) latInput.value = String(pos.coords.latitude);
                          if (lngInput) lngInput.value = String(pos.coords.longitude);
                        }
                        setGeoLoading(false);
                      }, () => setGeoLoading(false), { enableHighAccuracy: true });
                    }} disabled={geoLoading}>
                      <FaLocationArrow /> {geoLoading ? "Locating..." : "Use my location"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className={sectionClass}>
                <div className="flex items-center gap-2 mb-3">
                  <FaUser className="text-primary" />
                  <h2 className="text-lg font-semibold">Owner Info</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-800">Owner Name</label>
                    <Input name="ownerName" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800">Owner Contact</label>
                    <Input name="ownerContact" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-800">Social Media</label>
                    <Input name="socialMedia" placeholder="@yourhub or link" />
                  </div>
                </div>
              </div>

              <div className={sectionClass}>
                <div className="flex items-center gap-2 mb-3">
                  <MdNumbers className="text-primary" />
                  <h2 className="text-lg font-semibold">Business Documents</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-800">Business Reg. No</label>
                    <Input name="businessRegNo" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800">Business Reg. Copy</label>
                    <Input name="businessRegCopy" placeholder="Link or reference" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800">Mayor's Permit No</label>
                    <Input name="mayorsPermitNo" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800">Mayor's Permit Copy</label>
                    <Input name="mayorsPermitCopy" placeholder="Link or reference" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800">BIR 2303 No</label>
                    <Input name="bir2303No" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800">BIR 2303 Copy</label>
                    <Input name="bir2303Copy" placeholder="Link or reference" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? "Creating account..." : "Create account"}</Button>
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
