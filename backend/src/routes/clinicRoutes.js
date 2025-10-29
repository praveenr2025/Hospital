import express from "express";
import {
  getAllDoctors,
  getAllPatients,
  createPatient,
  getAllInventory,
  addInventory,
  getAllVaccines,
  getAllInvoices,
  createInvoice,
  getAllLabOrders, 
  createLabOrder, 
  updateLabReport,
   getAllReferrals, 
   createReferral,
   getTodaysAppointments, 
   createAppointment,
   getAllAppointments
} from "../controllers/clinicController.js";


const router = express.Router();

router.get("/doctors", getAllDoctors);
router.get("/patients", getAllPatients);
router.post("/patients", createPatient);
router.get("/inventory", getAllInventory);
router.post("/inventory", addInventory);
router.get("/vaccines", getAllVaccines);
router.get("/invoices", getAllInvoices);
router.post("/invoices", createInvoice);
router.get("/lab-orders", getAllLabOrders);
router.post("/lab-orders", createLabOrder);
router.put("/lab-orders/:id/report", updateLabReport);
router.get("/referrals", getAllReferrals);
router.post("/referrals", createReferral);
router.post("/appointments", createAppointment);
router.get("/appointments", getAllAppointments);
router.get("/appointments/today",getTodaysAppointments);




export default router;
