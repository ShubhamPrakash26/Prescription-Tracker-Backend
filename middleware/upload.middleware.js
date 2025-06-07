import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    // Determine resource type based on file type
    const extension = file.originalname.split('.').pop().toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png'].includes(extension);
    const isRaw = ['pdf', 'doc', 'docx'].includes(extension);

    return {
      folder: 'prescriptions',
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
      resource_type: isRaw ? 'raw' : 'image',
      public_id: `prescription-${Date.now()}-${file.originalname}`
    };
  }
});

const upload = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Increased limit for docs
});

export const uploadPrescriptionFile = upload.single('file'); // 'file' field can now be any supported format
