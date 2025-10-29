import express from "express";
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffNotes,
  addStaffNote,
  getAllRosters,
  upsertRoster,
  deleteRoster,
  getBillingCodes,
  addOrUpdateBillingCode,
  getLabTests,
  addOrUpdateLabTest,
   getTodaysRoster,
  getLowStockItems, // <-- 1. IMPORT THIS
} from "../controllers/adminController.js";

const router = express.Router();

// --- Staff ---
router.get("/staff", getAllStaff);
router.get("/staff/:id", getStaffById);
router.post("/staff", createStaff);
router.put("/staff/:id", updateStaff);
router.delete("/staff/:id", deleteStaff);

// --- Staff Notes ---
router.get("/staff/:id/notes", getStaffNotes);
router.post("/staff/:id/notes", addStaffNote);

// --- Roster ---
router.get("/roster", getAllRosters);
router.post("/roster", upsertRoster);
router.delete("/roster/:id", deleteRoster);
router.get("/roster/today", getTodaysRoster);

// --- Settings ---
router.get("/billing", getBillingCodes);
router.post("/billing", addOrUpdateBillingCode);
router.get("/labs", getLabTests);
router.post("/labs", addOrUpdateLabTest);

// --- Inventory ---
router.get("/inventory/low-stock", getLowStockItems); // <-- 2. ADD THIS ROUTE

export default router;