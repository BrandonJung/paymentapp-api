import { Router } from "express";
import {
  archiveJob,
  createJob,
  emailUserJob,
  payJobInvoice,
  retrieveActiveJobs,
  retrieveExistingData,
  sendJobInvoice,
} from "../handlers/jobs.mjs";
import { deleteAllJobs } from "../handlers/devFunctions.mjs";

const router = Router();

router.post("/create", createJob);
router.get("/existingData", retrieveExistingData);
router.get("/jobs", retrieveActiveJobs);
router.post("/emailUser", emailUserJob);
router.post("/sendInvoice", sendJobInvoice);
router.post("/payInvoice", payJobInvoice);
router.post("archive", archiveJob);

router.delete("/deleteAllJobs", deleteAllJobs);

export default router;
