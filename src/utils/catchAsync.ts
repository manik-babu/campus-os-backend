import { NextFunction, Request, Response } from "express";

const catchAsync = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            fn(req, res, next);
        } catch (error: any) {
            next(error);
        }
    };
};

export default catchAsync;