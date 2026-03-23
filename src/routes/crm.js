import express from "express";
import { verifyToken } from "../utilities/middleware.js";
import crmCtrl from "../controllers/crm.js";

const router = express.Router();

router.get("/appointments", verifyToken, crmCtrl.getAppointments);
router.post(
  "/history/:historyId/complete",
  verifyToken,
  crmCtrl.completeAppointment,
);

router.get("/customers/:customerId", verifyToken, crmCtrl.getCustomerById);
router.get(
  "/customers/:customerId/history",
  verifyToken,
  crmCtrl.getCustomerHistory,
);

router.post(
  "/customers/:customerId/history",
  verifyToken,
  crmCtrl.createHistoryForCustomer,
);
router.put("/history/:historyId", verifyToken, crmCtrl.updateHistoryById);
router.delete("/history/:historyId", verifyToken, crmCtrl.deleteHistoryById);

router.post("/customers", verifyToken, crmCtrl.createCustomer);

export default router;
