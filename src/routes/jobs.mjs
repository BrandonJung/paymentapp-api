import { Router } from "express";
import {
  archiveJob,
  createJob,
  invoiceJob,
  payJob,
  retrieveActiveJobs,
  retrieveExistingData,
  retrieveJob,
  startJob,
} from "../handlers/jobs.mjs";
import { deleteAllJobs } from "../handlers/devFunctions.mjs";

const router = Router();

router.post("/create", createJob);
router.get("/existingData", retrieveExistingData);
router.get("/jobs", retrieveActiveJobs);
router.get("/", retrieveJob);
router.post("/start", startJob);
router.post("/invoice", invoiceJob);
router.post("/receipt", payJob);
router.post("/archive", archiveJob);

router.delete("/deleteAllJobs", deleteAllJobs);

export default router;
