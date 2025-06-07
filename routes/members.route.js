import express from "express";
import { 
  addMember, 
  getMembers, 
  getMemberById,
  updateMember, 
  deleteMember 
} from "../controllers/member.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, addMember);
router.get("/", protectRoute, getMembers);
router.get("/:id", protectRoute, getMemberById);
router.put("/:id", protectRoute, updateMember);
router.delete("/:id", protectRoute, deleteMember);

export default router;
