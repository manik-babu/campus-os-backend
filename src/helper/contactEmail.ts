import { env } from "../config/env";
import transporter from "../lib/nodeMailer";
import ejs from "ejs";
import path from "path";

export const sendContactEmail = async (user: {
    name: string;
    email: string;
    message: string;
}) => {
    try {
        // Path to the EJS template
        const templatePath = path.join(
            process.cwd(),
            "src",
            "templates",
            "contact_email.ejs"
        );

        // Data to pass to the template
        const emailData = {
            name: user.name,
            email: user.email,
            message: user.message,
        };

        // Render the EJS template
        const html = await ejs.renderFile(templatePath, emailData);

        // Send the email
        await transporter.sendMail({
            from: `"Uttara University" <${env.APP_EMAIL}>`,
            to: "manikbabu.dev@gmail.com",
            subject: "Contact Us Submission",
            html: html,
        });

        console.log(`Contact email sent to ${user.email}`);
    } catch (error) {
        console.error("Error sending contact email:", error);
        throw error;
    }
}