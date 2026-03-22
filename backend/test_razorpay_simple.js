import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

console.log(`Key ID: ${key_id ? key_id.substring(0, 5) + '...' : 'Missing'}`);
console.log(`Key Secret: ${key_secret ? 'Present' : 'Missing'}`);

if (!key_id || !key_secret) {
    console.error('Razorpay keys are missing in .env');
    process.exit(1);
}

const razorpay = new Razorpay({
    key_id: key_id,
    key_secret: key_secret,
});

const createOrder = async () => {
    try {
        const options = {
            amount: 50000,  // amount in the smallest currency unit (500 INR)
            currency: "INR",
            receipt: "order_rcptid_11",
            payment_capture: 1
        };
        const order = await razorpay.orders.create(options);
        console.log('Order created successfully:', order.id);
    } catch (error) {
        console.error('Error creating order:', error);
    }
};

createOrder();
