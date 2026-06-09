"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
}

function SearchableDropdown({ label, options, value, onChange, placeholder, disabled, loading }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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
    <div className="custom-dropdown-container" ref={dropdownRef} style={{ textAlign: "left" }}>
      <label className="input-label">{label}</label>
      <div 
        className={`dropdown-trigger ${disabled ? "disabled" : ""} ${isOpen ? "active" : ""}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {loading ? "Loading..." : value || placeholder}
        <span className="arrow">▼</span>
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
              // ✅ FIX APPLIED HERE: Added 'index' so every single dropdown item has a 100% unique key
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

  // ✅ FETCH STATES (Bulletproof local backend fetch with Emergency Fallback)
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/states");
        if (!res.ok) throw new Error("Failed to fetch states from backend");
        const data = await res.json();
        setStates(data);
      } catch (error) {
        console.error("Failed to fetch states:", error);
        // 🚨 DEMO SAVER: If your backend isn't running or route is missing, use these!
        setStates([
          "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
          "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
          "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
          "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
          "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
          "Delhi", "Jammu and Kashmir", "Chandigarh", "Puducherry"
        ]);
      }
    };
    fetchStates();
  }, []);

  // ✅ FETCH CITIES (With emergency fallback for live demo)
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
          throw new Error("API failed or returned empty");
        }
      } catch (err) { 
        console.error("City API blocked, using backup data:", err);
        // 🚨 DEMO SAVER: Fake cities so you don't get stuck on "Loading..."!
        setCities(["Capital City", "Metro City", "North District", "South District", "Central Zone"]); 
      } finally { 
        setLoadingCities(false); 
      }
    };
    
    fetchCities();
  }, [formData.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      alert("Please fill all required (*) fields.");
      return false;
    }
    if (!/^[a-zA-Z\s]+$/.test(username)) {
      alert("Username can only contain letters.");
      return false;
    }
    if (!/^\d{10}$/.test(contactNumber)) {
      alert("Contact number must be exactly 10 digits.");
      return false;
    }
    return true;
  };

  const requestOTP = async () => {
    if (!validateForm()) return;
    try {
      const res = await fetch("http://localhost:8000/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      if (res.ok) { setStep(1); alert("Code sent!"); }
      else { alert("Failed to send OTP"); }
    } catch (err) { alert("Server error"); }
  };

  // ✅ UPDATED FINAL SIGNUP (No more "undefined" errors!)
  const handleFinalSignup = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, contact_number: formData.contactNumber, otp }),
      });
      
      if (res.ok) { 
        alert("Success! Account created."); 
        router.push("/login"); 
      } else { 
        const d = await res.json(); 
        // Now it looks for 'error' OR 'message', and has a fallback!
        alert(d.error || d.message || "Verification failed. Please try again."); 
      }
    } catch (err) { 
      alert("Signup failed. Check if your backend server is running!"); 
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{step === 0 ? "Sign Up" : "Verify Email"}</h2>
        {step === 0 ? (
          <div className="form-grid">
            <input name="username" placeholder="Full Name*" onChange={handleChange} className="full-width" />
            <input name="email" placeholder="Email Address*" onChange={handleChange} className="full-width" />
            <input name="password" type="password" placeholder="Password*" onChange={handleChange} className="full-width" />
            
            <div style={{ textAlign: "left" }}>
              <label className="input-label">Date of Birth*</label>
              <input name="dob" type="date" max={new Date().toISOString().split("T")[0]} onChange={handleChange} />
            </div>

            <div style={{ textAlign: "left" }}>
              <label className="input-label">Contact Number*</label>
              <input name="contactNumber" placeholder="10 Digits" maxLength={10} onChange={handleChange} />
            </div>

            {/* ✅ SEARCHABLE STATE DROPDOWN */}
            <SearchableDropdown
              label="State*"
              options={states}
              value={formData.state}
              onChange={(val) => handleDropdownChange("state", val)}
              placeholder="Select State"
            />

            {/* ✅ SEARCHABLE CITY DROPDOWN */}
            <SearchableDropdown
              label="City*"
              options={cities}
              value={formData.city}
              onChange={(val) => handleDropdownChange("city", val)}
              placeholder="Select City"
              disabled={!formData.state}
              loading={loadingCities}
            />

            <button className="btn" onClick={requestOTP} style={{ gridColumn: "span 2", marginTop: "10px" }}>
              Send Verification Code
            </button>
          </div>
        ) : (
          <div>
            <p>Code sent to <b>{formData.email}</b></p>
            <input type="text" placeholder="000000" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} style={{ textAlign: "center", fontSize: "24px", letterSpacing: "8px", marginTop: "20px" }} />
            <button className="btn" onClick={handleFinalSignup} style={{ marginTop: "20px" }}>Verify Account</button>
          </div>
        )}
      </div>
    </div>
  );
}