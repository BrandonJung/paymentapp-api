import { Router } from "express";
import {
  createUser,
  deleteAllUsers,
  getUserById,
  loginUser,
  logoutUser,
  newAccessToken,
  retrieveUserData,
} from "../handlers/users.mjs";
import { verifyCredentials } from "../utils/middlewares.mjs";

const router = Router();

router.post("/create", createUser);

router.post("/login", loginUser);

router.post("/logout", logoutUser);

router.get("/retrieveUserData", verifyCredentials, retrieveUserData);

router.post("/newAccessToken", newAccessToken);

router.delete("/deleteAllUsers", deleteAllUsers);

router.get("/", (req, res) => {
  console.log(req.session.id);
  req.sessionStore.get(req.session.id, (err, sessionData) => {
    if (err) {
      console.log(err);
      throw err;
    }
    console.log("Session store data: ", sessionData);
  });
  return res.send({ message: "Session data" });
});

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
