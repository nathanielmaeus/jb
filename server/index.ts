import cors from "cors";
import express from "express";
import bodyParser from "body-parser";

import items from "./endpoints/messages";

const app = express();

app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

app.use(bodyParser.json());

app.use(cors());

app.use(items);

app.listen(9003, "localhost");

console.log("server is running on port:", 9003);
