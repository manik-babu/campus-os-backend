import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import status from "http-status";
import stripe from "../../config/stripe.config";
import { env } from "../../config/env";
import { paymentService } from "./payment.service";
import AppError from "../../helper/AppError";

const webHookHandler = catchAsync(async (req: Request, res: Response) => {
    const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
    const signature = req.headers["stripe-signature"] as string;
    if (!signature) {
        throw new AppError(status.BAD_REQUEST, "Stripe signature is missing");
    }
    const event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);

    await paymentService.stripeWebHookEvent(event);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Webhook received successfully",
        data: null
    });
});

const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
    const { amount, billId, billName } = req.body;
    if (!amount || !billId || !billName) {
        throw new AppError(status.BAD_REQUEST, "Amount, Bill ID, and Bill Name are required");
    }

    const result = await paymentService.createPaymentIntent(amount, billId, billName);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: `Payment successful for ${billName}`,
        data: result
    });
});
export const paymentController = {
    webHookHandler,
    createPaymentIntent
};