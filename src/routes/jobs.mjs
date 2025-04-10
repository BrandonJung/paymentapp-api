import { Router } from "express";
import { createJob } from "../handlers/jobs.mjs";
import { deleteAllJobs } from "../handlers/devFunctions.mjs";

const router = Router();

router.post("/create", createJob);

router.delete("/deleteAllJobs", deleteAllJobs);

export default router;
