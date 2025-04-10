import { Router } from "express";
import {
  retrieveCustomer,
  retrieveCustomers,
  updateCustomer,
  updateCustomerFields,
} from "../handlers/customers.mjs";
import { deleteAllCustomers } from "../handlers/devFunctions.mjs";

const router = Router();

router.get("/customer", retrieveCustomer);
router.get("/customers", retrieveCustomers);
router.put("/customer", updateCustomer);
router.patch("/customer", updateCustomerFields);

router.delete("/deleteAllCustomers", deleteAllCustomers);

export default router;
