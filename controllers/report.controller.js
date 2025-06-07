import Report from "../models/report.model.js";

// Add a new medical report
export const addReport = async (req, res) => {
  try {
    const { memberId, type, tags } = req.body;
    console.log("Add Report Body:", req.body);
    console.log("Uploaded File:", req.file);

    if (!memberId || !type || !req.file) {
      return res.status(400).json({
        message: "Member ID, report type, and file are required"
      });
    }

    const newReport = new Report({
      userId: req.user._id,
      memberId,
      type,
      fileUrl: req.file.path, // Cloudinary provides the URL in the path property
      date: new Date(),
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });

    const savedReport = await newReport.save();
    res.status(201).json(savedReport);

  } catch (error) {
    console.error("Error in addReport controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get filtered reports
export const getReports = async (req, res) => {
  try {
    const { type, memberId, tags, startDate, endDate } = req.query;

    const query = { userId: req.user._id };

    if (type) query.type = type;
    if (memberId) query.memberId = memberId;
    if (tags) query.tags = { $in: tags.split(',').map(tag => tag.trim()) };

    // Date filtering
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const reports = await Report.find(query)
      .sort({ date: -1 })
      .lean();

    res.status(200).json(reports);
  } catch (error) {
    console.error("Error in getReports controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get a single report by ID
export const getReportById = async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json(report);
  } catch (error) {
    console.error("Error in getReportById controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update report metadata
export const updateReport = async (req, res) => {
  try {
    const { type, tags, memberId } = req.body;

    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (type) report.type = type;
    if (tags) report.tags = tags.split(',').map(tag => tag.trim());
    if (memberId) report.memberId = memberId;

    if (req.file) {
      report.fileUrl = req.file.path;
    }

    const updatedReport = await report.save();
    res.status(200).json(updatedReport);

  } catch (error) {
    console.error("Error in updateReport controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete a report
export const deleteReport = async (req, res) => {
  try {
    const deleted = await Report.deleteOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (deleted.deletedCount === 0) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    console.error("Error in deleteReport controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
