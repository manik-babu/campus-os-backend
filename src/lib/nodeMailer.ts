import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
    host: env.APP_HOST,
    port: 587,
    secure: false,
    auth: {
        user: env.APP_EMAIL,
        pass: env.APP_PASSWORD
    },
});
export default transporter;