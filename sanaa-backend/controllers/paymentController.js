// sanaa-backend/controllers/paymentController.js
const pool = require('../config/db');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Example for Stripe

exports.initiatePayment = async (req, res) => {
    const { planId, courseId, paymentMethodId /* , other details */ } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ message: "User not authenticated." });
    }
    if (!planId && !courseId) {
        return res.status(400).json({ message: "Plan ID or Course ID is required." });
    }
    console.log(`Initiating payment for user ${userId}, plan ${planId}, course ${courseId}`);

    try {
        let amountToPay;
        let currency;
        let itemName;
        let itemDescription; // For more detailed logging

        if (planId) {
            const planResult = await pool.query('SELECT price, currency, name_key, description_key FROM price_plans WHERE plan_id = $1 AND is_active = TRUE', [planId]);
            if (planResult.rows.length === 0) {
                return res.status(404).json({ message: "Price plan not found or not active." });
            }
            const plan = planResult.rows[0];
            amountToPay = parseFloat(plan.price) * 100; // Stripe expects amount in cents
            currency = plan.currency.toLowerCase();
            itemName = `Subscription to plan: ${plan.name_key}`;
            itemDescription = plan.description_key || itemName;
            console.log(`Plan details fetched for payment: ID=${planId}, Amount=${amountToPay}, Currency=${currency}, Name=${plan.name_key}`); // <-- Log added
        } else if (courseId) {
            // Logic if paying for a course directly (assuming a courses table with price)
            const courseResult = await pool.query('SELECT title_key, price, currency FROM courses WHERE course_id = $1', [courseId]); // Adjust query as needed
            if (courseResult.rows.length === 0) {
                return res.status(404).json({ message: "Course not found." });
            }
            const course = courseResult.rows[0];
            amountToPay = parseFloat(course.price) * 100; // Example: assuming course has a price
            currency = course.currency.toLowerCase(); // Example: assuming course has a currency
            itemName = `Enrollment in course: ${course.title_key}`;
            itemDescription = itemName;
            console.log(`Course details fetched for payment: ID=${courseId}, Amount=${amountToPay}, Currency=${currency}, Name=${course.title_key}`); // <-- Log added
        } else {
            return res.status(400).json({ message: "Specific item for payment not clearly defined." });
        }

        // Mock Payment Intent creation
        const mockPaymentIntent = {
            client_secret: `mock_client_secret_${Date.now()}`,
            id: `pi_mock_${Date.now()}`,
            status: 'requires_action', // Or 'succeeded'
            amount: amountToPay,
            currency: currency,
            description: itemDescription
        };
        console.log("Mock Payment Intent created:", mockPaymentIntent); // <-- Log added

        // Optional: Create initial transaction record
        // const transactionResult = await pool.query(
        //     `INSERT INTO transactions (user_id, price_plan_id, course_id, amount, currency, payment_gateway, gateway_transaction_id, status, created_at, updated_at)
        //      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW(), NOW()) RETURNING transaction_id`,
        //     [userId, planId || null, courseId || null, amountToPay / 100, currency.toUpperCase(), 'mock_gateway', mockPaymentIntent.id]
        // );
        // console.log("Initial transaction record created with ID:", transactionResult.rows[0]?.transaction_id); // <-- Log added

        res.status(200).json({ clientSecret: mockPaymentIntent.client_secret, paymentIntentId: mockPaymentIntent.id });

    } catch (error) {
        console.error("Error initiating payment:", error);
        res.status(500).json({ message: error.message || "Server error initiating payment." });
    }
};

exports.handleWebhook = async (req, res) => {
    const signature = req.headers['stripe-signature']; // Example for Stripe
    let event = req.body;
    console.log("Webhook received:", event.type); // <-- Log added

    try {
        // TODO: Verify webhook signature from the payment gateway
        // For Stripe: event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);

        console.log("Webhook event data:", event.data?.object); // <-- Log added (be careful with sensitive data in logs)

        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntentSucceeded = event.data.object;
                console.log('PaymentIntent succeeded:', paymentIntentSucceeded.id); // <-- Log added
                // Update database: transaction status, enroll user, send confirmation email
                // const { userId, planId, courseId } = paymentIntentSucceeded.metadata || {};
                // console.log(`Processing successful payment for User: ${userId}, Plan: ${planId}, Course: ${courseId}`);
                break;
            case 'payment_intent.payment_failed':
                const paymentFailedIntent = event.data.object;
                console.log('PaymentIntent failed:', paymentFailedIntent.id, paymentFailedIntent.last_payment_error?.message); // <-- Log added
                // Update transaction status to 'failed'
                break;
            default:
                console.log(`Unhandled webhook event type: ${event.type}`); // <-- Log added
        }
        res.status(200).json({ received: true });
    } catch (error) {
        console.error("Webhook error:", error);
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
};