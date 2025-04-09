import jwt from "jsonwebtoken";
// // Setting middleware globally or pass function as 2nd argument before (req, res), must invoke before wanted end points
// // Can be passed into a router to be called during specific routes
// const loggingMiddleware = (req, res, next) => {
//   console.log(`${req.method} - ${req.url}`);
//   next();
// };

// export const checkAuthMiddleware = (req, res, next) => {
//   if (!req.headers.authorization) {
//     return res.status(403).json({ error: "No credentials sent!" });
//   }
//   console.log("User authenticated");
//   req.setHeader("Access-Control-Allow-Credentials", true);
//   req.setHeader(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
//   next();
// };

export const verifyCredentials = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log("Verifying credentials", authHeader);
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(401).send({ message: "Token not valid" });
      }
      console.log("Verify Credentials: ", user);
      req.userId = user.id;
      next();
    });
  } else {
    return res.status(402).send({ message: "You are not authorized" });
  }
};
