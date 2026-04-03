import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), ".env") });
type Env = {
    NODE_ENV: string;
    PORT: number;
    DATABASE_URL: string;
    FRONTEND_URL: string;
    JWT_SECRET: string;
    BACKEND_URL: string;
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
    CLOUDINARY_FOLDER: string;
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
}

const requiredEnvVars = [
    'PORT',
    "NODE_ENV",
    'DATABASE_URL',
    "FRONTEND_URL",
    'JWT_SECRET',
    "BACKEND_URL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "CLOUDINARY_FOLDER",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET"
];
requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
        throw new Error(`Environment variable ${varName} is not set.`);
    }
});
export const env: Env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: Number(process.env.PORT) || 8080,
    DATABASE_URL: process.env.DATABASE_URL || '',
    FRONTEND_URL: process.env.FRONTEND_URL || '',
    JWT_SECRET: process.env.JWT_SECRET || '',
    BACKEND_URL: process.env.BACKEND_URL || '',
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
    CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER || '',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || ''
};