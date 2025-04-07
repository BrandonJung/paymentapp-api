import { Router } from "express";
import usersRouter from "./users.mjs";

const router = Router();

router.use("/api/user", usersRouter);

export default router;
