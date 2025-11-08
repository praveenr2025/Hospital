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
        getAllAppointments,
        getAppointmentsByPatient,
        getLabOrdersByPatient,
        getInvoicesByPatient,
        getGrowthByPatient,
        addGrowthRecord,
        updateGrowthRecordStatus  ,
        createConsultation,
        getConsultationsByPatient,
        addVaccinationRecord,
        getPatientVaccinations,
        getPatientMilestones,
        updatePatientMilestone,
        addMilestone,
      
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
router.get("/patients/:id/appointments", getAppointmentsByPatient);
router.get("/patients/:id/invoices", getInvoicesByPatient);
router.get("/patients/:id/growth", getGrowthByPatient);
router.post("/patients/:id/growth", addGrowthRecord);
router.put("/growth/:id/status", updateGrowthRecordStatus);
router.post("/consultations", createConsultation);
router.get("/patients/:id/consultations", getConsultationsByPatient);
router.post("/patients/:id/vaccinations", addVaccinationRecord);
router.get("/patients/:id/vaccinations", getPatientVaccinations);
router.get("/patients/:id/milestones", getPatientMilestones);
router.put("/patients/:id/milestones", updatePatientMilestone);
router.post("/patients/:id/addMilestone", addMilestone);
router.get("/patients/:id/lab-orders", getLabOrdersByPatient);

export default router;
