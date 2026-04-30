import express, { Router } from "express";
import { paymentController } from "./payment.controller";

//? This file is for payment related routes. For example, creating a payment intent, handling webhook events, etc.
//? /api/v1/payment/...  -> paymentRoute
const router = Router();

// router.post("/webhook", express.raw({ type: 'application/json' }), paymentController.webHookHandler);
router.post("/create-payment", paymentController.createPaymentIntent);
router.post("/admission-payment", paymentController.admissionPayment);
export const paymentRouter = router;