import { UserGender, UserRole } from "../../generated/prisma/enums"
import { env } from "../config/env";

const seed = async () => {
    try {
        const data = {
            name: "Super Admin",
            role: UserRole.SUPER_ADMIN,
            email: "superadmin@gmail.com",
            password: "manik1234",
            gender: UserGender.MALE
        }
        const response = await fetch(`${env.BACKEND_URL}/api/v1/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Origin: env.FRONTEND_URL
            },
            body: JSON.stringify({
                userData: data
            })
        });
        const result = await response.json();
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