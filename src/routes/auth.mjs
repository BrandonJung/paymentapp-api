import { Router } from "express";

const router = Router();

// router.get("/", (request, response) => {
//   console.log(request.headers.cookies);
//   console.log(request.cookies);
//   // assumming cookie is { hello: world }
//   if (request.cookies.hello && request.cookies.hello === "world") {
//     return response.send([{ id: 2 }, { id: 3 }]);
//   }
//   return response
//     .status(403)
//     .send({ message: "Sorry, you need the correct cookie" });
// });

// router.post("/", (request, response) => {
//   // Validate request body first
//   const {
//     body: { username, password },
//   } = request;
//   const findUser = mockUsers.find((user) => user.username === username);
//   if (!findUser || findUser.password !== password) {
//     return response.status(401).send({ message: "Bad credentials" });
//   }

//   request.session.user = findUser;
//   return response.status(200).send(findUser);
// });

// router.get("/status", (request, response) => {
//   request.sessionStore.get(request.session.id, (err, session) => {
//     console.log(session);
//   });
//   return request.session.user
//     ? response.status(200).send(request.session.user)
//     : response.status(401).send({ message: "Not Authenticated" });
// });

export default router;
