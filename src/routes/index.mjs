import { Router } from "express";

import usersRouter from "./users.mjs";
import customersRouter from "./customers.mjs";
import servicesRouter from "./services.mjs";
import jobsRouter from "./jobs.mjs";
import reportsRouter from "./reports.mjs";
import locationsRouter from "./locations.mjs";
import organizationsRouter from "./organizations.mjs";
import emailRouter from "./email.mjs";
import paymentRouter from "./payment.mjs";

import { verifyCredentials } from "../utils/middlewares.mjs";

const router = Router();

router.use("/api/user", usersRouter);
router.use("/api/customer", verifyCredentials, customersRouter);
router.use("/api/service", verifyCredentials, servicesRouter);
router.use("/api/job", verifyCredentials, jobsRouter);
router.use("/api/report", verifyCredentials, reportsRouter);
router.use("/api/location", verifyCredentials, locationsRouter);
router.use("/api/organization", verifyCredentials, organizationsRouter);
router.use("/api/email", verifyCredentials, emailRouter);
router.use("/api/payment", verifyCredentials, paymentRouter);

export default router;
