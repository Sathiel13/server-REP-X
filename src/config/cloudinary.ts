import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    url: process.env.CLOUDINARY_URL,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "rep-x/products",
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
        transformation: [{ width: 800, height: 800, crop: "limit" }],
    } as {
        folder: string;
        allowed_formats: string[];
        transformation: { width: number; height: number; crop: string }[];
    },
});

export { cloudinary, storage };
