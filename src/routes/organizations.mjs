import { Router } from "express";
import {
  createOrganization,
  updateOrganizationField,
} from "../handlers/organizations.mjs";
import { deleteAllOrgs } from "../handlers/devFunctions.mjs";

const router = Router();

router.post("/create", createOrganization);
router.post("/update", updateOrganizationField);

router.delete("/deleteAllOrgs", deleteAllOrgs);

export default router;
