import { config } from "dotenv";

config({
  path: `.env.${
    process.env.NODE_ENV === "development" ? "local" : "production"
  }`,
});

// export env variables here
export const {
  APP_PORT,
  APP_BASE_URL,
  MONGODB_URI,
  JWT_SECRET,
  CLOUDINARY_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_SECRET,
} = process.env;
