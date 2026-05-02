import { env } from "../config/env";
import transporter from "../lib/nodeMailer";
import ejs from "ejs";
import path from "path";

export const sendResetPasswordEmail = async (user: {
    otp: string;
    name: string;
    email: string;
}) => {
    try {
        // Path to the EJS template
        const templatePath = path.join(
            process.cwd(),
            "src",
            "templates",
            "reset_password.ejs"
        );

        // Render the EJS template
        const html = await ejs.renderFile(templatePath, user);

        // Send the email
        await transporter.sendMail({
            from: `"Uttara University" <${env.APP_EMAIL}>`,
            to: user.email,
            subject: "Password Reset Request - Your OTP is Here",
            html: html,
        });

        console.log(`Password reset email sent to ${user.email}`);
    } catch (error) {
        console.error("Error sending password reset email:", error);
        throw error;
    }
}