import { Router } from "express";
import usersRouter from "./users.mjs";
import authRouter from "./auth.mjs";

const router = Router();

router.use("/api/user", usersRouter);
router.use("/api/auth", authRouter);

export default router;
