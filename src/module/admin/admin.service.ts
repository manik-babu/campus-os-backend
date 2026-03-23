import { Batch } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createBatch = async (payload: Omit<Batch, "id" | "createdAt" | "updatedAt">) => {
    const batch = await prisma.batch.create({
        data: payload,
    });
    return batch;
}

export const adminService = {
    createBatch,
};