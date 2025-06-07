import express from "express";
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import {
  addReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport
} from "../controllers/report.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'reports',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    public_id: (req, file) => `report-${Date.now()}-${file.originalname}`,
  }
});

const upload = multer({ 
  storage: cloudinaryStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const router = express.Router();

router.use((req, res, next) => {
  console.log(`Report route accessed: ${req.method} ${req.originalUrl}`);
  next();
});

router.post("/", protectRoute, upload.single('file'), addReport);
router.get("/", protectRoute, getReports);
router.get("/:id", protectRoute, getReportById);
router.put("/:id", protectRoute, upload.single('file'), updateReport);
router.delete("/:id", protectRoute, deleteReport);

export default router;
