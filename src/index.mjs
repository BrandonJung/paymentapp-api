import "dotenv/config";
import express from "express";
import routes from "./routes/index.mjs";
import cookieParser from "cookie-parser";
import session from "express-session";
import { connectToDB } from "../config.mjs";

const app = express();

app.use(express.json());
app.use(routes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Running on Port ${PORT}`);
  connectToDB();
  console.log(`Connected to db`);
});

// app.use(cookieParser());
// app.use(
//   session({
//     secret: "replace this with actual secret",
//     saveUninitialized: false,
//     resave: false,
//     cookie: {
//       maxAge: 60000 * 60 * 24, // This is one day, time in milliseconds
//     },
//   })
// );

// app.get("/", (request, response) => {
//   console.log(request.session);
//   console.log(request.session.id);
//   request.session.visited = true;
//   response.cookie("hello", "world", { maxAge: 60000, signed: true });
//   response.status(201).send({ message: "hello world" });
// });
