import { Router } from "express";
import { deleteAllServices } from "../handlers/devFunctions.mjs";

const router = Router();

router.delete("/deleteAllServices", deleteAllServices);

export default router;
