import express from "express";
import { getProfile, updateProfile, updateProfileImage } from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/profile", protectRoute, getProfile);
router.put("/profile", protectRoute, updateProfile);
router.post("/updateProfileImage", protectRoute, updateProfileImage);
router.get("/profile/dashboard", protectRoute);
export default router;
