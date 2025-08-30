// SportsHubRegisterPage.tsx
// Responsive stepper + Leaflet map + reverse geocoding (Nominatim)

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { urls } from "@/routes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaLocationArrow, FaRegBuilding, FaUser } from "react-icons/fa";
import { MdEmail, MdLocalPhone, MdMap, MdNumbers } from "react-icons/md";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

const DefaultIcon = L.icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

type LatLng = { lat: number; lng: number };

type FormState = {
  sportsHubName: string;
  email: string;
  hubContactNo: string;
  lat?: string;
  lng?: string;
  fullLoc: string;
  ownerName: string;
  ownerContact: string;
  socialMedia: string;
  businessRegNo: string;
  businessRegCopy: string;
  mayorsPermitNo: string;
  mayorsPermitCopy: string;
  bir2303No: string;
  bir2303Copy: string;
};

async function reverseGeocode({ lat, lng }: LatLng): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const res = await fetch(url, { headers: { "Accept-Language": "en" } });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.display_name ?? null;
  } catch {
    return null;
  }
}

const ClickToSetMarker: React.FC<{ onPick: (p: LatLng) => void }> = ({ onPick }) => {
  useMapEvents({
    click: (e: any) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  return null;
};

const steps = [
  { key: "hub", label: "Hub Details", icon: <FaRegBuilding /> },
  { key: "location", label: "Location", icon: <MdMap /> },
  { key: "owner", label: "Owner Info", icon: <FaUser /> },
  { key: "docs", label: "Business Docs", icon: <MdNumbers /> },
  { key: "review", label: "Review", icon: "✓" },
] as const;

const SportsHubRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [point, setPoint] = useState<LatLng | null>(null);

  const sectionClass = useMemo(
    () =>
      "rounded-xl border bg-white/90 p-3 sm:p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow",
    []
  );

  const [form, setForm] = useState<FormState>({
    sportsHubName: "",
    email: "",
    hubContactNo: "",
    lat: "",
    lng: "",
    fullLoc: "",
    ownerName: "",
    ownerContact: "",
    socialMedia: "",
    businessRegNo: "",
    businessRegCopy: "",
    mayorsPermitNo: "",
    mayorsPermitCopy: "",
    bir2303No: "",
    bir2303Copy: "",
  });

  const latRef = useRef<HTMLInputElement | null>(null);
  const lngRef = useRef<HTMLInputElement | null>(null);
  const addrRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (latRef.current) latRef.current.value = form.lat ?? "";
    if (lngRef.current) lngRef.current.value = form.lng ?? "";
    if (addrRef.current) addrRef.current.value = form.fullLoc ?? "";
  }, [form.lat, form.lng, form.fullLoc]);

  async function handleUseMyLocation() {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPoint(p);
        const rev = await reverseGeocode(p);
        setForm((f) => ({
          ...f,
          lat: String(p.lat),
          lng: String(p.lng),
          fullLoc: rev ?? f.fullLoc,
        }));
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { enableHighAccuracy: true }
    );
  }

  const initialCenter: LatLng = point ?? { lat: 14.5995, lng: 120.9842 };

  function validateCurrentStep(): string[] {
    const errs: string[] = [];
    if (step === 0) {
      if (!form.sportsHubName.trim()) errs.push("Sports Hub Name is required.");
      if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errs.push("Email looks invalid.");
    } else if (step === 1) {
      if (!form.lat || !form.lng) errs.push("Please select a location on the map or use your location.");
      if (!form.fullLoc.trim()) errs.push("Full Address is required.");
    } else if (step === 2) {
      if (!form.ownerName.trim()) errs.push("Owner Name is required.");
      if (!form.ownerContact.trim()) errs.push("Owner Contact is required.");
    }
    return errs;
  }

  function next() {
    const errs = validateCurrentStep();
    if (errs.length) {
      alert(errs.join("\n"));
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const errs = validateCurrentStep();
    if (errs.length) {
      alert(errs.join("\n"));
      return;
    }
    setLoading(true);
    try {
      console.log("Register SportsHub (stepper payload):", form);
      navigate(urls.sportshubDashboard);
    } finally {
      setLoading(false);
    }
  }

  const progress = Math.round(((step + 1) / steps.length) * 100);

  return (
    <div className="min-h-screen w-full bg-fixed bg-cover bg-center relative bg-[url('/bglogin.webp')]">
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background:
            "linear-gradient(135deg, rgba(242,133,30,0.45), rgba(209,65,37,0.45))",
        }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-[92rem]"> {/* scales up to ~1472px */}
          <div className="mx-auto w-full max-w-xl sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl rounded-2xl bg-white/95 backdrop-blur-xl shadow-xl ring-1 ring-black/5 px-3 sm:px-5 md:px-8 py-4 sm:py-6">

            <div className="mb-4 sm:mb-5 flex flex-col items-center text-center gap-2">
              <img src="/logo.png" className="w-14 h-14 sm:w-16 sm:h-16 object-contain" alt="Logo" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                Register your Sports Hub
              </h1>
              <p className="text-[11px] sm:text-xs text-gray-600">
                Step {step + 1} of {steps.length}
              </p>
            </div>

            <div className="mb-3 sm:mb-4 flex items-center gap-2 overflow-x-auto">
              {steps.map((s, i) => {
                const active = i === step;
                const done = i < step;
                return (
                  <button
                    type="button"
                    key={s.key}
                    onClick={() => setStep(i)}
                    className={[
                      "flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full border text-xs sm:text-[13px] whitespace-nowrap",
                      active
                        ? "bg-gradient-to-br from-[#F2851E] to-[#D14125] text-white border-transparent"
                        : done
                        ? "bg-white text-gray-800 border-gray-300"
                        : "bg-white text-gray-500 border-gray-200",
                    ].join(" ")}
                  >
                    <span className="grid place-items-center">{s.icon}</span>
                    <span className="font-medium">{s.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mb-4 h-1 w-full bg-gray-200 rounded-full">
              <div
                className="h-1 rounded-full"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #F2851E, #D14125)",
                }}
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {step === 0 && (
                <div className={sectionClass}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg grid place-items-center bg-gradient-to-br from-[#F2851E] to-[#D14125] text-white">
                      <FaRegBuilding size={14} />
                    </div>
                    <h2 className="text-sm sm:text-base font-semibold">Hub Details</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] sm:text-xs font-medium text-gray-800">
                        Sports Hub Name *
                      </label>
                      <Input
                        value={form.sportsHubName}
                        onChange={(e) => setForm((f) => ({ ...f, sportsHubName: e.target.value }))}
                        placeholder="e.g., Downtown Sports Center"
                      />
                      <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1">
                        This will be visible to users.
                      </p>
                    </div>

                    <div>
                      <label className="block text-[11px] sm:text-xs font-medium text-gray-800">Email</label>
                      <div className="flex items-center gap-2 rounded-lg border bg-white px-2">
                        <MdEmail className="text-gray-500" />
                        <Input
                          className="border-0 focus-visible:ring-0 focus:ring-0"
                          value={form.email}
                          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                          type="email"
                          inputMode="email"
                          placeholder="you@hub.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] sm:text-xs font-medium text-gray-800">Hub Contact No</label>
                      <div className="flex items-center gap-2 rounded-lg border bg-white px-2">
                        <MdLocalPhone className="text-gray-500" />
                        <Input
                          className="border-0 focus-visible:ring-0 focus:ring-0"
                          value={form.hubContactNo}
                          onChange={(e) => setForm((f) => ({ ...f, hubContactNo: e.target.value }))}
                          type="tel"
                          inputMode="tel"
                          placeholder="+63 912 345 6789"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className={sectionClass}>
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg grid place-items-center bg-gradient-to-br from-[#F2851E] to-[#D14125] text-white">
                        <MdMap size={16} />
                      </div>
                      <h2 className="text-sm sm:text-base font-semibold">Location</h2>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleUseMyLocation}
                      disabled={geoLoading}
                      className="gap-2 h-9"
                    >
                      <FaLocationArrow />
                      <span className="hidden sm:inline">{geoLoading ? "Locating..." : "Use my location"}</span>
                      <span className="sm:hidden">{geoLoading ? "Locating..." : "Use GPS"}</span>
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] sm:text-xs font-medium text-gray-800">Latitude *</label>
                      <Input
                        ref={latRef}
                        value={form.lat}
                        onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
                        placeholder="14.5995"
                        inputMode="decimal"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] sm:text-xs font-medium text-gray-800">Longitude *</label>
                      <Input
                        ref={lngRef}
                        value={form.lng}
                        onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
                        placeholder="120.9842"
                        inputMode="decimal"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] sm:text-xs font-medium text-gray-800">Full Address *</label>
                      <Input
                        ref={addrRef}
                        value={form.fullLoc}
                        onChange={(e) => setForm((f) => ({ ...f, fullLoc: e.target.value }))}
                        placeholder="Street, City, Country"
                      />
                      <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1">
                        Tap or click the map to drop a pin. We’ll auto-fill the address (you can edit it).
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <div className="rounded-lg overflow-hidden ring-1 ring-black/10">
                        {/* Responsive height wrapper */}
                        <div className="h-56 sm:h-64 md:h-72 lg:h-80 w-full">
                          <MapContainer
                            center={[initialCenter.lat, initialCenter.lng]}
                            zoom={point ? 16 : 12}
                            style={{ height: "100%", width: "100%" }}
                            scrollWheelZoom
                            className="[&_*]:outline-none"
                          >
                            <TileLayer
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <ClickToSetMarker
                              onPick={async (p) => {
                                setPoint(p);
                                const rev = await reverseGeocode(p);
                                setForm((f) => ({
                                  ...f,
                                  lat: String(p.lat),
                                  lng: String(p.lng),
                                  fullLoc: rev ?? f.fullLoc,
                                }));
                              }}
                            />
                            {point && <Marker position={[point.lat, point.lng]} />}
                          </MapContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className={sectionClass}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg grid place-items-center bg-gradient-to-br from-[#F2851E] to-[#D14125] text-white">
                      <FaUser size={14} />
                    </div>
                    <h2 className="text-sm sm:text-base font-semibold">Owner Info</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] sm:text-xs font-medium text-gray-800">Owner Name *</label>
                      <Input
                        value={form.ownerName}
                        onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))}
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] sm:text-xs font-medium text-gray-800">Owner Contact *</label>
                      <Input
                        value={form.ownerContact}
                        onChange={(e) => setForm((f) => ({ ...f, ownerContact: e.target.value }))}
                        placeholder="+63 ..."
                        type="tel"
                        inputMode="tel"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] sm:text-xs font-medium text-gray-800">Social Media</label>
                      <Input
                        value={form.socialMedia}
                        onChange={(e) => setForm((f) => ({ ...f, socialMedia: e.target.value }))}
                        placeholder="@yourhub or link"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className={sectionClass}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg grid place-items-center bg-gradient-to-br from-[#F2851E] to-[#D14125] text-white">
                      <MdNumbers size={16} />
                    </div>
                    <h2 className="text-sm sm:text-base font-semibold">Business Documents</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] sm:text-xs font-medium text-gray-800">Business Reg. No</label>
                      <Input
                        value={form.businessRegNo}
                        onChange={(e) => setForm((f) => ({ ...f, businessRegNo: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] sm:text-xs font-medium text-gray-800">Business Reg. Copy</label>
                      <Input
                        value={form.businessRegCopy}
                        onChange={(e) => setForm((f) => ({ ...f, businessRegCopy: e.target.value }))}
                        placeholder="Link or reference"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] sm:text-xs font-medium text-gray-800">Mayor's Permit No</label>
                      <Input
                        value={form.mayorsPermitNo}
                        onChange={(e) => setForm((f) => ({ ...f, mayorsPermitNo: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] sm:text-xs font-medium text-gray-800">Mayor's Permit Copy</label>
                      <Input
                        value={form.mayorsPermitCopy}
                        onChange={(e) => setForm((f) => ({ ...f, mayorsPermitCopy: e.target.value }))}
                        placeholder="Link or reference"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] sm:text-xs font-medium text-gray-800">BIR 2303 No</label>
                      <Input
                        value={form.bir2303No}
                        onChange={(e) => setForm((f) => ({ ...f, bir2303No: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] sm:text-xs font-medium text-gray-800">BIR 2303 Copy</label>
                      <Input
                        value={form.bir2303Copy}
                        onChange={(e) => setForm((f) => ({ ...f, bir2303Copy: e.target.value }))}
                        placeholder="Link or reference"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className={sectionClass}>
                  <h2 className="text-sm sm:text-base font-semibold mb-3">Review</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px] sm:text-sm">
                    <div className="rounded-lg border p-3 bg-white/80">
                      <h3 className="font-semibold mb-2">Hub</h3>
                      <div><span className="text-gray-500">Name:</span> {form.sportsHubName || "—"}</div>
                      <div><span className="text-gray-500">Email:</span> {form.email || "—"}</div>
                      <div><span className="text-gray-500">Contact:</span> {form.hubContactNo || "—"}</div>
                    </div>
                    <div className="rounded-lg border p-3 bg-white/80">
                      <h3 className="font-semibold mb-2">Location</h3>
                      <div><span className="text-gray-500">Lat:</span> {form.lat || "—"}</div>
                      <div><span className="text-gray-500">Lng:</span> {form.lng || "—"}</div>
                      <div className="truncate"><span className="text-gray-500">Address:</span> {form.fullLoc || "—"}</div>
                    </div>
                    <div className="rounded-lg border p-3 bg-white/80">
                      <h3 className="font-semibold mb-2">Owner</h3>
                      <div><span className="text-gray-500">Name:</span> {form.ownerName || "—"}</div>
                      <div><span className="text-gray-500">Contact:</span> {form.ownerContact || "—"}</div>
                      <div><span className="text-gray-500">Social:</span> {form.socialMedia || "—"}</div>
                    </div>
                    <div className="rounded-lg border p-3 bg-white/80">
                      <h3 className="font-semibold mb-2">Documents</h3>
                      <div><span className="text-gray-500">Reg No:</span> {form.businessRegNo || "—"}</div>
                      <div className="truncate"><span className="text-gray-500">Reg Copy:</span> {form.businessRegCopy || "—"}</div>
                      <div><span className="text-gray-500">Mayor No:</span> {form.mayorsPermitNo || "—"}</div>
                      <div className="truncate"><span className="text-gray-500">Mayor Copy:</span> {form.mayorsPermitCopy || "—"}</div>
                      <div><span className="text-gray-500">BIR 2303 No:</span> {form.bir2303No || "—"}</div>
                      <div className="truncate"><span className="text-gray-500">BIR 2303 Copy:</span> {form.bir2303Copy || "—"}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions: stack on mobile, inline on >=sm */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 sm:justify-between pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="h-10 w-full sm:w-auto"
                >
                  Cancel
                </Button>

                <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                  {step > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={back}
                      className="h-10 w-full sm:w-auto"
                    >
                      Back
                    </Button>
                  )}
                  {step < steps.length - 1 ? (
                    <Button type="button" onClick={next} className="h-10 w-full sm:w-auto">
                      Next
                    </Button>
                  ) : (
                    <Button type="submit" disabled={loading} className="h-10 w-full sm:w-auto">
                      {loading ? "Creating account..." : "Submit"}
                    </Button>
                  )}
                </div>
              </div>
            </form>

            <p className="mt-4 sm:mt-5 text-center text-xs sm:text-sm text-gray-600">
              Already have an account?{" "}
              <a href={urls.login} className="text-[#FF5C00] hover:underline">Sign in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SportsHubRegisterPage;
