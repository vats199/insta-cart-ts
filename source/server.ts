import * as dotenv from "dotenv";
import express from "express";
const PORT = process.env.PORT || 3000;

async function startServer() {
  const app = express();
  dotenv.config();
  await require("./loaders").default({ expressApp: app });

  app.listen(PORT, (_port: void) => {
    console.log("Server is running on port : " + PORT);
  });
}

startServer();
