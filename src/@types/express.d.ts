import { Request } from "express";
import { LoggedInUser } from "./loggedInUser";
declare global {
    namespace Express {
        interface Request {
            user?: LoggedInUser;
            files?: {
                image?: Express.Multer.File[];
                sscCertificate?: Express.Multer.File[];
                hscCertificate?: Express.Multer.File[];
            }

        }
    }
}