import Stripe from "stripe"
import { prisma } from "../../lib/prisma";


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
            // Handle successful checkout session completion
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
};

export const paymentService = {
    stripeWebHookEvent
};