import Prescription from "../models/prescription.model.js";
import Report from "../models/report.model.js";
import jwt from "jsonwebtoken";
// import mailer from "../utils/mailer.js"; // Assume you have a mailer utility
import User from "../models/user.model.js";

const SHARE_SECRET = process.env.SHARE_SECRET || "supersecret";
// Get FRONTEND_URL from environment variables with validation
const FRONTEND_URL = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.replace(/\/$/, '') // Remove trailing slash if present
  : "http://localhost:5173";

// Validate URL format
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

if (!isValidUrl(FRONTEND_URL)) {
  console.error("Invalid FRONTEND_URL configuration. Please check your environment variables.");
}

// Generate a secure, time-limited share link for a document
export const generateShareLink = async (req, res) => {
  try {
    const { type, id } = req.body;
    if (!type || !id) return res.status(400).json({ message: "Type and ID required" });

    let doc;
    if (type === "prescription") {
      doc = await Prescription.findById(id);
    } else if (type === "report") {
      doc = await Report.findById(id);
    } else {
      return res.status(400).json({ message: "Invalid type" });
    }
    if (!doc) return res.status(404).json({ message: "Document not found" });

    // Ensure document belongs to the requesting user
    if (doc.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to share this document" });
    }

    // Create a JWT token with doc id and type, expires in 1 day
    const token = jwt.sign({ id, type }, SHARE_SECRET, { expiresIn: "1d" });
    const shareLink = `${FRONTEND_URL}/view/${type}/${token}`;
    
    // Validate generated URL
    if (!isValidUrl(shareLink)) {
      return res.status(500).json({ message: "Invalid share link generated. Please check FRONTEND_URL configuration." });
    }
    
    res.json({ shareLink });
  } catch (error) {
    console.error("Error generating share link:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Send share link via email
export const sendShareEmail = async (req, res) => {
  try {
    const { email, type, id } = req.body;
    if (!email || !type || !id) return res.status(400).json({ message: "Email, type, and ID required" });

    // Generate share link
    const token = jwt.sign({ id, type }, SHARE_SECRET, { expiresIn: "1d" });
    const shareLink = `${FRONTEND_URL}/view/${type}/${token}`;

    // Optionally, fetch user info for personalization
    let user = null;
    if (req.user) user = await User.findById(req.user._id);

    // Send email
    await mailer.sendMail({
      to: email,
      subject: `Shared ${type === 'prescription' ? 'Prescription' : 'Report'}`,
      html: `<p>${user ? user.name : 'Someone'} has shared a ${type} with you.</p>
             <p>Click <a href="${shareLink}">here</a> to view it. (Link valid for 24 hours)</p>`
    });
    res.json({ message: "Email sent", shareLink });
  } catch (error) {
    console.error("Error sending share email:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Endpoint to view a shared document (for the share link)
export const viewSharedDocument = async (req, res) => {
  try {
    const { token } = req.params;
    const payload = jwt.verify(token, SHARE_SECRET);
    let doc;
    if (payload.type === "prescription") {
      doc = await Prescription.findById(payload.id);
    } else if (payload.type === "report") {
      doc = await Report.findById(payload.id);
    }
    if (!doc) return res.status(404).json({ message: "Document not found or expired" });
    // Render or send the document (customize as needed)
    res.json(doc);
  } catch (error) {
    console.error("Error viewing shared document:", error);
    res.status(400).json({ message: "Invalid or expired link" });
  }
};
