import * as yup from 'yup';

// Worker Registration Validation Schema
export const workerRegistrationSchema = yup.object().shape({
    firstName: yup
        .string()
        .required('First name is required')
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name must not exceed 50 characters'),

    lastName: yup
        .string()
        .required('Last name is required')
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name must not exceed 50 characters'),

    mobileNumber: yup
        .string()
        .required('Mobile number is required')
        .matches(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits'),

    state: yup
        .string()
        .required('State is required'),

    district: yup
        .string()
        .required('District is required'),

    city: yup
        .string()
        .required('City is required'),

    aadhaarNumber: yup
        .string()
        .required('Aadhaar number is required')
        .matches(/^[0-9]{12}$/, 'Aadhaar number must be exactly 12 digits'),

    panNumber: yup
        .string()
        .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format')
        .optional(),
});

// OTP Validation Schema
export const otpSchema = yup.object().shape({
    otp: yup
        .string()
        .required('OTP is required')
        .matches(/^[0-9]{4}$/, 'OTP must be exactly 4 digits'),
});

// Mobile Number Validation Schema
export const mobileSchema = yup.object().shape({
    mobileNumber: yup
        .string()
        .required('Mobile number is required')
        .matches(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits'),
});

// Payment Amount Validation Schema
export const paymentAmountSchema = yup.object().shape({
    amount: yup
        .number()
        .required('Amount is required')
        .positive('Amount must be positive')
        .min(1, 'Amount must be at least ₹1'),
});

// Booking Reschedule Validation Schema
export const rescheduleSchema = yup.object().shape({
    requestedDate: yup
        .date()
        .required('Date is required')
        .min(new Date(), 'Date must be in the future'),

    requestedTime: yup
        .string()
        .required('Time is required'),

    reason: yup
        .string()
        .required('Reason is required')
        .min(10, 'Reason must be at least 10 characters')
        .max(200, 'Reason must not exceed 200 characters'),
});

// Helper function to validate data
export const validateData = async <T>(schema: yup.Schema<T>, data: any): Promise<{ valid: boolean; errors?: string }> => {
    try {
        await schema.validate(data, { abortEarly: false });
        return { valid: true };
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return {
                valid: false,
                errors: error.errors.join(', '),
            };
        }
        return {
            valid: false,
            errors: 'Validation failed',
        };
    }
};
