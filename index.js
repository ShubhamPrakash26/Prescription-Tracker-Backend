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

// Enable CORS
// Replace existing CORS setup with this:
// http://vipasyanadoc-001-site22.ktempurl.com/
app.use(cors({
  origin: [
    'http://vipasyanadoc-001-site22.ktempurl.com',
    'https://vipasyanadoc-001-site22.ktempurl.com',
    'https://prescription-tracker-backend.onrender.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://www.medsupervision.in/',
    'https://www.medsupervision.in/'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Enable JSON parsing and cookies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Serve uploaded files statically
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')), (req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL);
  next();
});
// Mount routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: "OK" });
});
app.get('/', (req, res) => {
  res.send('Backend is running');
});

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
       // This error code might occur if a field name is wrong
       return res.status(400).json({ message: 'Unexpected file.' });
    }
     // Generic Multer error - could be file type or others not explicitly handled
     // We can infer file type issues here if the upload middleware is configured for allowed formats
    return res.status(400).json({
      message: 'File upload failed. Please check the file format and size.', // More specific message would require checking the original Multer error details if available
      supportedFormats: ['jpg', 'jpeg', 'png', 'pdf'] // Include supported formats
    });
  } else if (err) {
    // Catch other errors, including those from Cloudinary's upload stream if not caught elsewhere
    console.error("Generic Backend Error:", err);
    return res.status(500).json({ message: 'An unexpected error occurred.' });
  }
  next();
});

app.get('/api/health-check', (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

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
