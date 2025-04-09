import { Router } from "express";
import {
  createAdminUser,
  deleteAllUsers,
  loginUser,
  logoutUser,
  newAccessToken,
  retrieveUserData,
} from "../handlers/users.mjs";
import { verifyCredentials } from "../utils/middlewares.mjs";

const router = Router();

router.post("/create", createAdminUser);

router.post("/login", loginUser);

router.post("/logout", logoutUser);

router.get("/user", verifyCredentials, retrieveUserData);

router.post("/accessToken", newAccessToken);

router.delete("/allUsers", verifyCredentials, deleteAllUsers);

// router.get("/api/users/:id", getUserByIdHandler);

// router.get("/", query("filter").isNumeric(), (req, res) => {
//   const result = validationResult(req);
//   console.log(result);

//   const {
//     query: { filter, value },
//   } = req;

//   if (filter && value) {
//     return res.send(mockUsers.filter(user > user[filter].includes(value)));
//   }
//   return res.send(mockUsers);
// });

// router.post(
//   "/create",
//   checkSchema(createUserValidationSchema),
//   createUserHandler
// );

export default router;
