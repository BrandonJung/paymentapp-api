import { Router } from "express";
import usersRouter from "./users.mjs";
import customersRouter from "./customers.mjs";
import { verifyCredentials } from "../utils/middlewares.mjs";

const router = Router();

router.use("/api/user", usersRouter);
router.use("/api/customer", verifyCredentials, customersRouter);

export default router;
