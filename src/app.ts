import express, { Request, Response } from 'express';
import apiRouter from './routes';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';

const app = express();

dotenv.config({ path: path.join(process.cwd(), '.env') });
app.use(cors({
    origin: [process.env.FRONTEND_URL!],
    credentials: true
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", apiRouter);

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        ok: true,
        message: "CampusOS Backend API is running successfully.",
        version: "1.0.0",
        time: new Date().toISOString()
    });
});
app.use((req: Request, res: Response) => {
    res.status(404).json({
        ok: false,
        status: 404,
        message: "Route not found",
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString()
    })

})

export default app;