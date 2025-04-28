import { Router } from "express";
import { sendStartJobEmail } from "../handlers/email.mjs";

const router = Router();

router.post("/startJob", sendStartJobEmail);

export default router;
