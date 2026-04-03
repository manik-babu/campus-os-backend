import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import status from "http-status";

const webHookHandler = catchAsync(async (req: Request, res: Response) => {
    console.log(req.body);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Webhook received successfully",
        data: null
    });
});

export const paymentController = {
    webHookHandler
};