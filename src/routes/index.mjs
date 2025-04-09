import { Router } from "express";

import usersRouter from "./users.mjs";
import customersRouter from "./customers.mjs";
import servicesRouter from "./services.mjs";
import jobsRouter from "./jobs.mjs";
import reportsRouter from "./reports.mjs";

import { verifyCredentials } from "../utils/middlewares.mjs";

const router = Router();

router.use("/api/user", usersRouter);
router.use("/api/customer", verifyCredentials, customersRouter);
router.use("/api/service", verifyCredentials, servicesRouter);
router.use("/api/job", verifyCredentials, jobsRouter);
router.use("/api/report", verifyCredentials, reportsRouter);

export default router;
