import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.config";

cloudinary.config({
  cloud_name: env.CLOUDINARY_NAME || Bun.env.CLOUDINARY_NAME,
  api_key: env.CLOUDINARY_API_KEY || Bun.env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET || Bun.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;
