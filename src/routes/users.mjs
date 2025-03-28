import { Router } from "express";
// import { checkSchema, query, validationResult } from "express-validator";
// import { mockUsers } from "../utils/constants.mjs";
// import { createUserValidationSchema } from "../utils/validationSchemas.mjs";
// import { createUserHandler, getUserByIdHandler } from "../handlers/users.mjs";

const router = Router();

// router.get("/api/users/:id", getUserByIdHandler);

// router.get("/", query("filter").isNumeric(), (request, response) => {
//   const result = validationResult(request);
//   console.log(result);

//   const {
//     query: { filter, value },
//   } = request;

//   if (filter && value) {
//     return response.send(mockUsers.filter(user > user[filter].includes(value)));
//   }
//   return response.send(mockUsers);
// });

// router.post(
//   "/create",
//   checkSchema(createUserValidationSchema),
//   createUserHandler
// );

export default router;
