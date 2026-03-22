/**
 * Environment Variable Validation
 * Ensures all required environment variables are set before starting the server
 */

export const validateEnv = () => {
    const required = [
        'MONGO_URI',
        'JWT_SECRET',
        'RAZORPAY_KEY_ID',
        'RAZORPAY_KEY_SECRET'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:');
        missing.forEach(key => console.error(`   - ${key}`));
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Validate JWT_SECRET length
    if (process.env.JWT_SECRET.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters long for security');
    }

    // Validate NODE_ENV
    const validEnvs = ['development', 'production', 'test'];
    const nodeEnv = process.env.NODE_ENV || 'development';
    if (!validEnvs.includes(nodeEnv)) {
        console.warn(`⚠️  Invalid NODE_ENV: ${nodeEnv}. Using 'development' as default.`);
    }

    // Production-specific validations
    if (nodeEnv === 'production') {
        const productionRequired = ['CLIENT_URL', 'ADMIN_URL'];
        const productionMissing = productionRequired.filter(key => !process.env[key]);

        if (productionMissing.length > 0) {
            console.warn('⚠️  Missing recommended production environment variables:');
            productionMissing.forEach(key => console.warn(`   - ${key}`));
        }

        // Warn if using test Razorpay keys in production
        if (process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test_')) {
            console.warn('⚠️  WARNING: Using Razorpay TEST keys in production!');
            // throw new Error('Cannot use Razorpay test keys in production environment');
        }
    }

    console.log('✅ Environment variables validated successfully');
    console.log(`   Environment: ${nodeEnv}`);
    console.log(`   MongoDB: ${process.env.MONGO_URI?.replace(/\/\/.*@/, '//<credentials>@')}`);
    console.log(`   JWT Secret: ${process.env.JWT_SECRET.substring(0, 8)}...`);
};

export default validateEnv;
