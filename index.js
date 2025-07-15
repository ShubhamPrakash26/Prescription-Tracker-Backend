import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import multer from 'multer';

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import memberRoutes from "./routes/members.route.js";
import prescriptionRoutes from "./routes/prescription.route.js";
import reportRoutes from "./routes/reports.route.js";
import shareRoutes from "./routes/share.route.js";
import { connectDB } from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Resolve current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = [
  'http://www.medsupervision.in',
  'https://prescription-tracker-backend.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000',
  "https://prescriptiontracker.vercel.app",
  "http://medsupervision.in"
];

// Global CORS middleware (handles all CORS and preflight automatically)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed for this origin: ' + origin));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Enable JSON parsing and cookies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')), (req, res, next) => {
  if (req.headers.origin && allowedOrigins.includes(req.headers.origin)) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  next();
});

// Health check routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: "OK" });
});
app.get('/api/health-check', (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Mount API routes (always use relative paths)
app.use("/api", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/family", memberRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/share", shareRoutes);

// Multer error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size is too large. Maximum 10MB allowed.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Unexpected file.' });
    }
    return res.status(400).json({
      message: 'File upload failed. Please check the file format and size.',
      supportedFormats: ['jpg', 'jpeg', 'png', 'pdf']
    });
  } else if (err) {
    console.error("Generic Backend Error:", err);
    return res.status(500).json({ message: 'An unexpected error occurred.' });
  }
  next();
});

// Start server after DB connection
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server start failed:", error.message);
    process.exit(1);
  }
};

startServer();
