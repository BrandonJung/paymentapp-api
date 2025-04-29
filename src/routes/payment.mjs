import { Router } from "express";
import { createPaymentIntent } from "../handlers/payment.mjs";

const router = Router();

router.post("/createIntent", createPaymentIntent);

export default router;
