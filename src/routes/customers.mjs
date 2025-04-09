import { Router } from "express";
import {
  createCustomer,
  updateCustomer,
  updateCustomerFields,
} from "../handlers/customers.mjs";

const router = Router();

router.post("/customer", createCustomer);
router.put("/customer", updateCustomer);
router.patch("/customer", updateCustomerFields);

export default router;
