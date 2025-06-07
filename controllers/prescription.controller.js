import Prescription from "../models/prescription.model.js";
// import { generatePDF } from "../utils/pdfGenerator.js"; // Assume this utility exists

export const addPrescription = async (req, res) => {
  try {
    const { title, category, tags, doctor, description, date, memberId } = req.body;
    console.log("Add Prescription Body:", req.body);
    console.log("Uploaded File:", req.file);

    if (!title || !date) {
      return res.status(400).json({ message: "Title and date are required" });
    }

    // Get file URL from Cloudinary (support path or url)
    let fileUrl = null;
    if (req.file) {
      fileUrl = req.file.path || req.file.url || null;
    }

    const newPrescription = new Prescription({
      userId: req.user._id,
      memberId: memberId || null,
      title,
      category,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      doctor,
      description,
      date,
      imageUrl: fileUrl,  // use fileUrl here to save in DB
    });

    const savedPrescription = await newPrescription.save();
    res.status(201).json(savedPrescription);
  } catch (error) {
    console.error("Error in addPrescription controller:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      stack: error.stack,
    });
  }
};

export const getPrescriptions = async (req, res) => {
  try {
    const { category, tags, memberId, startDate, endDate, type, id } = req.query;
    
    const query = { userId: req.user._id };
    
    // Category filter
    if (category) query.category = category;
    
    // Member filter
    if (memberId && memberId !== 'all') query.memberId = memberId;
    
    // Tags filter
    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $in: tagArray };
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Type filter (if implemented in the future)
    if (type) query.type = type;

    // ID filter
    if (id) query._id = id;

    const prescriptions = await Prescription.find(query)
      .sort({ date: -1 })
      .lean();

    res.status(200).json(prescriptions);
  } catch (error) {
    console.error("Error in getPrescriptions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    res.status(200).json(prescription);
  } catch (error) {
    console.error("Error in getPrescriptionById controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updatePrescription = async (req, res) => {
  try {
    const { title, category, tags, doctor, description, date, memberId } = req.body;
    
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    // Update fields
    if (title) prescription.title = title;
    if (category) prescription.category = category;
    if (tags) prescription.tags = tags.split(',').map(tag => tag.trim());
    if (doctor) prescription.doctor = doctor;
    if (description) prescription.description = description;
    if (date) prescription.date = date;
    if (memberId) prescription.memberId = memberId;
    
    // Handle file update
    if (req.file) {
      prescription.imageUrl = req.file.path;
    }

    const updatedPrescription = await prescription.save();
    res.status(200).json(updatedPrescription);

  } catch (error) {
    console.error("Error in updatePrescription controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deletePrescription = async (req, res) => {
  try {
    const deleted = await Prescription.deleteOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (deleted.deletedCount === 0) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    res.status(200).json({ message: "Prescription deleted successfully" });
  } catch (error) {
    console.error("Error in deletePrescription controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const downloadPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    // Generate PDF using utility
    const pdfBuffer = await generatePDF({
      title: prescription.title,
      date: prescription.date,
      doctor: prescription.doctor,
      tags: prescription.tags,
      description: prescription.description,
      imageUrl: prescription.imageUrl
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${prescription.title}.pdf"`);
    
    res.send(pdfBuffer);

  } catch (error) {
    console.error("Error in downloadPrescription controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
