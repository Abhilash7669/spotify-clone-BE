import { CorsOptions } from "cors";

export const CORS_OPTIONS: CorsOptions = {
  // @ts-ignore
  origin: ["http://localhost:3000", "http://localhost:5173" ],
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
