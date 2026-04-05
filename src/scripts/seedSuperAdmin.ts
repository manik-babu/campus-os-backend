import { UserGender, UserRole } from "../../generated/prisma/enums"
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

const seed = async () => {
    try {
        const hashedPassword = await bcrypt.hash("manik1234", 10);
        const data = {
            idNo: "100000",
            registrationNo: "REG100000",
            name: "Super Admin",
            role: UserRole.SUPER_ADMIN,
            email: "superadmin@gmail.com",
            password: hashedPassword,
            gender: UserGender.MALE
        }
        const result = await prisma.user.create({
            data: data,
        });
        console.log("Super admin creation successful!")
        console.log({
            creationResponse: result
        });

    } catch (error) {
        console.log("Super admin creation failed!")
        console.log({
            creationError: error
        });
    }
}
seed();