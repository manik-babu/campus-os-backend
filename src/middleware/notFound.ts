import { Request, Response } from "express";
import status from "http-status";

const notFoundHandler = (req: Request, res: Response) => {
    res.status(status.NOT_FOUND).json({
        ok: false,
        status: status.NOT_FOUND,
        message: "Route not found",
        method: req.method,
        url: req.url
    })
};

export default notFoundHandler;