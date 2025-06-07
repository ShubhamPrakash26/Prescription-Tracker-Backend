import express from 'express';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import {
  addPrescription,
  getPrescriptions,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
  downloadPrescription
} from '../controllers/prescription.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'prescriptions',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    public_id: (req, file) => `prescription-${Date.now()}-${file.originalname}`,
  }
});

const upload = multer({ 
  storage: cloudinaryStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const router = express.Router();

router.use((req, res, next) => {
  console.log(`Prescription route accessed: ${req.method} ${req.originalUrl}`);
  next();
});

router.post("/", protectRoute, upload.single('file'), addPrescription);
router.get("/", protectRoute, getPrescriptions);
router.get("/:id", protectRoute, getPrescriptionById);
router.put("/:id", protectRoute, upload.single('file'), updatePrescription);
router.delete("/:id", protectRoute, deletePrescription);
router.get("/download/:id", protectRoute, downloadPrescription);

export default router;