require('dotenv').config(); 
const express = require("express");
const cors = require("cors");
const path = require('path');
const pool = require("./config/db");
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const multer = require('multer'); // ✅ Added multer
const { generateOTP, sendOTPMail, sendBookingConfirmation, sendCancellationEmail } = require('./utils/mailer');


const app = express();


app.use(cors({
  // Allow both your local environment and your live Vercel site
  origin: ['http://localhost:3000', 'https://trip-management-tau.vercel.app'],
  credentials: true // Important if you are using cookies for login sessions
}));
app.use(express.json());

// 1. Tell Express to serve the uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

const JWT_SECRET = process.env.JWT_SECRET || "trip_manager_super_secret_key_2026";

// ================= RAZORPAY SETUP =================
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ================= MULTER UPLOAD SETUP =================
// 2. Configure Multer to save files with unique names
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/') // Ensure you have an 'uploads' folder in your backend directory!
  },
  filename: function (req, file, cb) {
    // Adds a timestamp so files with the same name don't overwrite each other
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-')); 
  }
});
const upload = multer({ storage: storage });

// ================= MIDDLEWARE =================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }
    req.user = user; 
    next(); 
  });
};

const tempOTPs = new Map();

app.get("/api/health", async (req, res) => {
  res.json({ message: "Trip Manager API is live!" });
});

// ================= ROOT & DB DIAGNOSTICS =================
app.get("/", (req, res) => {
  res.send("Server working ✅");
});

pool.connect()
  .then(async (client) => {
    console.log("✅ DB Connected");
    
    const dbInfo = await client.query("SELECT current_database(), current_user");
    console.log("-----------------------------------------");
    console.log("🔍 DATABASE INFO:");
    console.log("Connected to DB Name:", dbInfo.rows[0].current_database);
    
    try {
      const allUsers = await client.query("SELECT email FROM users");
      const allAdmins = await client.query("SELECT email FROM admins"); 
      
      console.log("📋 USER EMAILS:", allUsers.rows.map(u => u.email));
      console.log("📋 ADMIN EMAILS:", allAdmins.rows.map(a => a.email));
    } catch (err) {
      console.log("❌ ERROR: Could not find 'users' or 'admins' tables.");
    }
    console.log("-----------------------------------------");
    client.release();
  })
  .catch((err) => console.error("❌ DB Connection Failed:", err));


/* ================= UTILITY ROUTES ================= */

// ✅ GET INDIAN STATES API
app.get("/api/states", (req, res) => {
  res.json([
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu and Kashmir", "Chandigarh", "Puducherry"
  ]);
});

// ✅ 3. The new API route to handle the actual file upload
app.post("/api/upload", upload.single("document"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  
  // Return the public URL to the frontend
  res.json({ url: `/uploads/${req.file.filename}` }); 
});

// ✅ 4. API route to handle MULTIPLE hotel images
app.post("/api/upload-multiple", upload.array("images", 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }
  
  // Create an array of public URLs for the uploaded images
  const urls = req.files.map(file => `/uploads/${file.filename}`);
  res.json({ urls }); 
});


/* ================= AUTH & OTP ROUTES ================= */
app.post("/api/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const otp = generateOTP();

  try {
    await sendOTPMail(email, otp);
    tempOTPs.set(email, { otp, expires: Date.now() + 300000 });
    res.json({ message: "OTP sent! Check your inbox." });
  } catch (err) {
    console.error("❌ Mailer Error:", err);
    res.status(500).json({ message: "Failed to send email" });
  }
});

app.post("/api/register", async (req, res) => {
  const { username, email, password, dob, contact_number, city, state, otp } = req.body;

  // ✅ BACKEND VALIDATION: Catch anyone trying to bypass the frontend
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(contact_number)) {
    return res.status(400).json({ error: "Invalid mobile number format." });
  }

  const storedData = tempOTPs.get(email);
  if (!storedData || storedData.otp !== otp) return res.status(400).json({ message: "Invalid or missing OTP" });
  
  try {
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) return res.status(400).json({ message: "User already exists" });

    // ✅ SECURE UPGRADE: Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await pool.query(
      `INSERT INTO users (username, email, password, contact_number, dob, state, city) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, username, email`, 
      [username, email, hashedPassword, contact_number, dob, state, city]
    );
    
    tempOTPs.delete(email);
    res.status(201).json({ 
      message: "User registered successfully ✅", 
      user: newUser.rows[0]
    });
  } catch (err) { 
    console.error("❌ Register Error:", err.message);
    res.status(500).json({ error: "Server error during registration" }); 
  }
});

// --- LOGIN: Checks 'users' FIRST, then checks 'admins' ---
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  try {
    console.log("🔍 Login Attempt for:", cleanEmail);

    let userRole = "user";
    let validUser = null;

    let userRes = await pool.query("SELECT * FROM users WHERE email = $1", [cleanEmail]);

    if (userRes.rows.length > 0) {
      validUser = userRes.rows[0];
      
      // Prevent deactivated users from logging in
      if (validUser.is_active === false) {
        return res.status(403).json({ message: "This account has been deactivated." });
      }
      
      validUser.mappedName = validUser.username; 
    } else {
      let adminRes = await pool.query("SELECT * FROM admins WHERE email = $1", [cleanEmail]);
      if (adminRes.rows.length > 0) {
        validUser = adminRes.rows[0];
        validUser.mappedName = validUser.name; 
        userRole = "admin"; 
      }
    }

    if (!validUser) {
      console.log("❌ User not found");
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // ✅ SECURE UPGRADE: Use bcrypt to compare the plain text with the hashed DB password
    const isMatch = await bcrypt.compare(cleanPassword, validUser.password);

    if (!isMatch) {
      console.log("❌ Password Mismatch");
      return res.status(400).json({ message: "Invalid email or password" });
    }
    
    const token = jwt.sign(
      { 
        id: validUser.id, 
        username: validUser.mappedName, 
        email: validUser.email, 
        role: userRole 
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful ✅",
      token: token,
      user: { 
        id: validUser.id, 
        username: validUser.mappedName, 
        email: validUser.email, 
        role: userRole 
      },
    });

  } catch (err) { 
    console.error("❌ Login error:", err.message);
    res.status(500).json({ error: "Server error" }); 
  }
});


/* ================= FORGOT PASSWORD ROUTES ================= */
// 1. Send OTP for Password Reset
app.post("/api/forgot-password/send-otp", async (req, res) => {
  const { email } = req.body;
  const cleanEmail = email.trim().toLowerCase();

  try {
    const userRes = await pool.query("SELECT * FROM users WHERE email = $1", [cleanEmail]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: "No account found with this email." });
    }

    const otp = generateOTP();
    await sendOTPMail(cleanEmail, otp);
    
    tempOTPs.set(cleanEmail, { otp, expires: Date.now() + 300000 });
    
    res.json({ message: "OTP sent to your email! 📩" });
  } catch (err) {
    console.error("❌ Forgot Password Error:", err);
    res.status(500).json({ message: "Failed to process request." });
  }
});

// 2. Verify OTP & Reset Password
app.post("/api/forgot-password/reset", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const cleanEmail = email.trim().toLowerCase();

  const storedData = tempOTPs.get(cleanEmail);
  
  if (!storedData || storedData.otp !== otp) {
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }

  try {
    // ✅ SECURE UPGRADE: Hash the new password before updating the database
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword.trim(), saltRounds);

    await pool.query("UPDATE users SET password = $1 WHERE email = $2", [hashedNewPassword, cleanEmail]);
    tempOTPs.delete(cleanEmail);
    res.json({ message: "Password reset successful! You can now login. ✅" });
  } catch (err) {
    console.error("❌ Reset Password Error:", err);
    res.status(500).json({ error: "Failed to reset password." });
  }
});


/* ================= PROFILE UPDATE ================= */
app.put("/api/users/profile", authenticateToken, async (req, res) => {
  const { username, email, contact_number, city, currentPassword, newPassword } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role; 

  try {
    if (userRole === 'admin') {
      if (newPassword && currentPassword) {
        const adminRes = await pool.query("SELECT password FROM admins WHERE id = $1", [userId]);
        if (adminRes.rows.length === 0) return res.status(404).json({ message: "Admin not found" });
        
        // Use bcrypt to check current password
        const isMatch = await bcrypt.compare(currentPassword.trim(), adminRes.rows[0].password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect current password." });
        
        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword.trim(), 10);
        
        await pool.query(
          "UPDATE admins SET name = $1, email = $2, password = $3 WHERE id = $4",
          [username, email, hashedNewPassword, userId]
        );
      } else {
        await pool.query(
          "UPDATE admins SET name = $1, email = $2 WHERE id = $3",
          [username, email, userId]
        );
      }
    } else {
      if (newPassword && currentPassword) {
        const userRes = await pool.query("SELECT password FROM users WHERE id = $1", [userId]);
        if (userRes.rows.length === 0) return res.status(404).json({ message: "User not found" });
        
        // Use bcrypt to check current password
        const isMatch = await bcrypt.compare(currentPassword.trim(), userRes.rows[0].password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect current password." });

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword.trim(), 10);

        await pool.query(
          "UPDATE users SET username = $1, email = $2, contact_number = $3, city = $4, password = $5 WHERE id = $6",
          [username, email, contact_number || null, city || null, hashedNewPassword, userId]
        );
      } else {
        await pool.query(
          "UPDATE users SET username = $1, email = $2, contact_number = $3, city = $4 WHERE id = $5",
          [username, email, contact_number || null, city || null, userId]
        );
      }
    }

    res.json({ message: "Profile updated successfully! ✨", username, email, contact_number, city });

  } catch (err) {
    console.error("❌ Profile DB Error:", err.message);
    res.status(500).json({ message: "Database error" });
  }
});


/* ================= PACKAGES & OFFERS ================= */
app.get("/api/packages", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.*, 
        o.id AS offer_id, 
        o.name AS offer_name, 
        o.discount_percentage,
        CASE 
          WHEN o.id IS NOT NULL THEN p.price - (p.price * (o.discount_percentage / 100.0)) 
          ELSE p.price 
        END AS discounted_price,
        ROUND(AVG(r.rating), 1) AS average_rating,
        COUNT(r.id) AS review_count
      FROM packages p
      
      -- 1. Attach active offers
      LEFT JOIN offers o ON p.id = o.package_id 
        AND o.is_active = true 
        AND CURRENT_DATE >= o.start_date 
        AND CURRENT_DATE <= o.end_date
        
      -- 2. Attach reviews
      LEFT JOIN package_reviews r ON p.id = r.package_id
      
      -- 3. Group by the package and offer details to make the math work
      GROUP BY p.id, o.id, o.name, o.discount_percentage
      ORDER BY p.id DESC
    `);
    res.json(result.rows);
  } catch (err) { 
    console.error("Packages Error:", err);
    res.status(500).json({ error: "Server error" }); 
  }
});

app.get("/api/packages/:id", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, o.id AS offer_id, o.name AS offer_name, o.discount_percentage,
      CASE WHEN o.id IS NOT NULL THEN p.price - (p.price * (o.discount_percentage / 100)) ELSE p.price END AS discounted_price
      FROM packages p
      LEFT JOIN offers o ON p.id = o.package_id AND o.is_active = true 
      AND CURRENT_DATE >= o.start_date AND CURRENT_DATE <= o.end_date
      WHERE p.id = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) return res.status(404).json({ error: "Package not found" });
    res.json(result.rows[0]);
  } catch (err) { 
    console.error("❌ Fetch Single Package Error:", err);
    res.status(500).json({ error: "Server error" }); 
  }
});

app.post("/api/packages", async (req, res) => {
  const { title, price, image, departure_dates, duration_days, description, itinerary, hotel_images } = req.body; 
  try {
    const result = await pool.query(
      "INSERT INTO packages (title, price, image, departure_dates, duration_days, description, itinerary, hotel_images) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *", 
      [
        title, 
        price, 
        image, 
        JSON.stringify(departure_dates || []), 
        duration_days, 
        description, 
        JSON.stringify(itinerary || []),
        hotel_images || [] // PostgreSQL array format handles this natively or via JSON
      ] 
    );
    res.json(result.rows[0]);
  } catch (err) { 
    res.status(500).send(err.message); 
  }
});

app.put("/api/packages/:id", async (req, res) => {
  const { id } = req.params;
  const { title, price, image, departure_dates, duration_days, description, itinerary, hotel_images } = req.body;
  try {
    const result = await pool.query(
      "UPDATE packages SET title=$1, price=$2, image=$3, departure_dates=$4, duration_days=$5, description=$6, itinerary=$7, hotel_images=$8 WHERE id=$9 RETURNING *",
      [
        title, 
        price, 
        image, 
        JSON.stringify(departure_dates || []), 
        duration_days, 
        description, 
        JSON.stringify(itinerary || []), 
        hotel_images || [], 
        id
      ]
    );
    res.json(result.rows[0]);
  } catch (err) { 
    res.status(500).send(err.message); 
  }
});

app.delete("/api/packages/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM packages WHERE id = $1", [req.params.id]);
    res.json({ message: "Package deleted ✅" });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// ✅ NEW: Fetch seat availability for a specific package
app.get("/api/packages/:id/availability", async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Get the package's total capacity
    const pkgRes = await pool.query("SELECT max_capacity FROM packages WHERE id = $1", [id]);
    if (pkgRes.rows.length === 0) return res.status(404).json({ error: "Package not found" });
    const maxCapacity = pkgRes.rows[0].max_capacity || 45; // Default to 45 if null

    // 2. Sum the confirmed bookings for future dates (USING TO_CHAR FOR PERFECT DATE STRINGS)
    const bookedRes = await pool.query(`
      SELECT TO_CHAR(travel_date, 'YYYY-MM-DD') as travel_date_str, SUM(people) as total_booked
      FROM bookings 
      WHERE package_id = $1 AND status = 'confirmed' AND travel_date >= CURRENT_DATE
      GROUP BY travel_date
    `, [id]);

    // Send it back to the frontend
    res.json({
      max_capacity: maxCapacity,
      booked_dates: bookedRes.rows.map(r => ({
        date: r.travel_date_str, // No more JavaScript Date timezone issues!
        booked: Number(r.total_booked)
      }))
    });

  } catch (err) { 
    console.error("Availability Error:", err);
    res.status(500).json({ error: "Server error" }); 
  }
});


/* ================= PACKAGE REVIEWS ================= */
app.get("/api/packages/:id/reviews", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM package_reviews WHERE package_id = $1 ORDER BY created_at DESC",
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

app.post("/api/packages/:id/reviews", async (req, res) => {
  const { id } = req.params;
  const { user_name, rating, comment } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO package_reviews (package_id, user_name, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *",
      [id, user_name, rating, comment]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to submit review" });
  }
});


/* ================= OFFERS ================= */
app.get("/api/offers", async (req, res) => {
  try {
    const result = await pool.query(`SELECT o.*, p.title as package_title FROM offers o JOIN packages p ON o.package_id = p.id ORDER BY o.id DESC`);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.post("/api/offers", async (req, res) => {
  const { package_id, name, description, discount_percentage, start_date, end_date } = req.body;
  try {
    const result = await pool.query(`INSERT INTO offers (package_id, name, description, discount_percentage, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [package_id, name, description, discount_percentage, start_date, end_date]);
    res.status(201).json({ message: "Offer added ✅", offer: result.rows[0] });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.delete("/api/offers/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM offers WHERE id = $1", [req.params.id]);
    res.json({ message: "Offer deleted ✅" });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});


/* ================= RAZORPAY PAYMENT ROUTES ================= */
// 1. Create Razorpay Order
app.post("/api/payment/create-order", async (req, res) => {
  const { amount } = req.body; 

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), 
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    res.json({ success: true, order });
  } catch (err) {
    console.error("❌ Razorpay Order Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Verify Payment & Save Booking (ACID Compliant)
app.post('/api/payment/verify', async (req, res) => {
  const { 
    razorpay_order_id, 
    razorpay_payment_id, 
    razorpay_signature, 
    user_id, 
    package_id, 
    travel_date,
    people,
    adults,
    children,
    meal_preference,
    transfer_option,
    arrival_point,
    arrival_time,
    id_proof_url 
  } = req.body;

  // --- STEP 1: Verify the Razorpay Signature ---
  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET) 
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest('hex');

  if (generated_signature !== razorpay_signature) {
    return res.status(400).json({ success: false, error: "Payment verification failed. Invalid signature." });
  }

  // --- STEP 2: Database Transaction ---
  const client = await pool.connect(); 

  try {
    await client.query('BEGIN'); 

    // A. Fetch Package Price & Calculate Total Securely
    const pkgRes = await client.query(`
      SELECT p.price, p.title,
      CASE WHEN o.id IS NOT NULL THEN p.price - (p.price * (o.discount_percentage / 100)) ELSE p.price END AS final_price 
      FROM packages p 
      LEFT JOIN offers o ON p.id = o.package_id AND o.is_active = true AND CURRENT_DATE >= o.start_date AND CURRENT_DATE <= o.end_date 
      WHERE p.id = $1`, [package_id]);
    
    if (pkgRes.rows.length === 0) throw new Error("Package not found");
    
    const basePrice = Number(pkgRes.rows[0].final_price);
    const adultCount = Number(adults) || 1;
    const childCount = Number(children) || 0;
    const total_price = (basePrice * adultCount) + ((basePrice * 0.5) * childCount); 

    // B. Create the Confirmed Booking FIRST (to get the booking_id)
    const bookingQuery = `
      INSERT INTO bookings (
        package_id, user_id, travel_date, people, adults, children, status, 
        meal_preference, id_proof_url, price, total_price, transfer_option, arrival_point, arrival_time
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'confirmed', $7, $8, $9, $10, $11, $12, $13)
      RETURNING id;
    `;
    
    const bookingValues = [
      package_id, user_id, travel_date, people, adultCount, childCount,
      meal_preference || 'Any', id_proof_url || null, basePrice, total_price,
      transfer_option || 'none', arrival_point || null, arrival_time || null
    ];
    
    const bookingResult = await client.query(bookingQuery, bookingValues);
    const newBookingId = bookingResult.rows[0].id;

    // C. Insert the payment record SECOND (Attached to the new booking_id)
    const paymentQuery = `
      INSERT INTO payments (booking_id, user_id, amount, payment_method, payment_id, transaction_id, status)
      VALUES ($1, $2, $3, 'Razorpay', $4, $5, 'successful')
    `;
    // We map razorpay_order_id to payment_id and razorpay_payment_id to transaction_id to match your Admin UI!
    const paymentValues = [newBookingId, user_id, total_price, razorpay_order_id, razorpay_payment_id];
    
    await client.query(paymentQuery, paymentValues);

    await client.query('COMMIT'); // Save everything!

    // D. Send Confirmation Email (Non-blocking)
    try {
      const userQuery = await pool.query("SELECT username, email FROM users WHERE id = $1", [user_id]);
      if (userQuery.rows.length > 0) {
        sendBookingConfirmation(
          userQuery.rows[0].email, 
          userQuery.rows[0].username, 
          {
            title: pkgRes.rows[0].title,
            date: travel_date,
            people: people,
            price: total_price,
            transactionId: razorpay_payment_id
          }
        ).catch(err => console.error("Non-fatal email error:", err));
      }
    } catch (emailError) {
      console.error("Email trigger failed, but booking saved:", emailError);
    }

    res.status(200).json({ success: true, message: "Payment verified and booking confirmed!" });

  } catch (error) {
    await client.query('ROLLBACK'); // Undo everything if an error occurs
    console.error("Transaction failed, rolled back:", error);
    res.status(500).json({ success: false, error: "Database error during booking confirmation." });
    
  } finally {
    client.release(); // Free up the connection
  }
});


/* ================= BOOKINGS ================= */

// ✅ Old mock booking route (Updated with new Transfer system mapping)
app.post("/api/book", async (req, res) => {
  const { user_id, package_id, travel_date, people, adults, children, meal_preference, transfer_option, arrival_point, arrival_time, id_proof_url } = req.body; 
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Calculate the true total people based on Adults + Children
    const adultCount = Number(adults) || 1;
    const childCount = Number(children) || 0;
    const totalPeople = adultCount + childCount;
    
    const pkgRes = await client.query(`
      SELECT p.price, p.title,
      CASE WHEN o.id IS NOT NULL THEN p.price - (p.price * (o.discount_percentage / 100)) ELSE p.price END AS final_price 
      FROM packages p 
      LEFT JOIN offers o ON p.id = o.package_id AND o.is_active = true AND CURRENT_DATE >= o.start_date AND CURRENT_DATE <= o.end_date 
      WHERE p.id = $1`, [package_id]);
    
    if (pkgRes.rows.length === 0) throw new Error("Package not found");
    
    const price = Number(pkgRes.rows[0].final_price);
    const pkgTitle = pkgRes.rows[0].title;
    
    // ✅ NEW: Children Pricing Logic (50% off for kids)
    const adultTotal = price * adultCount;
    const childTotal = (price * 0.5) * childCount;
    let total = adultTotal + childTotal;

    const query = `
      INSERT INTO bookings (
        package_id, user_id, travel_date, people, adults, children, status, 
        meal_preference, id_proof_url, price, total_price, transfer_option, arrival_point, arrival_time
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, 'confirmed', $7, $8, $9, $10, $11, $12, $13) 
      RETURNING *;
    `;
    
    const bookingResult = await client.query(query, [
      package_id, 
      user_id, 
      travel_date, 
      totalPeople, 
      adultCount,  
      childCount,  
      meal_preference || 'Any', 
      id_proof_url || null,
      price,
      total,
      transfer_option || 'none',
      arrival_point || null,
      arrival_time || null
    ]);
    
    const pay_id = "PAY_" + Date.now();
    const txn_id = "TXN_" + Date.now();
    
    await client.query(
      "INSERT INTO payments (booking_id, user_id, amount, payment_method, payment_id, transaction_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7)", 
      [bookingResult.rows[0].id, user_id, total, 'Mock Card', pay_id, txn_id, 'successful']
    );
    
    await client.query("COMMIT");

    try {
      const userQuery = await pool.query("SELECT username, email FROM users WHERE id = $1", [user_id]);
      if (userQuery.rows.length > 0) {
        const userData = userQuery.rows[0];
        const bookingData = bookingResult.rows[0];

        sendBookingConfirmation(
          userData.email, 
          userData.username, 
          {
            title: pkgTitle,
            date: bookingData.travel_date,
            people: bookingData.people,
            price: bookingData.total_price,
            transactionId: txn_id
          }
        ).catch(err => console.error("Non-fatal email error:", err));
      }
    } catch (emailTriggerError) {
      console.error("Failed to trigger email system, but booking was saved:", emailTriggerError);
    }

    res.status(201).json({ message: "Booking confirmed! 🎉", booking: bookingResult.rows[0] });
  } catch (err) { 
    await client.query("ROLLBACK"); 
    console.error("❌ Booking Error:", err.message);
    res.status(500).json({ error: "Booking failed" }); 
  } finally { client.release(); }
});

// ✅ FETCH DASHBOARD BOOKINGS (For a specific user)
app.get("/api/bookings/user/:userId", async (req, res) => {
  try {
    const query = `
      SELECT b.*, p.title, p.image, p.duration_days, pay.payment_id, pay.transaction_id,
             a.agent_name, a.role, a.contact_no
      FROM bookings b 
      JOIN packages p ON b.package_id = p.id 
      LEFT JOIN payments pay ON b.id = pay.booking_id
      LEFT JOIN booking_assignments ba ON b.id = ba.booking_id
      LEFT JOIN agents a ON ba.agent_id = a.agent_id
      WHERE b.user_id = $1 
      ORDER BY b.booking_date DESC
    `;
    const result = await pool.query(query, [req.params.userId]);
    res.json(result.rows);
  } catch (err) { 
    console.error("Fetch Bookings User Error:", err);
    res.status(500).send("Error"); 
  }
});

// Backward compatibility: Old User Bookings Route
app.get("/api/bookings/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT 
          b.*, 
          pkg.title, 
          pkg.image, 
          pay.payment_id, 
          pay.transaction_id,
          a.agent_name, 
          a.role, 
          a.contact_no
       FROM bookings b
       JOIN packages pkg ON b.package_id = pkg.id 
       LEFT JOIN payments pay ON b.id = pay.booking_id
       LEFT JOIN booking_assignments ba ON b.id = ba.booking_id
       LEFT JOIN agents a ON ba.agent_id = a.agent_id
       WHERE b.user_id = $1 
       ORDER BY b.id DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch Bookings Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ SMART CANCELLATION & REFUND LOGIC
app.put("/api/bookings/:id/cancel", async (req, res) => {
  try {
    const bookingId = req.params.id;

    // 1. Fetch the booking details WITH user and package info for the email
    const bookingQuery = await pool.query(`
      SELECT b.travel_date, b.total_price, u.email, u.username, p.title as package_title
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN packages p ON b.package_id = p.id
      WHERE b.id = $1
    `, [bookingId]);
    
    if (bookingQuery.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const booking = bookingQuery.rows[0];
    const travelDate = new Date(booking.travel_date);
    const currentDate = new Date();

    // 2. Calculate the difference in hours
    const timeDifferenceMs = travelDate.getTime() - currentDate.getTime();
    const hoursDifference = timeDifferenceMs / (1000 * 60 * 60);

    // 3. Apply the 48-Hour Business Rule
    let refundAmount = 0;
    let refundStatus = "No Refund (Cancelled within 48 hours)";

    if (hoursDifference >= 48) {
      refundAmount = booking.total_price;
      refundStatus = "Full Refund Issued";
    }

    // 4. Update the database WITH the refund details
    const updateQuery = await pool.query(
      "UPDATE bookings SET status = 'cancelled', refund_amount = $1, refund_status = $2 WHERE id = $3 RETURNING *", 
      [refundAmount, refundStatus, bookingId]
    );

    // 5. Fire off the cancellation email in the background!
    sendCancellationEmail(
      booking.email,
      booking.username,
      {
        title: booking.package_title,
        date: booking.travel_date,
        price: booking.total_price,
        refundAmount: refundAmount,
        refundStatus: refundStatus
      }
    ).catch(err => console.error("Non-fatal cancellation email error:", err));

    res.json({ 
      success: true, 
      booking: updateQuery.rows[0],
      refund_amount: refundAmount,
      refund_status: refundStatus,
      hours_remaining: Math.round(hoursDifference)
    });

  } catch (err) {
    console.error("Cancellation Error:", err);
    res.status(500).json({ success: false, error: "Failed to cancel booking" });
  }
});

// REBOOK ROUTE
app.put("/api/bookings/:id/rebook", async (req, res) => {
  try {
    await pool.query("UPDATE bookings SET status = 'confirmed' WHERE id = $1", [req.params.id]);
    res.json({ message: "Booking re-confirmed! 🎉" });
  } catch (err) { 
    console.error("Rebook Error:", err);
    res.status(500).json({ error: "Server error" }); 
  }
});


/* ================= ADMIN DASHBOARD ROUTES ================= */

/* ================= UPGRADED ADMIN STATS ROUTE ================= */
app.get("/api/admin/stats", async (req, res) => {
  try {
    // 1. Basic Counts
    const usersResult = await pool.query("SELECT COUNT(*) FROM users");
    const pendingComplaints = await pool.query("SELECT COUNT(*) FROM complaints WHERE status = 'pending'");

    // 2. All-Time Booking Metrics
    const bookingsData = await pool.query(`
      SELECT 
        COUNT(*) as total_bookings,
        SUM(CASE WHEN status = 'confirmed' THEN total_price ELSE 0 END) as total_revenue,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as total_cancelled,
        AVG(CASE WHEN status = 'confirmed' THEN total_price ELSE NULL END) as average_booking_value
      FROM bookings
    `);

    // 3. Trends (This Month vs Last Month)
    const currentMonth = await pool.query(`
      SELECT COUNT(*) as bookings, COALESCE(SUM(total_price), 0) as revenue FROM bookings 
      WHERE status = 'confirmed' AND DATE_TRUNC('month', booking_date) = DATE_TRUNC('month', CURRENT_DATE)
    `);

    const lastMonth = await pool.query(`
      SELECT COUNT(*) as bookings, COALESCE(SUM(total_price), 0) as revenue FROM bookings 
      WHERE status = 'confirmed' AND DATE_TRUNC('month', booking_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
    `);

    // Helper function to calculate percentage growth safely
    const calcTrend = (current, previous) => {
      const c = Number(current) || 0;
      const p = Number(previous) || 0;
      if (p === 0) return c > 0 ? 100 : 0; // If last month was 0, and this month is > 0, it's 100% growth
      return Math.round(((c - p) / p) * 100);
    };

    // Safely parse the database strings into numbers!
    const currRev = currentMonth.rows.length > 0 ? currentMonth.rows[0].revenue : 0;
    const lastRev = lastMonth.rows.length > 0 ? lastMonth.rows[0].revenue : 0;
    const currBook = currentMonth.rows.length > 0 ? currentMonth.rows[0].bookings : 0;
    const lastBook = lastMonth.rows.length > 0 ? lastMonth.rows[0].bookings : 0;

    const revTrend = calcTrend(currRev, lastRev);
    const bookTrend = calcTrend(currBook, lastBook);

    const totalB = parseInt(bookingsData.rows[0]?.total_bookings) || 0;
    const totalC = parseInt(bookingsData.rows[0]?.total_cancelled) || 0;
    const cancelRate = totalB > 0 ? Math.round((totalC / totalB) * 100) : 0;

    // 4. NEW: Smart Capacity Alerts (> 90% Full)
    const capacityAlertsQuery = await pool.query(`
      SELECT 
        p.title, 
        b.travel_date, 
        p.max_capacity, 
        SUM(b.people) as total_booked
      FROM bookings b
      JOIN packages p ON b.package_id = p.id
      WHERE b.status = 'confirmed' AND b.travel_date >= CURRENT_DATE
      GROUP BY p.title, b.travel_date, p.max_capacity
      HAVING SUM(b.people) >= (p.max_capacity * 0.9)
      ORDER BY b.travel_date ASC;
    `);

    res.json({
      users: parseInt(usersResult.rows[0].count),
      pendingTickets: parseInt(pendingComplaints.rows[0].count),
      bookings: totalB,
      bookingsTrend: bookTrend,
      revenue: parseInt(bookingsData.rows[0].total_revenue) || 0,
      revenueTrend: revTrend,
      cancellationRate: cancelRate,
      averageBookingValue: Math.round(bookingsData.rows[0].average_booking_value || 0),
      capacityAlerts: capacityAlertsQuery.rows.map(r => ({
        title: r.title,
        date: r.travel_date,
        booked: Number(r.total_booked),
        max: r.max_capacity,
        percentage: Math.round((Number(r.total_booked) / r.max_capacity) * 100)
      }))
    });
  } catch (err) { 
    console.error("Admin Stats Error:", err);
    res.status(500).send("Error fetching stats"); 
  }
});

// ✅ FETCH ALL ADMIN BOOKINGS (Ensures b.* fetches id_proof_url)
app.get("/api/admin/bookings", async (req, res) => {
  try {
    const query = `
      SELECT b.*, p.title, p.image, u.username, u.email, pay.payment_id, pay.transaction_id,
             a.agent_name, a.role, a.contact_no
      FROM bookings b 
      JOIN packages p ON b.package_id = p.id 
      LEFT JOIN users u ON b.user_id = u.id 
      LEFT JOIN payments pay ON b.id = pay.booking_id
      LEFT JOIN booking_assignments ba ON b.id = ba.booking_id
      LEFT JOIN agents a ON ba.agent_id = a.agent_id
      ORDER BY b.booking_date DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) { 
    console.error("Admin Bookings Error:", err);
    res.status(500).send("Error"); 
  }
});

// ADMIN ROUTE: Get Monthly Bookings for the Chart
app.get("/api/admin/chart", async (req, res) => {
  try {
    const query = `
      SELECT 
        TO_CHAR(booking_date, 'Mon YYYY') as title, 
        COUNT(*) as count 
      FROM bookings 
      GROUP BY TO_CHAR(booking_date, 'Mon YYYY'), DATE_TRUNC('month', booking_date)
      ORDER BY DATE_TRUNC('month', booking_date) ASC
      LIMIT 6;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch chart data" });
  }
});

/* ================= ADVANCED ANALYTICS ROUTE ================= */
app.get("/api/admin/advanced-analytics", async (req, res) => {
  try {
    // 1. Revenue Trend (Area Chart)
    const revenueTrendQuery = await pool.query(`
      SELECT TO_CHAR(booking_date, 'Mon YYYY') as month, COALESCE(SUM(total_price), 0) as revenue 
      FROM bookings WHERE status = 'confirmed' 
      GROUP BY TO_CHAR(booking_date, 'Mon YYYY'), DATE_TRUNC('month', booking_date)
      ORDER BY DATE_TRUNC('month', booking_date) ASC LIMIT 6;
    `);

    // 2. Booking Status Breakdown (Donut Chart)
    const statusQuery = await pool.query(`
      SELECT status as name, COUNT(*) as value FROM bookings GROUP BY status;
    `);

    // 3. Top Revenue Generating Packages (Horizontal Bar Chart)
    const topPackagesQuery = await pool.query(`
      SELECT p.title as name, SUM(b.total_price) as revenue
      FROM bookings b JOIN packages p ON b.package_id = p.id
      WHERE b.status = 'confirmed' GROUP BY p.title ORDER BY revenue DESC LIMIT 5;
    `);

    // 4. NEW: Monthly Bookings Volume (Bar Chart)
    const bookingsVolumeQuery = await pool.query(`
      SELECT TO_CHAR(booking_date, 'Mon YYYY') as month, COUNT(*) as count 
      FROM bookings 
      GROUP BY TO_CHAR(booking_date, 'Mon YYYY'), DATE_TRUNC('month', booking_date)
      ORDER BY DATE_TRUNC('month', booking_date) ASC LIMIT 6;
    `);

    // 5. NEW: Domestic vs International (Pie Chart)
    const tripTypeQuery = await pool.query(`
      SELECT CASE WHEN p.is_international = true THEN 'International' ELSE 'Domestic' END as name, COUNT(b.id) as value
      FROM bookings b JOIN packages p ON b.package_id = p.id
      GROUP BY p.is_international;
    `);

    res.json({
      revenueTrend: revenueTrendQuery.rows.map(r => ({ ...r, revenue: Number(r.revenue) })),
      statusBreakdown: statusQuery.rows.map(r => ({ ...r, value: Number(r.value) })),
      topRevenuePackages: topPackagesQuery.rows.map(r => ({ ...r, revenue: Number(r.revenue) })),
      bookingsVolume: bookingsVolumeQuery.rows.map(r => ({ ...r, count: Number(r.count) })),
      tripType: tripTypeQuery.rows.map(r => ({ ...r, value: Number(r.value) }))
    });

  } catch (err) {
    console.error("Advanced Analytics Error:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

/* ================= YEARLY REVENUE ROUTE (Feature #5) ================= */
app.get("/api/admin/yearly-revenue", async (req, res) => {
  try {
    const query = `
      SELECT 
        TO_CHAR(booking_date, 'YYYY') as year, 
        COALESCE(SUM(total_price), 0) as revenue 
      FROM bookings 
      WHERE status = 'confirmed' 
      GROUP BY TO_CHAR(booking_date, 'YYYY')
      ORDER BY TO_CHAR(booking_date, 'YYYY') ASC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Yearly Revenue Error:", err);
    res.status(500).json({ error: "Failed to fetch yearly revenue" });
  }
});

/* ================= NEW ANALYTICS ROUTES ================= */
app.get('/api/analytics/revenue', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', travel_date), 'Mon YYYY') AS month,
        SUM(total_price) AS revenue
      FROM bookings
      WHERE status = 'confirmed' 
      GROUP BY DATE_TRUNC('month', travel_date)
      ORDER BY DATE_TRUNC('month', travel_date) ASC;
    `);
    
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Revenue Analytics Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/analytics/volume', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', travel_date), 'Mon YYYY') AS month,
        COUNT(id) AS volume
      FROM bookings
      GROUP BY DATE_TRUNC('month', travel_date)
      ORDER BY DATE_TRUNC('month', travel_date) ASC;
    `);
    
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Volume Analytics Error:", err);
    res.status(500).json({ error: err.message });
  }
});


/* ================= ADMIN USER ROUTES ================= */
app.get("/api/admin/users", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, username, email, dob, contact_number, city 
      FROM users 
      WHERE is_active = true
      ORDER BY id DESC
    `);
    res.json(result.rows);
  } catch (err) { 
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ error: "Server error" }); 
  }
});

// ✅ UPGRADED: Soft Delete User Route
app.delete("/api/admin/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // OLD WAY (Destroys data): 
    // const result = await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    // NEW WAY (Soft Delete - Preserves booking history!):
    const result = await pool.query(
      'UPDATE users SET is_active = false WHERE id = $1 RETURNING *', 
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User successfully deactivated", user: result.rows[0] });

  } catch (err) { 
    console.error("❌ Error deactivating user:", err);
    res.status(500).json({ error: "Server error" }); 
  }
});


/* ================= COMPLAINTS & SUPPORT ROUTES ================= */
app.post("/api/complaints", async (req, res) => {
  const { user_id, message } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO complaints (user_id, message, status) VALUES ($1, $2, 'pending') RETURNING *",
      [user_id, message]
    );
    res.status(201).json({ message: "Complaint submitted successfully ✅", complaint: result.rows[0] });
  } catch (err) {
    console.error("❌ Complaint Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/complaints/user/:userId", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM complaints WHERE user_id = $1 ORDER BY id DESC", [req.params.userId]);
    res.json(result.rows);
  } catch (err) { 
    res.status(500).json({ error: "Server error" }); 
  }
});

app.get("/api/admin/complaints", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, u.username, u.email 
      FROM complaints c 
      JOIN users u ON c.user_id = u.id 
      ORDER BY c.status ASC, c.id DESC
    `);
    res.json(result.rows);
  } catch (err) { 
    res.status(500).json({ error: "Server error" }); 
  }
});

app.put("/api/admin/complaints/:id/resolve", async (req, res) => {
  try {
    await pool.query("UPDATE complaints SET status = 'resolved' WHERE id = $1", [req.params.id]);
    res.json({ message: "Complaint resolved ✅" });
  } catch (err) { 
    res.status(500).json({ error: "Server error" }); 
  }
});

/* ================= AGENT MANAGEMENT ================= */
// POST route to assign an agent to a booking
app.post('/api/assign-agent', async (req, res) => {
  const { booking_id, agent_id } = req.body;

  try {
    // Insert the assignment into your new junction table
    const result = await pool.query(
      'INSERT INTO booking_assignments (booking_id, agent_id) VALUES ($1, $2) RETURNING *',
      [booking_id, agent_id]
    );
    
    res.status(201).json({ 
      message: "Agent successfully assigned!", 
      assignment: result.rows[0] 
    });
  } catch (err) {
    console.error("Error assigning agent:", err);
    res.status(500).json({ error: "Failed to assign agent to booking." });
  }
});

// GET route to fetch all agents (so the Admin can see who is available)
app.get('/api/agents', async (req, res) => {
  try {
    const result = await pool.query('SELECT agent_id, agent_name, role FROM agents');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch agents." });
  }
});


// ================= SERVER START =================
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});