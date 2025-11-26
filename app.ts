import express from "express";
import cors from "cors";

import { APP_BASE_URL, APP_PORT, MONGODB_URI } from "./config/env.config.js";
import v1Router from "./routes/index.routes.js";
import connectToDatabase from "./database/mongodb.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { CORS_OPTIONS } from "./config/cors.config.js";

const app = express();
app.use(cors(CORS_OPTIONS));

const PORT = APP_PORT;

// enable express to parse json requests
app.use(express.json());

// central router
app.use(APP_BASE_URL || "", v1Router);

app.use(errorMiddleware);

app.listen(PORT, async () => {
  await connectToDatabase(MONGODB_URI as string);
  console.log(`Listening to PORT: ${PORT}`);
});
