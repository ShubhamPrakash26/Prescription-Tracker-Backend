import express from 'express';
import { generateShareLink, sendShareEmail, viewSharedDocument } from '../controllers/share.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// Generate share link for a document
router.post('/generate-link', protectRoute, generateShareLink);

// Send document via email
router.post('/send-email', protectRoute, sendShareEmail);

// View shared document (public route - no auth required)
router.get('/:token', viewSharedDocument);

export default router; 