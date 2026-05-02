import { LoggedInUser } from "../@types/loggedInUser";
import { env } from "../config/env";
import transporter from "../lib/nodeMailer";
import ejs from "ejs";
import path from "path";

export const sendRegistrationEmail = async (user: {
    name: string;
    email: string;
    role: string;
    idNo: string;
    registrationNo: string;
}) => {
    try {
        // Path to the EJS template
        const templatePath = path.join(
            process.cwd(),
            "src",
            "templates",
            "registration.ejs"
        );

        // Data to pass to the template
        const emailData = {
            name: user.name,
            email: user.email,
            role: user.role,
            idNo: user.idNo,
            registrationNo: user.registrationNo,
            password: user.email, // Password is email as per requirement
        };

        // Render the EJS template
        const html = await ejs.renderFile(templatePath, emailData);

        // Send the email
        await transporter.sendMail({
            from: `"Uttara University" <${env.APP_EMAIL}>`,
            to: user.email,
            subject: "Welcome to Uttara University - Your Account is Ready",
            html: html,
        });

        console.log(`Registration email sent to ${user.email}`);
    } catch (error) {
        console.error("Error sending registration email:", error);
        throw error;
    }
}