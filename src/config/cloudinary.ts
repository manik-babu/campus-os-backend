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
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

export const uploadToCloudinary = async (buffer: any, cloudinaryFolderName: string): Promise<{ public_id: string; secure_url: string; }> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: cloudinaryFolderName
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
        stream.end(buffer);
    });
}
export default cloudinary;