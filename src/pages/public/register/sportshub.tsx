// SportsHubRegisterPage.tsx
// Responsive stepper + Leaflet map + reverse geocoding (Nominatim)

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { urls } from "@/routes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaLocationArrow, FaRegBuilding, FaArrowUp } from "react-icons/fa";
import { MdEmail, MdLocalPhone, MdMap, MdBusiness } from "react-icons/md";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { 
  registerSportsHub, 
  validateEmail,
  validatePhoneNumber,
  validatePassword,
  validateSportsHubName,
  type SportsHubRegistrationData 
} from "@/services/sportshub-registration.service";
import ResponseMessage, { type MessageType } from "@/components/ui/response-message";
import LoadingOverlay from "@/components/ui/loading-overlay";
import EnhancedInput from "@/components/ui/enhanced-input";
import StepProgress from "@/components/ui/step-progress";

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
  // Step 1 - Basic Information
  sportsHubName: string;
  email: string;
  contactNumber: string;
  password: string;
  confirmPassword: string;
  
  // Step 2 - Location & Contact
  streetAddress: string;
  city: string;
  stateProvince: string;
  zipPostalCode: string;
  primaryContactPerson: string;
  contactPhone: string;
  lat?: string;
  lng?: string;
  fullLoc: string;
  
  // Step 3 - Business & Legal
  businessLicenseNumber: string;
  taxIdNumber: string;
  operatingHours: string;
  facilityCapacity: string;
  insuranceInformation: string;
  description: string;
  
  // Additional fields
  ownerId: string;
  sportsId: string;
};

interface AddressComponents {
  streetAddress?: string;
  city?: string;
  stateProvince?: string;
  zipPostalCode?: string;
  fullAddress: string;
}

async function reverseGeocode({ lat, lng }: LatLng): Promise<AddressComponents | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const res = await fetch(url, { headers: { "Accept-Language": "en" } });
    if (!res.ok) return null;
    const data = await res.json();
    
    if (!data?.address) return null;
    
    const address = data.address;
    const fullAddress = data.display_name || '';
    
    // Extract address components
    const streetAddress = [
      address.house_number,
      address.road,
      address.suburb
    ].filter(Boolean).join(' ') || '';
    
    const city = address.city || address.town || address.village || address.municipality || '';
    const stateProvince = address.state || address.province || address.region || '';
    const zipPostalCode = address.postcode || '';
    
    return {
      streetAddress,
      city,
      stateProvince,
      zipPostalCode,
      fullAddress
    };
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
  { key: "basic", label: "Basic Info", icon: <FaRegBuilding /> },
  { key: "location", label: "Location", icon: <MdMap /> },
  { key: "business", label: "Business Info", icon: <MdBusiness /> },
  { key: "review", label: "Review", icon: "✓" },
];

const SportsHubRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [point, setPoint] = useState<LatLng | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  
  // Response message state
  const [responseMessage, setResponseMessage] = useState<{
    type: MessageType;
    title: string;
    message: string;
    details?: string;
  } | null>(null);

  const sectionClass = useMemo(
    () =>
      "rounded-xl border bg-white/90 p-3 sm:p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow max-h-[70vh] overflow-y-auto scroll-smooth",
    []
  );

  const [form, setForm] = useState<FormState>({
    // Step 1 - Basic Information
    sportsHubName: "",
    email: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
    
    // Step 2 - Location & Contact
    streetAddress: "",
    city: "",
    stateProvince: "",
    zipPostalCode: "",
    primaryContactPerson: "",
    contactPhone: "",
    lat: "",
    lng: "",
    fullLoc: "",
    
    // Step 3 - Business & Legal
    businessLicenseNumber: "",
    taxIdNumber: "",
    operatingHours: "",
    facilityCapacity: "",
    insuranceInformation: "",
    description: "",
    
    // Additional fields
    ownerId: "",
    sportsId: "",
  });

  const latRef = useRef<HTMLInputElement | null>(null);
  const lngRef = useRef<HTMLInputElement | null>(null);
  const addrRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (latRef.current) latRef.current.value = form.lat ?? "";
    if (lngRef.current) lngRef.current.value = form.lng ?? "";
    if (addrRef.current) addrRef.current.value = form.fullLoc ?? "";
  }, [form.lat, form.lng, form.fullLoc]);

  // Handle scroll to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollToTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  async function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setResponseMessage({
        type: 'error',
        title: 'Geolocation Not Available',
        message: 'Your browser does not support geolocation.',
        details: 'Please manually select your location on the map.'
      });
      return;
    }
    
    setGeoLoading(true);
    setResponseMessage(null);
    
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPoint(p);
          const addressData = await reverseGeocode(p);
          
          if (addressData) {
            setForm((f) => ({
              ...f,
              lat: String(p.lat),
              lng: String(p.lng),
              fullLoc: addressData.fullAddress,
              // Auto-fill address fields
              streetAddress: addressData.streetAddress || f.streetAddress,
              city: addressData.city || f.city,
              stateProvince: addressData.stateProvince || f.stateProvince,
              zipPostalCode: addressData.zipPostalCode || f.zipPostalCode,
            }));
            
            setResponseMessage({
              type: 'success',
              title: 'Location Found!',
              message: 'Your location has been detected and address fields have been auto-filled.',
              details: 'Please review and adjust the address information if needed.'
            });
          } else {
            setForm((f) => ({
              ...f,
              lat: String(p.lat),
              lng: String(p.lng),
            }));
            
            setResponseMessage({
              type: 'warning',
              title: 'Location Detected',
              message: 'Your coordinates have been set, but address details could not be retrieved.',
              details: 'Please manually fill in the address fields.'
            });
          }
        } catch (error) {
          console.error('Error processing location:', error);
          setResponseMessage({
            type: 'error',
            title: 'Location Error',
            message: 'There was an error processing your location.',
            details: 'Please try again or manually select your location on the map.'
          });
        } finally {
          setGeoLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Unable to access your location.';
        let errorDetails = 'Please check your browser permissions or manually select your location on the map.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied.';
            errorDetails = 'Please allow location access in your browser settings or manually select your location on the map.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            errorDetails = 'Please check your internet connection or manually select your location on the map.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            errorDetails = 'Please try again or manually select your location on the map.';
            break;
        }
        
        setResponseMessage({
          type: 'error',
          title: 'Location Access Failed',
          message: errorMessage,
          details: errorDetails
        });
        setGeoLoading(false);
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  }

  const initialCenter: LatLng = point ?? { lat: 14.5995, lng: 120.9842 };

  function validateCurrentStep(): string[] {
    const errs: string[] = [];
    const newValidationErrors: Record<string, string[]> = {};

    if (step === 0) {
      // Basic Information validation
      const nameValidation = validateSportsHubName(form.sportsHubName);
      if (!nameValidation.isValid) {
        errs.push(...nameValidation.errors);
        newValidationErrors.sportsHubName = nameValidation.errors;
      }

      if (!form.email.trim()) {
        errs.push("Email is required.");
        newValidationErrors.email = ["Email is required."];
      } else if (!validateEmail(form.email)) {
        errs.push("Please provide a valid email address.");
        newValidationErrors.email = ["Please provide a valid email address."];
      }

      if (!form.contactNumber.trim()) {
        errs.push("Contact number is required.");
        newValidationErrors.contactNumber = ["Contact number is required."];
      } else if (!validatePhoneNumber(form.contactNumber)) {
        errs.push("Please provide a valid contact number.");
        newValidationErrors.contactNumber = ["Please provide a valid contact number."];
      }

      const passwordValidation = validatePassword(form.password);
      if (!passwordValidation.isValid) {
        errs.push(...passwordValidation.errors);
        newValidationErrors.password = passwordValidation.errors;
      }

      if (form.password !== form.confirmPassword) {
        errs.push("Passwords do not match.");
        newValidationErrors.confirmPassword = ["Passwords do not match."];
      }

    } else if (step === 1) {
      // Location & Contact validation
      if (!form.lat || !form.lng) {
        errs.push("Please select a location on the map or use your location.");
        newValidationErrors.location = ["Please select a location on the map or use your location."];
      }
      if (!form.streetAddress.trim()) {
        errs.push("Street address is required.");
        newValidationErrors.streetAddress = ["Street address is required."];
      }
      if (!form.city.trim()) {
        errs.push("City is required.");
        newValidationErrors.city = ["City is required."];
      }
      if (!form.stateProvince.trim()) {
        errs.push("State/Province is required.");
        newValidationErrors.stateProvince = ["State/Province is required."];
      }
      if (!form.zipPostalCode.trim()) {
        errs.push("ZIP/Postal code is required.");
        newValidationErrors.zipPostalCode = ["ZIP/Postal code is required."];
      }
      if (!form.primaryContactPerson.trim()) {
        errs.push("Primary contact person is required.");
        newValidationErrors.primaryContactPerson = ["Primary contact person is required."];
      }
      if (!form.contactPhone.trim()) {
        errs.push("Contact phone is required.");
        newValidationErrors.contactPhone = ["Contact phone is required."];
      } else if (!validatePhoneNumber(form.contactPhone)) {
        errs.push("Please provide a valid contact phone number.");
        newValidationErrors.contactPhone = ["Please provide a valid contact phone number."];
      }

    } else if (step === 2) {
      // Business & Legal validation
      if (!form.businessLicenseNumber.trim()) {
        errs.push("Business license number is required.");
        newValidationErrors.businessLicenseNumber = ["Business license number is required."];
      }
      if (!form.taxIdNumber.trim()) {
        errs.push("Tax ID number is required.");
        newValidationErrors.taxIdNumber = ["Tax ID number is required."];
      }
      if (!form.operatingHours.trim()) {
        errs.push("Operating hours are required.");
        newValidationErrors.operatingHours = ["Operating hours are required."];
      }
      if (!form.facilityCapacity.trim()) {
        errs.push("Facility capacity is required.");
        newValidationErrors.facilityCapacity = ["Facility capacity is required."];
      } else if (isNaN(Number(form.facilityCapacity)) || Number(form.facilityCapacity) <= 0) {
        errs.push("Facility capacity must be a positive number.");
        newValidationErrors.facilityCapacity = ["Facility capacity must be a positive number."];
      }
    }

    setValidationErrors(newValidationErrors);
    return errs;
  }

  function next() {
    const errs = validateCurrentStep();
    if (errs.length) {
      setResponseMessage({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the following errors before proceeding:',
        details: errs.join('\n')
      });
      return;
    }
    setResponseMessage(null); // Clear any previous messages
    setStep((s) => Math.min(s + 1, steps.length - 1));
    // Scroll to top of form when moving to next step
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
    // Scroll to top of form when moving to previous step
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const errs = validateCurrentStep();
    if (errs.length) {
      setResponseMessage({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the following errors before submitting:',
        details: errs.join('\n')
      });
      return;
    }
    
    setLoading(true);
    setResponseMessage(null); // Clear any previous messages
    
    try {
      // Prepare data for API submission
      const registrationData: SportsHubRegistrationData = {
        // Step 1 - Basic Information
        sportsHubName: form.sportsHubName,
        email: form.email,
        contactNumber: form.contactNumber,
        password: form.password,
        
        // Step 2 - Location & Contact
        streetAddress: form.streetAddress,
        city: form.city,
        stateProvince: form.stateProvince,
        zipPostalCode: form.zipPostalCode,
        primaryContactPerson: form.primaryContactPerson,
        contactPhone: form.contactPhone,
        
        // Step 3 - Business & Legal
        businessLicenseNumber: form.businessLicenseNumber,
        taxIdNumber: form.taxIdNumber,
        operatingHours: form.operatingHours,
        facilityCapacity: Number(form.facilityCapacity),
        insuranceInformation: form.insuranceInformation,
        
        // Additional fields
        description: form.description,
        ownerId: form.ownerId || undefined,
        sportsId: form.sportsId || undefined
      };

      console.log("Submitting registration data:", registrationData);
      
      const result = await registerSportsHub(registrationData);
      
      if (result.success) {
        setResponseMessage({
          type: 'success',
          title: 'Registration Successful!',
          message: 'Your sports hub registration has been submitted successfully.',
          details: 'You will be contacted within 2-3 business days for verification and approval. Please check your email for updates.'
        });
        
        // Navigate to login after a delay to show success message
        setTimeout(() => {
          navigate(urls.login);
        }, 3000);
      } else {
        setResponseMessage({
          type: 'error',
          title: 'Registration Failed',
          message: result.message || 'Unknown error occurred',
          details: 'Please check your information and try again. If the problem persists, contact support.'
        });
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Registration failed. Please try again.";
      setResponseMessage({
        type: 'error',
        title: 'Registration Failed',
        message: errorMessage,
        details: 'Please check your internet connection and try again. If the problem persists, contact support.'
      });
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

      <div className="relative z-10 flex min-h-screen items-center justify-center p-3 sm:p-4 overflow-y-auto scroll-smooth">
        <div className="w-full max-w-[92rem] py-4"> {/* scales up to ~1472px */}
          <div className="mx-auto w-full max-w-xl sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl rounded-2xl bg-white/95 backdrop-blur-xl shadow-xl ring-1 ring-black/5 px-3 sm:px-5 md:px-8 py-4 sm:py-6 max-h-[90vh] overflow-y-auto scroll-smooth">

            <div className="mb-4 sm:mb-5 flex flex-col items-center text-center gap-2">
              <img src="/logo.png" className="w-14 h-14 sm:w-16 sm:h-16 object-contain" alt="Logo" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                Register your Sports Hub
              </h1>
              <p className="text-[11px] sm:text-xs text-gray-600">
                Step {step + 1} of {steps.length}
              </p>
            </div>

            <div className="mb-3 sm:mb-4">
              <StepProgress
                steps={steps}
                currentStep={step}
                onStepClick={(stepIndex) => {
                  // Only allow going back to previous steps
                  if (stepIndex < step) {
                    setStep(stepIndex);
                  }
                }}
              />
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

            {/* Response Message Display */}
            {responseMessage && (
              <div className="mb-4">
                <ResponseMessage
                  type={responseMessage.type}
                  title={responseMessage.title}
                  message={responseMessage.message}
                  details={responseMessage.details}
                  onClose={() => setResponseMessage(null)}
                />
              </div>
            )}

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 overflow-y-auto">
              {step === 0 && (
                <div className={sectionClass}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-lg grid place-items-center bg-gradient-to-br from-[#F2851E] to-[#D14125] text-white">
                      <FaRegBuilding size={16} />
                    </div>
                    <h2 className="text-base font-semibold">Basic Information</h2>
                  </div>

                  <div className="space-y-4">
                    <EnhancedInput
                      label="Sports Hub Name"
                      value={form.sportsHubName}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, sportsHubName: e.target.value }));
                        // Clear validation errors when user starts typing
                        if (validationErrors.sportsHubName) {
                          setValidationErrors(prev => ({ ...prev, sportsHubName: [] }));
                        }
                      }}
                      placeholder="e.g., Downtown Sports Center"
                      error={validationErrors.sportsHubName?.[0]}
                      success={form.sportsHubName.length > 0 && !validationErrors.sportsHubName}
                      helpText="This will be visible to users and must be unique."
                      required
                      icon={<FaRegBuilding size={16} />}
                    />

                    <EnhancedInput
                      label="Email Address"
                      value={form.email}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, email: e.target.value }));
                        if (validationErrors.email) {
                          setValidationErrors(prev => ({ ...prev, email: [] }));
                        }
                      }}
                      type="email"
                      inputMode="email"
                      placeholder="you@hub.com"
                      error={validationErrors.email?.[0]}
                      success={form.email.length > 0 && !validationErrors.email && validateEmail(form.email)}
                      required
                      icon={<MdEmail size={18} />}
                    />

                    <EnhancedInput
                      label="Contact Number"
                      value={form.contactNumber}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, contactNumber: e.target.value }));
                        if (validationErrors.contactNumber) {
                          setValidationErrors(prev => ({ ...prev, contactNumber: [] }));
                        }
                      }}
                      type="tel"
                      inputMode="tel"
                      placeholder="+63 912 345 6789"
                      error={validationErrors.contactNumber?.[0]}
                      success={form.contactNumber.length > 0 && !validationErrors.contactNumber && validatePhoneNumber(form.contactNumber)}
                      required
                      icon={<MdLocalPhone size={18} />}
                    />

                    <EnhancedInput
                      label="Password"
                      value={form.password}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, password: e.target.value }));
                        if (validationErrors.password) {
                          setValidationErrors(prev => ({ ...prev, password: [] }));
                        }
                      }}
                      type="password"
                      placeholder="Create a strong password"
                      error={validationErrors.password?.[0]}
                      success={form.password.length > 0 && !validationErrors.password && validatePassword(form.password).isValid}
                      showPasswordToggle
                      helpText="Password must be at least 8 characters with uppercase, lowercase, number, and special character."
                      required
                    />

                    <EnhancedInput
                      label="Confirm Password"
                      value={form.confirmPassword}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, confirmPassword: e.target.value }));
                        if (validationErrors.confirmPassword) {
                          setValidationErrors(prev => ({ ...prev, confirmPassword: [] }));
                        }
                      }}
                      type="password"
                      placeholder="Confirm your password"
                      error={validationErrors.confirmPassword?.[0]}
                      success={form.confirmPassword.length > 0 && !validationErrors.confirmPassword && form.password === form.confirmPassword}
                      showPasswordToggle
                      required
                    />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className={sectionClass}>
                  <div className="flex items-center justify-between mb-4 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg grid place-items-center bg-gradient-to-br from-[#F2851E] to-[#D14125] text-white">
                        <MdMap size={16} />
                      </div>
                      <h2 className="text-base font-semibold">Location & Contact</h2>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleUseMyLocation}
                      disabled={geoLoading}
                      className="gap-2 h-9"
                    >
                      {geoLoading ? (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-[#F2851E] rounded-full animate-spin"></div>
                      ) : (
                        <FaLocationArrow />
                      )}
                      <span className="hidden sm:inline">{geoLoading ? "Locating..." : "Use my location"}</span>
                      <span className="sm:hidden">{geoLoading ? "Locating..." : "Use GPS"}</span>
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {/* Address Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <EnhancedInput
                          label="Street Address"
                          value={form.streetAddress}
                          onChange={(e) => {
                            setForm((f) => ({ ...f, streetAddress: e.target.value }));
                            if (validationErrors.streetAddress) {
                              setValidationErrors(prev => ({ ...prev, streetAddress: [] }));
                            }
                          }}
                          placeholder="123 Main Street"
                          error={validationErrors.streetAddress?.[0]}
                          success={form.streetAddress.length > 0 && !validationErrors.streetAddress}
                          required
                        />
                      </div>

                      <EnhancedInput
                        label="City"
                        value={form.city}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, city: e.target.value }));
                          if (validationErrors.city) {
                            setValidationErrors(prev => ({ ...prev, city: [] }));
                          }
                        }}
                        placeholder="Quezon City"
                        error={validationErrors.city?.[0]}
                        success={form.city.length > 0 && !validationErrors.city}
                        required
                      />

                      <EnhancedInput
                        label="State/Province"
                        value={form.stateProvince}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, stateProvince: e.target.value }));
                          if (validationErrors.stateProvince) {
                            setValidationErrors(prev => ({ ...prev, stateProvince: [] }));
                          }
                        }}
                        placeholder="Metro Manila"
                        error={validationErrors.stateProvince?.[0]}
                        success={form.stateProvince.length > 0 && !validationErrors.stateProvince}
                        required
                      />

                      <EnhancedInput
                        label="ZIP/Postal Code"
                        value={form.zipPostalCode}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, zipPostalCode: e.target.value }));
                          if (validationErrors.zipPostalCode) {
                            setValidationErrors(prev => ({ ...prev, zipPostalCode: [] }));
                          }
                        }}
                        placeholder="1100"
                        error={validationErrors.zipPostalCode?.[0]}
                        success={form.zipPostalCode.length > 0 && !validationErrors.zipPostalCode}
                        required
                      />
                    </div>

                    {/* Contact Person */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <EnhancedInput
                        label="Primary Contact Person"
                        value={form.primaryContactPerson}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, primaryContactPerson: e.target.value }));
                          if (validationErrors.primaryContactPerson) {
                            setValidationErrors(prev => ({ ...prev, primaryContactPerson: [] }));
                          }
                        }}
                        placeholder="John Doe"
                        error={validationErrors.primaryContactPerson?.[0]}
                        success={form.primaryContactPerson.length > 0 && !validationErrors.primaryContactPerson}
                        required
                      />

                      <EnhancedInput
                        label="Contact Phone"
                        value={form.contactPhone}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, contactPhone: e.target.value }));
                          if (validationErrors.contactPhone) {
                            setValidationErrors(prev => ({ ...prev, contactPhone: [] }));
                          }
                        }}
                        type="tel"
                        inputMode="tel"
                        placeholder="+63 912 345 6789"
                        error={validationErrors.contactPhone?.[0]}
                        success={form.contactPhone.length > 0 && !validationErrors.contactPhone && validatePhoneNumber(form.contactPhone)}
                        required
                        icon={<MdLocalPhone size={18} />}
                      />
                    </div>

                    {/* Map Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">Location on Map *</label>
                      <div className="rounded-lg overflow-hidden ring-1 ring-black/10">
                        <div className="h-64 sm:h-72 md:h-80 w-full">
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
                                const addressData = await reverseGeocode(p);
                                
                                if (addressData) {
                                  setForm((f) => ({
                                    ...f,
                                    lat: String(p.lat),
                                    lng: String(p.lng),
                                    fullLoc: addressData.fullAddress,
                                    // Auto-fill address fields if they're empty
                                    streetAddress: f.streetAddress || addressData.streetAddress || '',
                                    city: f.city || addressData.city || '',
                                    stateProvince: f.stateProvince || addressData.stateProvince || '',
                                    zipPostalCode: f.zipPostalCode || addressData.zipPostalCode || '',
                                  }));
                                } else {
                                  setForm((f) => ({
                                    ...f,
                                    lat: String(p.lat),
                                    lng: String(p.lng),
                                  }));
                                }
                                
                                // Clear location validation errors
                                if (validationErrors.location) {
                                  setValidationErrors(prev => ({ ...prev, location: [] }));
                                }
                              }}
                            />
                            {point && <Marker position={[point.lat, point.lng]} />}
                          </MapContainer>
                        </div>
                      </div>
                      {validationErrors.location && (
                        <p className="text-xs text-red-600 mt-1">{validationErrors.location[0]}</p>
                      )}
                      <p className="text-xs text-gray-600 mt-2">
                        Click on the map to set your exact location. This helps customers find your sports hub easily.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className={sectionClass}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-lg grid place-items-center bg-gradient-to-br from-[#F2851E] to-[#D14125] text-white">
                      <MdBusiness size={16} />
                    </div>
                    <h2 className="text-base font-semibold">Business Information</h2>
                  </div>

                  <div className="space-y-4">
                    {/* Business Documents */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-2">Business License Number *</label>
                        <Input
                          value={form.businessLicenseNumber}
                          onChange={(e) => {
                            setForm((f) => ({ ...f, businessLicenseNumber: e.target.value }));
                            if (validationErrors.businessLicenseNumber) {
                              setValidationErrors(prev => ({ ...prev, businessLicenseNumber: [] }));
                            }
                          }}
                          placeholder="e.g., BL-2024-001234"
                          className={validationErrors.businessLicenseNumber ? "border-red-500" : ""}
                        />
                        {validationErrors.businessLicenseNumber && (
                          <p className="text-xs text-red-600 mt-1">{validationErrors.businessLicenseNumber[0]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-2">Tax ID Number *</label>
                        <Input
                          value={form.taxIdNumber}
                          onChange={(e) => {
                            setForm((f) => ({ ...f, taxIdNumber: e.target.value }));
                            if (validationErrors.taxIdNumber) {
                              setValidationErrors(prev => ({ ...prev, taxIdNumber: [] }));
                            }
                          }}
                          placeholder="e.g., 123-456-789-000"
                          className={validationErrors.taxIdNumber ? "border-red-500" : ""}
                        />
                        {validationErrors.taxIdNumber && (
                          <p className="text-xs text-red-600 mt-1">{validationErrors.taxIdNumber[0]}</p>
                        )}
                      </div>
                    </div>

                    {/* Operating Hours */}
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">Operating Hours *</label>
                      <Input
                        value={form.operatingHours}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, operatingHours: e.target.value }));
                          if (validationErrors.operatingHours) {
                            setValidationErrors(prev => ({ ...prev, operatingHours: [] }));
                          }
                        }}
                        placeholder="e.g., Monday-Friday: 6AM-10PM, Saturday-Sunday: 7AM-9PM"
                        className={validationErrors.operatingHours ? "border-red-500" : ""}
                      />
                      {validationErrors.operatingHours && (
                        <p className="text-xs text-red-600 mt-1">{validationErrors.operatingHours[0]}</p>
                      )}
                    </div>

                    {/* Facility Capacity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">Facility Capacity *</label>
                      <Input
                        value={form.facilityCapacity}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, facilityCapacity: e.target.value }));
                          if (validationErrors.facilityCapacity) {
                            setValidationErrors(prev => ({ ...prev, facilityCapacity: [] }));
                          }
                        }}
                        type="number"
                        placeholder="e.g., 50"
                        className={validationErrors.facilityCapacity ? "border-red-500" : ""}
                      />
                      {validationErrors.facilityCapacity && (
                        <p className="text-xs text-red-600 mt-1">{validationErrors.facilityCapacity[0]}</p>
                      )}
                      <p className="text-xs text-gray-600 mt-1">
                        Maximum number of people your facility can accommodate at once.
                      </p>
                    </div>

                    {/* Insurance Information */}
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">Insurance Information</label>
                      <Input
                        value={form.insuranceInformation}
                        onChange={(e) => setForm((f) => ({ ...f, insuranceInformation: e.target.value }))}
                        placeholder="e.g., Comprehensive liability insurance - Policy #INS-2024-001"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        Optional: Provide details about your liability insurance coverage.
                      </p>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">Sports Hub Description</label>
                      <textarea
                        value={form.description}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        placeholder="Describe your sports hub, facilities, and services..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2851E] focus:border-transparent resize-none"
                        rows={4}
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        Tell potential customers about your sports hub, what makes it special, and what services you offer.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className={sectionClass}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-lg grid place-items-center bg-gradient-to-br from-[#F2851E] to-[#D14125] text-white">
                      ✓
                    </div>
                    <h2 className="text-base font-semibold">Review Your Information</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="rounded-lg border p-4 bg-white/80">
                      <h3 className="font-semibold mb-3 text-[#F2851E]">Basic Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div><span className="text-gray-500">Sports Hub Name:</span> {form.sportsHubName || "—"}</div>
                        <div><span className="text-gray-500">Email:</span> {form.email || "—"}</div>
                        <div><span className="text-gray-500">Contact Number:</span> {form.contactNumber || "—"}</div>
                        <div><span className="text-gray-500">Password:</span> {form.password ? "••••••••" : "—"}</div>
                      </div>
                    </div>

                    <div className="rounded-lg border p-4 bg-white/80">
                      <h3 className="font-semibold mb-3 text-[#F2851E]">Location & Contact</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div><span className="text-gray-500">Street Address:</span> {form.streetAddress || "—"}</div>
                        <div><span className="text-gray-500">City:</span> {form.city || "—"}</div>
                        <div><span className="text-gray-500">State/Province:</span> {form.stateProvince || "—"}</div>
                        <div><span className="text-gray-500">ZIP/Postal Code:</span> {form.zipPostalCode || "—"}</div>
                        <div><span className="text-gray-500">Primary Contact:</span> {form.primaryContactPerson || "—"}</div>
                        <div><span className="text-gray-500">Contact Phone:</span> {form.contactPhone || "—"}</div>
                        <div className="sm:col-span-2"><span className="text-gray-500">Coordinates:</span> {form.lat && form.lng ? `${form.lat}, ${form.lng}` : "—"}</div>
                      </div>
                    </div>

                    <div className="rounded-lg border p-4 bg-white/80">
                      <h3 className="font-semibold mb-3 text-[#F2851E]">Business Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div><span className="text-gray-500">Business License:</span> {form.businessLicenseNumber || "—"}</div>
                        <div><span className="text-gray-500">Tax ID Number:</span> {form.taxIdNumber || "—"}</div>
                        <div className="sm:col-span-2"><span className="text-gray-500">Operating Hours:</span> {form.operatingHours || "—"}</div>
                        <div><span className="text-gray-500">Facility Capacity:</span> {form.facilityCapacity || "—"}</div>
                        <div><span className="text-gray-500">Insurance:</span> {form.insuranceInformation || "—"}</div>
                        {form.description && (
                          <div className="sm:col-span-2">
                            <span className="text-gray-500">Description:</span>
                            <p className="mt-1 text-gray-700">{form.description}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-blue-600 mt-0.5">ℹ️</div>
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">Important:</p>
                          <p>Your registration will be reviewed by our team. You will be contacted within 2-3 business days for verification and approval. Please ensure all information is accurate.</p>
                        </div>
                      </div>
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
                    <Button 
                      type="submit" 
                      disabled={loading} 
                      className="h-10 w-full sm:w-auto bg-gradient-to-r from-[#F2851E] to-[#D14125] hover:from-[#D14125] hover:to-[#F2851E] text-white"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Submitting...</span>
                        </div>
                      ) : (
                        "Submit Registration"
                      )}
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

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-[#F2851E] hover:bg-[#D14125] text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          aria-label="Scroll to top"
        >
          <FaArrowUp size={20} />
        </button>
      )}

      {/* Loading Overlay */}
      <LoadingOverlay 
        isLoading={loading} 
        message={loading ? "Submitting your registration..." : "Loading..."}
      />
    </div>
  );
};

export default SportsHubRegisterPage;
