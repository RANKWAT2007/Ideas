// ===============================
// 1️⃣ Load ENV first
// ===============================
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const app = express();

// ===============================
// 2️⃣ Connect Database
// ===============================
connectDB();

// ===============================
// 3️⃣ Middlewares
// ===============================
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// 4️⃣ API Routes
// ===============================
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/profile", require("./routes/profile.routes"));
app.use("/api/jobs", require("./routes/job.routes"));
app.use("/api/applications", require("./routes/application.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api", require("./routes/postRoutes"));

app.use("/uploads", express.static("uploads"));

// ===============================
// 5️⃣ Frontend Static Files
// ===============================
const clientPath = path.join(__dirname, "../client");

app.use(express.static(clientPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(clientPath, "html", "index.html"));
});

// ===============================
// 6️⃣ API 404 Handler
// ===============================
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found"
  });
});

// ===============================
// 7️⃣ Global Error Handler
// ===============================
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
});

// ===============================
// 8️⃣ Start Server
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});