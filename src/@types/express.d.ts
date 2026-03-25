import { Request } from "express";
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                name: string;
                role: string;
                email: string;
                idNo: string;
                registrationNo: string;
                status: string;
            },
            files?: {
                image?: Express.Multer.File[];
                sscCertificate?: Express.Multer.File[];
                hscCertificate?: Express.Multer.File[];
            }

        }
    }
}