import { env } from "../config/env";

export const getPublicIdFromUrl = (url: string): string => {
    const baseFolderName = env.CLOUDINARY_FOLDER;
    const parts = url.split(`/${baseFolderName}/`)[1] as string;
    const partWithoutExtension = parts.split(".").slice(0, -1).join(".");

    const finalPart = `${baseFolderName}/${partWithoutExtension}`;
    return finalPart;
}