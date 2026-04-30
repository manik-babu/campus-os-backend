import Stripe from "stripe"
import { prisma } from "../../lib/prisma";

import { v7 as uuidv7 } from "uuid";
import { PaymentStatus } from "../../../generated/prisma/enums";
import { env } from "../../config/env";
import stripe from "../../config/stripe.config";

const stripeWebHookEvent = async (event: Stripe.Event) => {
    //TODO: Handle the event and update the database accordingly
    const existingEvent = await prisma.payment.findFirst({
        where: {
            stripeEventId: event.id
        }
    });

    if (existingEvent) {
        console.log(`Duplicate event received: ${event.id}`);
        return;
    }
    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;

            const paymentId = session.metadata?.paymentId;
            if (!paymentId) {
                console.error("Payment ID not found in session metadata");
                return;
            }
            await prisma.payment.update({
                where: {
                    id: paymentId
                },
                data: {
                    status: PaymentStatus.PAID,
                    stripeEventId: event.id
                }
            });
            break;

        }
        case "checkout.session.expired": {
            // Handle expired checkout session
        }
        case "payment_intent.succeeded": {
            // Handle successful payment intent
        }
        case "payment_intent.payment_failed": {
            // Handle failed payment intent
        }
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }
    return null;
};
const createPaymentIntent = async (amount: number, billId: string, billName: string) => {
    const semester = await prisma.bill.findUnique({
        where: {
            id: billId
        },
        select: {
            semester: {
                select: {
                    name: true
                }
            }
        }
    });
    if (!semester) {
        throw new Error("Bill not found");
    }
    const semesterName = semester.semester.name;
    const result = await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.create({
            data: {
                billId,
                amount,
                status: PaymentStatus.PENDING,
                transactionId: String(uuidv7())
            }
        });
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'bdt',
                        product_data: {
                            name: billName,
                            description: `Payment for ${billName} for ${semesterName} semester`
                        },
                        unit_amount: amount * 100, // Stripe expects amount in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${env.FRONTEND_URL}/student/payments/status?success=true`,
            cancel_url: `${env.FRONTEND_URL}/student/payments/status?success=false`,
            metadata: {
                paymentId: payment.id
            }
        });
        return session;
    });
    return {
        url: result.url
    };
}
export const paymentService = {
    stripeWebHookEvent,
    createPaymentIntent
};