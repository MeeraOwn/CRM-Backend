import express from "express";
import { verifyToken } from "../utilities/middleware.js";
import crmCtrl from "../controllers/crm.js";

const router = express.Router();

// Appointment List (filtered by art='appointment' and completed flag)
router.get("/appointments", verifyToken, crmCtrl.getAppointments);
router.post("/history/:historyId/complete", verifyToken, crmCtrl.completeAppointment);

// Customer Detail
router.get("/customers/:customerId", verifyToken, crmCtrl.getCustomerById);
router.get("/customers/:customerId/history", verifyToken, crmCtrl.getCustomerHistory);

// History CRUD
router.post("/customers/:customerId/history", verifyToken, crmCtrl.createHistoryForCustomer);
router.put("/history/:historyId", verifyToken, crmCtrl.updateHistoryById);
router.delete("/history/:historyId", verifyToken, crmCtrl.deleteHistoryById);

// Admin can create new customers; staff is read-only (enforced in controller)
router.post("/customers", verifyToken, crmCtrl.createCustomer);

export default router;

