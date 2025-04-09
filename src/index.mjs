import "dotenv/config";
import express from "express";
import routes from "./routes/index.mjs";
import cookieParser from "cookie-parser";
// import { connectToDB } from "../config.mjs";
import cors from "cors";
import { AppError } from "./utils/errors.mjs";

const app = express();

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use(routes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err instanceof AppError) {
    return res.status(err.statusCode).send({ message: err.message });
  }
  return res
    .status(500)
    .send({ message: err.message || "Something went wrong" });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Running on Port ${PORT}`);
  // connectToDB();
});
