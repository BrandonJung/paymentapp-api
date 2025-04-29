import { Router } from "express";
import {
  createJob,
  retrieveActiveJobs,
  retrieveExistingData,
  retrieveJob,
} from "../handlers/jobs.mjs";
import { deleteAllJobs } from "../handlers/devFunctions.mjs";

const router = Router();

router.post("/create", createJob);
router.get("/existingData", retrieveExistingData);
router.get("/jobs", retrieveActiveJobs);
router.get("/", retrieveJob);

router.delete("/deleteAllJobs", deleteAllJobs);

export default router;
