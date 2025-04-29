import { Router } from "express";
import { sendInvoiceEmail, sendStartJobEmail } from "../handlers/email.mjs";

const router = Router();

router.post("/startJob", sendStartJobEmail);
router.post("/sendInvoice", sendInvoiceEmail);

export default router;
