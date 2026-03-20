import express from "express";
const router = express.Router();
import { default as authCtrl } from "../controllers/auth.js";

router.post("/auth/signIn", authCtrl.signIn);

router.post("/auth/getNewAccessToken", authCtrl.getNewAccessToken);

export default router;
