"use client";
import { API_BASE_URL } from "@/config";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import "@/assets/styles/auth.css";

// --- CUSTOM SEARCHABLE DROPDOWN COMPONENT ---
interface DropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

function SearchableDropdown({ label, options, value, onChange, placeholder, disabled, loading, icon }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="custom-dropdown-container" ref={dropdownRef}>
      <label className="auth-label" style={{ marginBottom: "8px" }}>{label}</label>
      <div 
        className={`dropdown-trigger ${disabled ? "disabled" : ""} ${isOpen ? "active" : ""}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{ position: "relative", paddingLeft: icon ? "42px" : "16px" }}
      >
        {icon && <div className="input-icon" style={{ left: "14px", top: "50%", transform: "translateY(-50%)" }}>{icon}</div>}
        
        <span style={{ color: value ? "#0f172a" : "#94a3b8", fontWeight: value ? "600" : "500" }}>
          {loading ? "Loading..." : value || placeholder}
        </span>
        
        {/* Sleek Animated Chevron */}
        <svg className="dropdown-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          <input
            type="text"
            className="dropdown-search"
            placeholder="Search..."
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="dropdown-options">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, index) => (
                <div
                  key={`${opt}-${index}`} 
                  className={`option-item ${value === opt ? "selected" : ""}`}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  {opt}
                </div>
              ))
            ) : (
              <div className="no-options">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- MAIN SIGNUP PAGE ---
export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [otp, setOtp] = useState("");

  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    dob: "",
    contactNumber: "",
    city: "",
    state: ""
  });

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/states`);
        if (!res.ok) throw new Error("Failed to fetch states");
        const data = await res.json();
        setStates(data);
      } catch (error) {
        setStates([
          "Andhra Pradesh", "Gujarat", "Karnataka", "Kerala", "Maharashtra", 
          "Punjab", "Rajasthan", "Tamil Nadu", "Uttar Pradesh", "West Bengal", "Delhi"
        ]);
      }
    };
    fetchStates();
  }, []);

  useEffect(() => {
    if (!formData.state) { setCities([]); return; }
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const res = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: "India", state: formData.state }),
        });
        const result = await res.json();
        if (!result.error && result.data && result.data.length > 0) {
          setCities(result.data);
        } else {
          throw new Error("API failed");
        }
      } catch (err) { 
        setCities(["Capital City", "Metro City", "North District", "South District"]); 
      } finally { 
        setLoadingCities(false); 
      }
    };
    fetchCities();
  }, [formData.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // ✅ Real-time Mobile Number Validation (Blocks letters instantly)
    if (name === "contactNumber") {
      // Replace anything that is NOT a number with an empty string
      const onlyNumbers = value.replace(/[^0-9]/g, '');
      setFormData({ ...formData, [name]: onlyNumbers });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleDropdownChange = (name: string, value: string) => {
    if (name === "state") {
      setFormData({ ...formData, state: value, city: "" });
    } else {
      setFormData({ ...formData, city: value });
    }
  };

  const validateForm = () => {
    const { username, email, password, dob, contactNumber, state, city } = formData;
    if (!username || !email || !password || !contactNumber || !dob || !state || !city) {
      toast.error("Please fill all required fields.");
      return false;
    }
    
    // ✅ Upgraded Validation: Must be 10 digits AND start with 6, 7, 8, or 9
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(contactNumber)) {
      toast.error("Please enter a valid 10-digit Indian mobile number.");
      return false;
    }
    
    return true;
  };

  const requestOTP = async () => {
    if (!validateForm()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      if (res.ok) { 
        setStep(1); 
        toast.success("Verification Code sent!"); 
      } else { 
        toast.error("Failed to send OTP"); 
      }
    } catch (err) { 
      toast.error("Server error"); 
    }
  };

  const handleFinalSignup = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, contact_number: formData.contactNumber, otp }),
      });
      if (res.ok) { 
        toast.success("Success! Account created."); 
        setTimeout(() => router.push("/login"), 1500); 
      } else { 
        const d = await res.json(); 
        toast.error(d.error || d.message || "Verification failed."); 
      }
    } catch (err) { 
      toast.error("Signup failed. Check server."); 
    }
  };

  return (
    <div className="auth-container">
      <Toaster position="top-center" />
      
      <div className="auth-glass-card" style={{ maxWidth: "680px", padding: "40px 50px" }}>
        
        <div className="auth-header" style={{ marginBottom: "25px" }}>
          {step === 0 && <span className="step-badge">Step 1 of 2</span>}
          {step === 1 && <span className="step-badge">Step 2 of 2</span>}
          <h2 className="auth-title">{step === 0 ? "Create Account" : "Verify Email"}</h2>
          <p className="auth-subtitle">
            {step === 0 ? "Join TripManager for exclusive curated stays." : `Enter the 6-digit code sent to ${formData.email}`}
          </p>
        </div>

        {step === 0 ? (
          <div className="auth-grid" style={{ gap: "20px 15px" }}>
            
            {/* Name */}
            <div className="auth-form-group auth-full-width" style={{ marginBottom: 0 }}>
              <label className="auth-label" style={{ marginBottom: "8px" }}>Full Name*</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <input name="username" value={formData.username} placeholder="John Doe" onChange={handleChange} className="auth-input with-icon" />
              </div>
            </div>
            
            {/* Email */}
            <div className="auth-form-group auth-full-width" style={{ marginBottom: 0 }}>
              <label className="auth-label" style={{ marginBottom: "8px" }}>Email Address*</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <input name="email" value={formData.email} type="email" placeholder="you@example.com" onChange={handleChange} className="auth-input with-icon" />
              </div>
            </div>

            {/* Password */}
            <div className="auth-form-group auth-full-width" style={{ marginBottom: 0 }}>
              <label className="auth-label" style={{ marginBottom: "8px" }}>Password*</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <input name="password" value={formData.password} type="password" placeholder="••••••••" onChange={handleChange} className="auth-input with-icon" />
              </div>
            </div>
            
            {/* DOB */}
            <div className="auth-form-group" style={{ marginBottom: 0 }}>
              <label className="auth-label" style={{ marginBottom: "8px" }}>Date of Birth*</label>
              <div className="input-wrapper">
                <input name="dob" value={formData.dob} type="date" max={new Date().toISOString().split("T")[0]} onChange={handleChange} className="auth-input" style={{ paddingLeft: "16px", color: formData.dob ? "#0f172a" : "#94a3b8" }} />
              </div>
            </div>

            {/* Phone */}
            <div className="auth-form-group" style={{ marginBottom: 0 }}>
              <label className="auth-label" style={{ marginBottom: "8px" }}>Contact Number*</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                <input name="contactNumber" value={formData.contactNumber} placeholder="10 Digits" maxLength={10} onChange={handleChange} className="auth-input with-icon" />
              </div>
            </div>

            {/* State */}
            <div className="auth-form-group" style={{ marginBottom: 0 }}>
              <SearchableDropdown
                label="State*"
                options={states}
                value={formData.state}
                onChange={(val) => handleDropdownChange("state", val)}
                placeholder="Select State"
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>}
              />
            </div>

            {/* City */}
            <div className="auth-form-group" style={{ marginBottom: 0 }}>
              <SearchableDropdown
                label="City*"
                options={cities}
                value={formData.city}
                onChange={(val) => handleDropdownChange("city", val)}
                placeholder="Select City"
                disabled={!formData.state}
                loading={loadingCities}
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>}
              />
            </div>

            <div className="auth-full-width">
              <button className="auth-btn-primary" onClick={requestOTP} style={{ marginTop: "15px" }}>
                Send Verification Code
              </button>
            </div>
            
            <p className="auth-footer-text auth-full-width" style={{ marginTop: "20px" }}>
              Already have an account? 
              <Link href="/login" className="auth-footer-link">Sign In</Link>
            </p>
          </div>
        ) : (
          <div>
            <input 
              type="text" 
              placeholder="000000" 
              maxLength={6} 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              className="auth-otp-input"
            />
            <button className="auth-btn-primary" onClick={handleFinalSignup}>
              Verify Account
            </button>
            <p className="auth-footer-text" style={{ cursor: "pointer", color: "#64748b", fontWeight: "600" }} onClick={() => setStep(0)}>
              ← Back to edit details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}