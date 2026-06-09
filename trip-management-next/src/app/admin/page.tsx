"use client";

import { useEffect, useState } from "react";
import AdminRoute from "@/components/AdminRoute";
import toast, { Toaster } from "react-hot-toast";
import "@/assets/styles/dashboard.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  CartesianGrid
} from "recharts";

// --- Types ---
type Package = {
  id: number;
  title: string;
  price: number;
  image: string;
  departure_dates?: string[];
  duration_days?: string;
  description?: string;
  itinerary?: string[];
  is_international?: boolean;
};

type Booking = {
  id: number;
  title: string;
  image: string;
  username: string;
  email: string;
  travel_date: string;
  booking_date?: string;
  people: number;
  total_price: number;
  payment_id: string;
  transaction_id: string;
  status: string;
  id_proof_url?: string;
};

type Offer = {
  id: number;
  package_id: number;
  package_title: string;
  name: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
};

type User = {
  id: number;
  username: string;
  email: string;
  dob: string | null;
  contact_number: string | null;
  city: string | null;
};

type Complaint = {
  id: number;
  user_id: number;
  username: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
};

type AnalyticsData = {
  revenueTrend: { month: string; revenue: number }[];
  statusBreakdown: { name: string; value: number }[];
  topRevenuePackages: { name: string; revenue: number }[];
  bookingsVolume: { month: string; count: number }[];
  tripType: { name: string; value: number }[];
};

// --- Helpers ---
const calculateAge = (dob: string | null) => {
  if (!dob) return "N/A";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const safeFormatDate = (dateStr: string | undefined | null) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString("en-IN", { month: 'short', day: 'numeric', year: 'numeric' });
};

// --- Colors for Charts ---
const STATUS_COLORS: Record<string, string> = { confirmed: '#10b981', cancelled: '#ef4444', pending: '#f59e0b' };

function AdminContent() {
  // Main Data States
  const [packages, setPackages] = useState<Package[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [activeTab, setActiveTab] = useState("analytics"); 

  // Advanced Analytics State
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    revenueTrend: [],
    statusBreakdown: [],
    topRevenuePackages: [],
    bookingsVolume: [], 
    tripType: []
  });

  // ✅ NEW: Year-wise Revenue State (Feature #5)
  const [yearlyRevenue, setYearlyRevenue] = useState<{ year: string; revenue: number }[]>([]);

  // Modals
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number; type: 'package' | 'offer' | 'user' } | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionData, setActionData] = useState<{ id: number; type: 'cancel_booking' | 'resolve_complaint'; title: string; message: string; buttonText: string; buttonColor: string } | null>(null);

  // User History Modal States
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [userHistoryDetails, setUserHistoryDetails] = useState<Booking[]>([]);
  const [selectedHistoryUser, setSelectedHistoryUser] = useState("");

  // Add Package Forms
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [description, setDescription] = useState("");
  const [departureDates, setDepartureDates] = useState<string[]>([]);
  const [dateInput, setDateInput] = useState("");
  const [itinerary, setItinerary] = useState<string[]>([]);
  const [isInternational, setIsInternational] = useState(false);

  // Edit Package Forms
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editDurationDays, setEditDurationDays] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDepartureDates, setEditDepartureDates] = useState<string[]>([]);
  const [editDateInput, setEditDateInput] = useState("");
  const [editItinerary, setEditItinerary] = useState<string[]>([]);
  const [editIsInternational, setEditIsInternational] = useState(false);

  // Offer Forms
  const [selectedPkgId, setSelectedPkgId] = useState("");
  const [offerName, setOfferName] = useState("");
  const [discountPerc, setDiscountPerc] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [stats, setStats] = useState({ 
    users: 0, 
    bookings: 0, 
    bookingsTrend: 0, 
    revenue: 0, 
    revenueTrend: 0, 
    cancellationRate: 0, 
    averageBookingValue: 0, 
    pendingTickets: 0,
    capacityAlerts: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  const fetchData = async () => {
    try {
      // ✅ Added the Yearly Revenue fetch call
      const [pkgs, bks, offs, usrs, comps, stts, analyticsData, yearlyRevData] = await Promise.all([
        fetch("http://localhost:8000/api/packages").then(r => r.json()),
        fetch("http://localhost:8000/api/admin/bookings").then(r => r.json()),
        fetch("http://localhost:8000/api/offers").then(r => r.json()),
        fetch("http://localhost:8000/api/admin/users").then(r => r.json()),
        fetch("http://localhost:8000/api/admin/complaints").then(r => r.json()),
        fetch("http://localhost:8000/api/admin/stats").then(r => r.json()),
        fetch("http://localhost:8000/api/admin/advanced-analytics").then(r => r.json()),
        fetch("http://localhost:8000/api/admin/yearly-revenue").then(r => r.json()).catch(() => []) 
      ]);

      setPackages(pkgs);
      if (Array.isArray(offs)) setOffers(offs);
      if (Array.isArray(usrs)) setUsers(usrs);
      if (Array.isArray(comps)) setComplaints(comps);
      setStats(stts);
      if (Array.isArray(bks)) setBookings(bks);
      setAnalytics(analyticsData);
      
      if (Array.isArray(yearlyRevData)) {
        setYearlyRevenue(yearlyRevData.map((item: any) => ({ year: item.year, revenue: Number(item.revenue) })));
      }

    } catch (err) {
      console.error("Data fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openEdit = (pkg: Package) => {
    setSelectedPackage(pkg);
    setEditTitle(pkg.title);
    setEditPrice(pkg.price.toString());
    setEditImage(pkg.image);
    setEditDurationDays(pkg.duration_days || "");
    setEditDescription(pkg.description || "");
    setEditDepartureDates(pkg.departure_dates || []);
    setEditItinerary(pkg.itinerary || []);
    setEditIsInternational(pkg.is_international || false);
    setIsEditModalOpen(true);
  };

  const openDetails = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsDetailsModalOpen(true);
  };

  const viewUserHistory = (email: string, username: string) => {
    const history = bookings.filter(b => b.email === email);
    setUserHistoryDetails(history);
    setSelectedHistoryUser(username);
    setIsHistoryModalOpen(true);
  };

  const handleAddDay = (isEdit = false) => {
    if (isEdit) setEditItinerary([...editItinerary, ""]);
    else setItinerary([...itinerary, ""]);
  };

  const handleUpdateDay = (index: number, value: string, isEdit = false) => {
    if (isEdit) {
      const updated = [...editItinerary];
      updated[index] = value;
      setEditItinerary(updated);
    } else {
      const updated = [...itinerary];
      updated[index] = value;
      setItinerary(updated);
    }
  };

  const handleAddDate = () => {
    if (dateInput && !departureDates.includes(dateInput)) {
      setDepartureDates([...departureDates, dateInput].sort());
      setDateInput("");
    }
  };

  const handleAddEditDate = () => {
    if (editDateInput && !editDepartureDates.includes(editDateInput)) {
      setEditDepartureDates([...editDepartureDates, editDateInput].sort());
      setEditDateInput("");
    }
  };

  const handleRemoveDate = (dateToRemove: string, isEdit = false) => {
    if (isEdit) setEditDepartureDates(editDepartureDates.filter((d) => d !== dateToRemove));
    else setDepartureDates(departureDates.filter((d) => d !== dateToRemove));
  };


  const handleAddPackage = async () => {
    if (!title || !price || !image || departureDates.length === 0) return toast.error("Fill all fields and add at least one date.");
    try {
      const res = await fetch("http://localhost:8000/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          price: Number(price),
          image,
          departure_dates: departureDates,
          duration_days: durationDays,
          description: description,
          itinerary: itinerary,
          is_international: isInternational
        }),
      });
      if (res.ok) {
        toast.success("Package added!");
        fetchData();
        setTitle(""); setPrice(""); setImage(""); setDepartureDates([]);
        setDurationDays(""); setDescription(""); setItinerary([]); setIsInternational(false);
      }
    } catch (err) { toast.error("Failed to add package"); }
  };

  const handleUpdatePackage = async () => {
    if (!selectedPackage) return;
    try {
      const res = await fetch(`http://localhost:8000/api/packages/${selectedPackage.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          price: Number(editPrice),
          image: editImage,
          departure_dates: editDepartureDates,
          duration_days: editDurationDays,
          description: editDescription,
          itinerary: editItinerary,
          is_international: editIsInternational
        }),
      });
      if (res.ok) {
        toast.success("Package updated! ✨");
        fetchData();
        setIsEditModalOpen(false);
      }
    } catch (err) { toast.error("Update failed"); }
  };

  const handleAddOffer = async () => {
    if (!selectedPkgId) return toast.error("Please select a package first!");
    if (!offerName.trim()) return toast.error("Please enter an offer name.");

    const discount = Number(discountPerc);
    if (!discountPerc || discount <= 0 || discount > 50) return toast.error("Discount must be between 1% and 50%.");
    if (!startDate || !endDate) return toast.error("Please select both Start and End dates.");
    if (startDate < today) return toast.error("Start date cannot be in the past.");
    if (endDate < startDate) return toast.error("End date cannot be earlier than the start date.");

    try {
      const res = await fetch("http://localhost:8000/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package_id: Number(selectedPkgId),
          name: offerName,
          description: "Special seasonal offer",
          discount_percentage: discount,
          start_date: startDate,
          end_date: endDate
        }),
      });

      if (res.ok) {
        toast.success("Offer created successfully! 🏷️");
        fetchData();
        setOfferName(""); setDiscountPerc(""); setStartDate(""); setEndDate(""); setSelectedPkgId("");
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to create offer.");
      }
    } catch (err) {
      toast.error("Network error. Could not create offer.");
    }
  };

  const triggerDelete = (id: number, type: 'package' | 'offer' | 'user') => {
    setItemToDelete({ id, type });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      let url = "";
      if (itemToDelete.type === 'package') url = `http://localhost:8000/api/packages/${itemToDelete.id}`;
      else if (itemToDelete.type === 'offer') url = `http://localhost:8000/api/offers/${itemToDelete.id}`;
      else if (itemToDelete.type === 'user') url = `http://localhost:8000/api/admin/users/${itemToDelete.id}`;

      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        toast.success(`${itemToDelete.type === 'package' ? 'Package' : itemToDelete.type === 'offer' ? 'Offer' : 'User'} deleted!`);
        fetchData();
      } else {
        toast.error(data.error || "Deletion failed");
      }
    } catch (err) {
      toast.error("Deletion failed due to network error");
    } finally {
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const cancelBooking = (booking: Booking) => {
    const travelDate = new Date(booking.travel_date);
    const today = new Date();
    const hoursDiff = (travelDate.getTime() - today.getTime()) / (1000 * 60 * 60);

    let warningMessage = "";
    let color = "";

    if (hoursDiff >= 48) {
      warningMessage = `This trip is more than 48 hours away. The customer is eligible for a FULL REFUND of ₹${booking.total_price.toLocaleString()}.`;
      color = "#16a34a"; // Green
    } else if (hoursDiff > 0) {
      warningMessage = `⚠️ WARNING: This trip is only ${Math.round(hoursDiff)} hours away. According to policy, NO REFUND will be issued.`;
      color = "#ea580c"; // Orange
    } else {
      warningMessage = `⚠️ This trip has already started or passed. Cancellation will result in NO REFUND.`;
      color = "#ef4444"; // Red
    }

    setActionData({
      id: booking.id,
      type: 'cancel_booking',
      title: 'Cancel Booking?',
      message: warningMessage,
      buttonText: 'Confirm Cancellation',
      buttonColor: color
    });
    setIsActionModalOpen(true);
  };

  const resolveComplaint = (id: number) => {
    setActionData({
      id, type: 'resolve_complaint', title: 'Resolve Complaint?',
      message: "Mark this complaint as resolved? The user will see this updated status on their dashboard.",
      buttonText: 'Yes, Resolve It', buttonColor: '#16a34a'
    });
    setIsActionModalOpen(true);
  };

  const executeAction = async () => {
    if (!actionData) return;
    try {
      if (actionData.type === 'cancel_booking') {
        await fetch(`http://localhost:8000/api/bookings/${actionData.id}/cancel`, { method: "PUT" });
        toast.success("Booking Cancelled");
        fetchData();
      } else if (actionData.type === 'resolve_complaint') {
        await fetch(`http://localhost:8000/api/admin/complaints/${actionData.id}/resolve`, { method: "PUT" });
        toast.success("Complaint Resolved! ✅");
        fetchData();
      }
    } catch (err) {
      toast.error("Action failed");
    } finally {
      setIsActionModalOpen(false);
      setActionData(null);
    }
  };

  const downloadCSV = () => {
    if (bookings.length === 0) return toast.error("No bookings to export.");
    const headers = ["Booking ID", "Package Name", "Customer Name", "Travel Date", "Total People", "Total Paid (INR)", "Status", "Payment ID"];
    const rows = bookings.map(b => [
      b.id,
      `"${b.title}"`,
      `"${b.username}"`,
      safeFormatDate(b.travel_date),
      b.people,
      b.total_price,
      b.status.toUpperCase(),
      b.payment_id || "N/A"
    ]);
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `TripManager_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Report Downloaded! 📊");
  };

  if (loading) return <p className="loading-text">Loading Dashboard...</p>;

  return (
    <section className="admin-container">
      <Toaster position="top-center" />
      <h2 className="admin-title">Admin Dashboard ⚙️</h2>

      {/* KPI CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "25px" }}>
        
        <div style={{ background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
          <p style={{ margin: "0 0 10px 0", color: "#64748b", fontSize: "14px", fontWeight: "bold", textTransform: "uppercase" }}>💰 Net Revenue</p>
          <h2 style={{ margin: "0 0 10px 0", color: "#0f172a", fontSize: "28px" }}>₹{(stats.revenue || 0).toLocaleString()}</h2>
          <span style={{ padding: "4px 8px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", background: stats.revenueTrend >= 0 ? "#dcfce3" : "#fee2e2", color: stats.revenueTrend >= 0 ? "#166534" : "#991b1b" }}>
            {stats.revenueTrend >= 0 ? "↑" : "↓"} {Math.abs(stats.revenueTrend)}% from last month
          </span>
        </div>

        <div style={{ background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
          <p style={{ margin: "0 0 10px 0", color: "#64748b", fontSize: "14px", fontWeight: "bold", textTransform: "uppercase" }}>📦 Total Bookings</p>
          <h2 style={{ margin: "0 0 10px 0", color: "#0f172a", fontSize: "28px" }}>{stats.bookings}</h2>
          <span style={{ padding: "4px 8px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", background: stats.bookingsTrend >= 0 ? "#dcfce3" : "#fee2e2", color: stats.bookingsTrend >= 0 ? "#166534" : "#991b1b" }}>
            {stats.bookingsTrend >= 0 ? "↑" : "↓"} {Math.abs(stats.bookingsTrend)}% from last month
          </span>
        </div>

        <div style={{ background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: "0 0 5px 0", color: "#64748b", fontSize: "13px", fontWeight: "bold", textTransform: "uppercase" }}>Avg. Booking Value (ABV)</p>
            <h3 style={{ margin: 0, color: "#3b82f6", fontSize: "20px" }}>₹{(stats.averageBookingValue || 0).toLocaleString()}</h3>
          </div>
          <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #f1f5f9" }}>
            <p style={{ margin: "0 0 5px 0", color: "#64748b", fontSize: "13px", fontWeight: "bold", textTransform: "uppercase" }}>Cancellation Rate</p>
            <h3 style={{ margin: 0, color: (stats.cancellationRate || 0) > 15 ? "#ef4444" : "#10b981", fontSize: "20px" }}>{stats.cancellationRate || 0}%</h3>
          </div>
        </div>

        <div style={{ background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: "0 0 5px 0", color: "#64748b", fontSize: "13px", fontWeight: "bold", textTransform: "uppercase" }}>👥 Total Users</p>
            <h3 style={{ margin: 0, color: "#0f172a", fontSize: "20px" }}>{stats.users}</h3>
          </div>
          <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #f1f5f9" }}>
            <p style={{ margin: "0 0 5px 0", color: "#64748b", fontSize: "13px", fontWeight: "bold", textTransform: "uppercase" }}>🎧 Pending Tickets</p>
            {stats.pendingTickets > 0 ? (
              <span style={{ padding: "4px 10px", background: "#fef08a", color: "#854d0e", borderRadius: "6px", fontWeight: "bold", fontSize: "14px", display: "inline-block" }}>
                ⚠️ {stats.pendingTickets} Action Required
              </span>
            ) : (
              <span style={{ color: "#10b981", fontWeight: "bold", fontSize: "14px" }}>✅ All Caught Up</span>
            )}
          </div>
        </div>

      </div>

      <div className="admin-tabs">
        {["analytics", "packages", "bookings", "offers", "users", "complaints"].map(tab => (
          <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "analytics" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginTop: "24px" }}>
          
          {stats.capacityAlerts && stats.capacityAlerts.length > 0 && (
            <div style={{ background: "#fef2f2", borderLeft: "6px solid #ef4444", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(239, 68, 68, 0.1)", display: "flex", flexDirection: "column", gap: "10px" }}>
              <h3 style={{ margin: 0, color: "#991b1b", display: "flex", alignItems: "center", gap: "8px", fontSize: "16px" }}>
                <span style={{ animation: "pulse 2s infinite" }}>🚨</span> Critical Capacity Alerts
              </h3>
              
              <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
                {stats.capacityAlerts.map((alert: any, idx: number) => (
                  <div key={idx} style={{ background: "white", padding: "12px 16px", borderRadius: "8px", border: "1px solid #fca5a5", flex: "1 1 300px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ margin: "0 0 4px 0", fontWeight: "bold", color: "#1e293b", fontSize: "14px" }}>{alert.title}</p>
                      <p style={{ margin: 0, color: "#64748b", fontSize: "12px" }}>Departure: {safeFormatDate(alert.date)}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: "0 0 4px 0", fontWeight: "bold", color: "#ef4444", fontSize: "16px" }}>{alert.percentage}% FULL</p>
                      <p style={{ margin: 0, color: "#64748b", fontSize: "12px" }}>{alert.booked} / {alert.max} Seats</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <style>{`
            @keyframes pulse {
              0% { opacity: 1; }
              50% { opacity: 0.4; }
              100% { opacity: 1; }
            }
          `}</style>

          {/* ROW 1: MONTHLY REVENUE TREND */}
          <div style={{ background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <h3 style={{ marginBottom: "20px", color: "#0f172a", fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
              📈 Monthly Revenue Trend
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={analytics.revenueTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" tick={{fill: '#64748b', fontSize: 13}} axisLine={false} tickLine={false} dy={10} />
                <YAxis tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} stroke="#64748b" tick={{fill: '#64748b', fontSize: 13}} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value: any) => `₹${Number(value).toLocaleString()}`} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* ✅ ROW 1.5: YEARLY REVENUE (Feature #5) */}
          <div style={{ background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <h3 style={{ marginBottom: "20px", color: "#0f172a", fontSize: "18px" }}>📆 Year-wise Booking Revenue</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yearlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="year" stroke="#64748b" tick={{fill: '#0f172a', fontSize: 14, fontWeight: 'bold'}} axisLine={false} tickLine={false} dy={10} />
                <YAxis tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} stroke="#64748b" tick={{fill: '#64748b', fontSize: 13}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} formatter={(value: any) => `₹${Number(value).toLocaleString()}`} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ROW 2: 50/50 SPLIT (Volume & Top Earners) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            
            <div style={{ background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
              <h3 style={{ marginBottom: "20px", color: "#0f172a", fontSize: "16px" }}>📊 Monthly Bookings Volume</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={analytics.bookingsVolume} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} />
                  <Bar dataKey="count" fill="#38bdf8" radius={[6, 6, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
              <h3 style={{ marginBottom: "20px", color: "#0f172a", fontSize: "16px" }}>🏆 Top Revenue Packages</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={analytics.topRevenuePackages} layout="vertical" margin={{ left: 110, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} stroke="#64748b" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={130} tick={{fontSize: 11, fill: '#334155', fontWeight: 500}} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value: any) => `₹${Number(value).toLocaleString()}`} cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[0, 6, 6, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ROW 3: 50/50 SPLIT (The Donut Charts) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            
            <div style={{ background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
              <h3 style={{ marginBottom: "20px", color: "#0f172a", fontSize: "16px", textAlign: "center" }}>⚖️ Booking Status</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={analytics.statusBreakdown} innerRadius={60} outerRadius={85} paddingAngle={6} dataKey="value" stroke="none">
                    {analytics.statusBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name.toLowerCase()] || '#cbd5e1'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
              <h3 style={{ marginBottom: "20px", color: "#0f172a", fontSize: "16px", textAlign: "center" }}>🌍 Trip Demographics</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={analytics.tripType} innerRadius={60} outerRadius={85} paddingAngle={6} dataKey="value" stroke="none">
                    {analytics.tripType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === 'International' ? '#8b5cf6' : '#f43f5e'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
          </div>

        </div>
      )}

      {activeTab === "packages" && (
        <>
          <div className="admin-form" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div style={{ display: "flex", gap: "10px" }}>
              <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} style={{ flex: 1 }} />
              <input placeholder="Price" value={price} type="number" onChange={(e) => setPrice(e.target.value)} style={{ flex: 1 }} />
              <input placeholder="Image URL" value={image} onChange={(e) => setImage(e.target.value)} style={{ flex: 2 }} />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <input
                placeholder="Duration (e.g., 5 Days / 4 Nights)"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: "bold", color: "#475569" }}>
                <input type="checkbox" checked={isInternational} onChange={(e) => setIsInternational(e.target.checked)} style={{ width: "20px", height: "20px" }} />
                International Trip (Requires Passport)
              </label>
            </div>
            <textarea
              placeholder="Trip Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", minHeight: "80px", resize: "vertical" }}
            />

            <div style={{ marginTop: "20px", padding: "15px", background: "#f1f5f9", borderRadius: "12px" }}>
              <h4 style={{ marginBottom: "10px" }}>Day-wise Itinerary</h4>
              {itinerary.map((dayText, index) => (
                <div key={index} style={{ marginBottom: "10px", display: "flex", gap: "10px" }}>
                  <span style={{ fontWeight: "bold", minWidth: "60px" }}>Day {index + 1}:</span>
                  <textarea
                    placeholder={`What happens on Day ${index + 1}?`}
                    value={dayText}
                    onChange={(e) => handleUpdateDay(index, e.target.value, false)}
                    style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              ))}
              <button type="button" onClick={() => handleAddDay(false)} style={{ padding: "8px 15px", background: "#334155", color: "white", borderRadius: "6px", border: "none", cursor: "pointer" }}>
                + Add Another Day
              </button>
            </div>

            <div style={{ border: "1px dashed #cbd5e1", padding: "15px", borderRadius: "10px", background: "#f8fafc" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "#475569" }}>Available Departure Dates</label>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
                <input type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                <button type="button" onClick={handleAddDate} style={{ padding: "8px 16px", background: "#3b82f6", color: "white", borderRadius: "6px", border: "none", fontWeight: "bold", cursor: "pointer" }}>+ Add Date</button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {departureDates.map(d => (
                  <span key={d} style={{ background: "#e0e7ff", color: "#4f46e5", padding: "6px 12px", borderRadius: "16px", fontSize: "13px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
                    {safeFormatDate(d)}
                    <span onClick={() => handleRemoveDate(d, false)} style={{ cursor: "pointer", color: "#ef4444" }}>×</span>
                  </span>
                ))}
              </div>
            </div>
            <button onClick={handleAddPackage} style={{ padding: "12px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Add New Package</button>
          </div>

          <div className="dashboard-grid">
            {packages.map((p) => (
              <div key={p.id} className="dashboard-card" onClick={() => openDetails(p)}>
                <img src={p.image} alt={p.title} />
                <div className="card-content">
                  <h3>{p.title} {p.is_international && "🛂"}</h3>
                  <p>₹{p.price}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '12px' }}>
                    <button onClick={(e) => { e.stopPropagation(); setIsDetailsModalOpen(true); setSelectedPackage(p); }} style={{ padding: '8px', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px' }}>View</button>
                    <button onClick={(e) => { e.stopPropagation(); openEdit(p); }} style={{ padding: '8px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px' }}>Edit</button>
                    <button className="admin-delete-btn" onClick={(e) => { e.stopPropagation(); setItemToDelete({ id: p.id, type: 'package' }); setIsDeleteModalOpen(true); }} style={{ padding: '8px', fontSize: '12px' }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedPackage && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-box" style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>Edit Package</h3>
            <input style={{ width: '100%', padding: '10px', margin: '10px 0', borderRadius: "6px", border: "1px solid #cbd5e1" }} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            <input style={{ width: '100%', padding: '10px', margin: '10px 0', borderRadius: "6px", border: "1px solid #cbd5e1" }} type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
            <input style={{ width: '100%', padding: '10px', margin: '10px 0', borderRadius: "6px", border: "1px solid #cbd5e1" }} value={editImage} onChange={(e) => setEditImage(e.target.value)} />

            <input
              placeholder="Duration (e.g., 5 Days / 4 Nights)"
              value={editDurationDays}
              onChange={(e) => setEditDurationDays(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", marginBottom: "10px" }}
            />

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: "bold", color: "#475569", marginBottom: "10px" }}>
              <input type="checkbox" checked={editIsInternational} onChange={(e) => setEditIsInternational(e.target.checked)} style={{ width: "20px", height: "20px" }} />
              International Trip (Requires Passport)
            </label>

            <textarea
              placeholder="Trip Description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", minHeight: "80px", marginBottom: "10px", resize: "vertical" }}
            />

            <div style={{ marginTop: "20px", padding: "15px", background: "#f1f5f9", borderRadius: "12px", marginBottom: "15px" }}>
              <h4 style={{ marginBottom: "10px" }}>Day-wise Itinerary</h4>
              {editItinerary.map((dayText, index) => (
                <div key={index} style={{ marginBottom: "10px", display: "flex", gap: "10px" }}>
                  <span style={{ fontWeight: "bold", minWidth: "60px" }}>Day {index + 1}:</span>
                  <textarea
                    placeholder={`What happens on Day ${index + 1}?`}
                    value={dayText}
                    onChange={(e) => handleUpdateDay(index, e.target.value, true)}
                    style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              ))}
              <button type="button" onClick={() => handleAddDay(true)} style={{ padding: "8px 15px", background: "#334155", color: "white", borderRadius: "6px", border: "none", cursor: "pointer" }}>
                + Add Another Day
              </button>
            </div>

            <div style={{ border: "1px dashed #cbd5e1", padding: "15px", borderRadius: "10px", background: "#f8fafc", marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "#475569" }}>Manage Departure Dates</label>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
                <input type="date" value={editDateInput} onChange={(e) => setEditDateInput(e.target.value)} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                <button type="button" onClick={handleAddEditDate} style={{ padding: "8px 16px", background: "#3b82f6", color: "white", borderRadius: "6px", border: "none", fontWeight: "bold", cursor: "pointer" }}>+ Add Date</button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {editDepartureDates.map(d => (
                  <span key={d} style={{ background: "#e0e7ff", color: "#4f46e5", padding: "6px 12px", borderRadius: "16px", fontSize: "13px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
                    {safeFormatDate(d)}
                    <span onClick={() => handleRemoveDate(d, true)} style={{ cursor: "pointer", color: "#ef4444" }}>×</span>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleUpdatePackage} style={{ flex: 1, padding: '10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: "pointer" }}>Update</button>
              <button onClick={() => setIsEditModalOpen(false)} style={{ flex: 1, padding: '10px', background: '#64748b', color: 'white', border: 'none', borderRadius: '5px', fontWeight: "bold", cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Package Details Modal (View) */}
      {isDetailsModalOpen && selectedPackage && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={() => setIsDetailsModalOpen(false)}>
          <div className="modal-box" style={{ background: 'white', borderRadius: '12px', width: '450px', maxHeight: "90vh", overflowY: "auto", boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <img src={selectedPackage.image} alt={selectedPackage.title} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />

            <div style={{ padding: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h2 style={{ fontSize: '24px', color: '#1e293b', margin: 0 }}>{selectedPackage.title} {selectedPackage.is_international && "🛂"}</h2>
                <span style={{ fontSize: '12px', background: '#f1f5f9', color: '#64748b', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                  ID: #{selectedPackage.id}
                </span>
              </div>
              <h3 style={{ color: '#16a34a', fontSize: '20px', margin: 0 }}>₹{selectedPackage.price}</h3>

              <hr style={{ margin: '15px 0', borderColor: '#e2e8f0' }} />

              <p style={{ marginTop: '10px', fontWeight: 'bold', color: '#334155' }}>Package Highlights (Customer View):</p>
              <ul style={{ paddingLeft: '20px', color: '#64748b', fontSize: '14px', marginTop: '8px', lineHeight: '1.6' }}>
                <li>Premium Hotel Accommodations</li>
                <li>Daily Breakfast & Dinner</li>
                <li>Guided Sightseeing Tours</li>
                <li>Airport/Station Transfers</li>
              </ul>

              <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                <button onClick={() => { setIsDetailsModalOpen(false); openEdit(selectedPackage); }} style={{ flex: 1, padding: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Edit Package
                </button>
                <button onClick={() => setIsDetailsModalOpen(false)} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
          <div className="modal-box" style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '350px', textAlign: 'center' }}>
            <span style={{ fontSize: '40px' }}>⚠️</span>
            <h3 style={{ margin: '15px 0' }}>Are you sure?</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
              This {itemToDelete?.type} will be permanently removed. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={confirmDelete} style={{ flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Yes, Delete</button>
              <button onClick={() => setIsDeleteModalOpen(false)} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {isActionModalOpen && actionData && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
          <div className="modal-box" style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '350px', textAlign: 'center' }}>
            <span style={{ fontSize: '40px' }}>{actionData.type === 'resolve_complaint' ? '✅' : '⚠️'}</span>
            <h3 style={{ margin: '15px 0' }}>{actionData.title}</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>{actionData.message}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={executeAction} style={{ flex: 1, padding: '12px', background: actionData.buttonColor, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>{actionData.buttonText}</button>
              <button onClick={() => setIsActionModalOpen(false)} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* User Trip History Modal */}
      {isHistoryModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }} onClick={() => setIsHistoryModalOpen(false)}>
          <div className="modal-box" style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '600px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "22px" }}>Trip History: <span style={{ color: "#3b82f6" }}>{selectedHistoryUser}</span></h3>
              <button onClick={() => setIsHistoryModalOpen(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>

            {userHistoryDetails.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", background: "#f8fafc", borderRadius: "12px", color: "#64748b" }}>
                This user has not booked any trips yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {userHistoryDetails.map(trip => (
                  <div key={trip.id} style={{ display: "flex", gap: "15px", padding: "15px", border: "1px solid #e2e8f0", borderRadius: "12px", alignItems: "center" }}>
                    <img src={trip.image} alt={trip.title} style={{ width: "80px", height: "60px", borderRadius: "8px", objectFit: "cover", filter: trip.status === "cancelled" ? "grayscale(100%)" : "none" }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: "0 0 5px 0", fontSize: "16px", color: "#0f172a" }}>{trip.title}</h4>
                      <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>Travel Date: {safeFormatDate(trip.travel_date)}</p>
                      <p style={{ margin: "5px 0 0 0", fontSize: "14px", fontWeight: "bold", color: "#16a34a" }}>Paid: ₹{trip.total_price}</p>
                    </div>
                    <span style={{ padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", background: trip.status === 'confirmed' ? "#dcfce3" : "#fee2e2", color: trip.status === 'confirmed' ? "#166534" : "#991b1b" }}>
                      {trip.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "bookings" && (
        <div className="chart-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Customer Bookings</h3>
            <button onClick={downloadCSV} style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>📊 Export CSV Report</button>
          </div>

          <table className="admin-table">
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#64748b" }}>
                <th style={{ padding: "15px" }}>Package</th>
                <th style={{ padding: "15px" }}>User</th>
                <th style={{ padding: "15px" }}>Date</th>
                <th style={{ padding: "15px" }}>ID Proof</th>
                <th style={{ padding: "15px" }}>Amount</th>
                <th style={{ padding: "15px" }}>Status</th>
                <th style={{ padding: "15px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const proofUrl = b.id_proof_url || (b as any).id_proof;
                return (
                  <tr key={b.id} className="admin-table-row">
                    <td><strong>{b.title}</strong></td>
                    <td>{b.username}</td>
                    <td style={{ padding: "15px", color: "#475569" }}>{safeFormatDate(b.travel_date)}</td>
                    <td style={{ padding: "15px" }}>
                      {proofUrl ? (
                        <a
                          href={`http://localhost:8000${proofUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#2563eb", fontWeight: "bold", textDecoration: "underline", fontSize: "13px" }}
                        >
                          View Doc 📄
                        </a>
                      ) : (
                        <span style={{ color: "#94a3b8", fontSize: "12px" }}>No Doc</span>
                      )}
                    </td>
                    <td style={{ padding: "15px", color: "#16a34a", fontWeight: "bold" }}>₹{Number(b.total_price).toLocaleString()}</td>
                    <td>{b.status === "confirmed" ? "✅" : "❌"}</td>
                    <td>
                      {b.status !== "cancelled" && (
                        <button
                          onClick={() => cancelBooking(b)}
                          style={{ padding: "6px 12px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "users" && (
        <div className="chart-box">
          <h3>Registered Users 👥</h3>
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Age</th><th>Contact</th><th>City</th><th>Action</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="admin-table-row">
                  <td>#{u.id}</td>
                  <td><strong>{u.username}</strong></td>
                  <td>{u.email}</td>
                  <td style={{ fontWeight: 'bold', color: '#0369a1' }}>{calculateAge(u.dob)}</td>
                  <td>{u.contact_number || "N/A"}</td>
                  <td>{u.city || "N/A"}</td>
                  <td style={{ display: "flex", gap: "10px" }}>
                    <button onClick={() => viewUserHistory(u.email, u.username)} style={{ padding: "6px 12px", background: "#f1f5f9", color: "#3b82f6", border: "1px solid #bfdbfe", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>
                      View History
                    </button>
                    <button className="admin-delete-btn" onClick={() => triggerDelete(u.id, 'user')}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "complaints" && (
        <div className="chart-box">
          <h3>Customer Complaints 🎧</h3>
          <table className="admin-table">
            <thead><tr><th style={{ width: "80px" }}>Ticket ID</th><th style={{ width: "150px" }}>User</th><th>Message</th><th style={{ width: "120px" }}>Date</th><th style={{ width: "100px" }}>Status</th><th style={{ width: "120px" }}>Action</th></tr></thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c.id} className="admin-table-row" style={{ opacity: c.status === "resolved" ? 0.6 : 1 }}>
                  <td><strong>#{c.id}</strong></td>
                  <td><strong>{c.username}</strong><br /><span style={{ fontSize: "12px", color: "#64748b" }}>{c.email}</span></td>
                  <td>{c.message}</td>
                  <td>{safeFormatDate(c.created_at)}</td>
                  <td>
                    <span style={{ padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", background: c.status === "resolved" ? "#dcfce7" : "#fef3c7", color: c.status === "resolved" ? "#166534" : "#b45309" }}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    {c.status === "pending" ? (
                      <button onClick={() => resolveComplaint(c.id)} style={{ padding: "6px 12px", background: "#16a34a", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}>Resolve</button>
                    ) : (
                      <span style={{ color: "#64748b", fontSize: "13px" }}>Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "offers" && (
        <div className="chart-box">
          <h3>Create New Offer 🏷️</h3>
          <div className="admin-form offer-form">
            <select value={selectedPkgId} onChange={(e) => setSelectedPkgId(e.target.value)}>
              <option value="">Select Package*</option>
              {packages.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <input placeholder="Offer Name*" value={offerName} onChange={(e) => setOfferName(e.target.value)} />
            <input placeholder="Discount % (Max 50)*" type="number" max={50} value={discountPerc} onChange={(e) => setDiscountPerc(e.target.value)} />
            <div className="date-inputs"><label>Starts*:</label><input type="date" min={today} value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
            <div className="date-inputs"><label>Ends*:</label><input type="date" min={startDate || today} value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
            <button onClick={handleAddOffer}>Create Offer</button>
          </div>
          <h3 style={{ marginTop: "40px" }}>Active Offers</h3>
          <table className="admin-table">
            <thead><tr><th>Offer Name</th><th>Package</th><th>Discount</th><th>Starts</th><th>Ends</th><th>Action</th></tr></thead>
            <tbody>
              {offers.map((o) => (
                <tr key={o.id} className="admin-table-row">
                  <td><strong>{o.name}</strong></td>
                  <td>{o.package_title}</td>
                  <td style={{ color: "#16a34a", fontWeight: "bold" }}>{o.discount_percentage}% OFF</td>
                  <td>{safeFormatDate(o.start_date)}</td>
                  <td>{safeFormatDate(o.end_date)}</td>
                  <td><button className="admin-delete-btn" onClick={() => triggerDelete(o.id, 'offer')}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function AdminPage() {
  return (
    <AdminRoute>
      <AdminContent />
    </AdminRoute>
  );
}