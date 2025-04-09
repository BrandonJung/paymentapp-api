import "dotenv/config";
import express from "express";
import routes from "./routes/index.mjs";
import cookieParser from "cookie-parser";
// import { connectToDB } from "../config.mjs";
import cors from "cors";

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

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Running on Port ${PORT}`);
  // connectToDB();
});
