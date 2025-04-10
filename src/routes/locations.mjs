import { Router } from "express";
import { deleteAllLocations } from "../handlers/devFunctions.mjs";

const router = Router();

router.delete("/deleteAllLocations", deleteAllLocations);

export default router;
