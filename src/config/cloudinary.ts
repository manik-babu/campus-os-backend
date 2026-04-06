import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';
import multer from 'multer';

cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB,
});
interface UploadToCloudinaryOptions {
    file: Express.Multer.File;
    folder: string;
    resource_type?: "auto" | "image" | "video" | "raw" | undefined;
}

export const uploadToCloudinary = async (options: UploadToCloudinaryOptions): Promise<{ public_id: string; secure_url: string; }> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: options.folder,
                resource_type: options.resource_type || "auto",
                public_id: options.file.originalname.split('.').slice(0, -1).join('.') + "_" + new Date().getTime() + Math.floor(Math.random() * 10000), // Use original file name without extension as public_id,
                use_filename: true, // use the original file name as the public_id,
                unique_filename: true, // Ensure the file name is unique by adding a random string,
            },
            (error, result) => {
                if (error) {
                    reject(error);
                }
                else if (result) {
                    resolve(result);
                }
            }
        );
        stream.end(options.file.buffer);
    });
}
export default cloudinary;