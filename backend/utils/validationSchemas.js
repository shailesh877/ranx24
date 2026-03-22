import Joi from 'joi';

export const registerSchema = Joi.object({
    name: Joi.string().required().messages({
        'any.required': 'Name is required',
        'string.empty': 'Name cannot be empty'
    }),
    email: Joi.string().email().allow('').optional().messages({
        'string.email': 'Please provide a valid email address'
    }),
    phone: Joi.string().length(10).pattern(/^[0-9]+$/).required().messages({
        'string.length': 'Phone number must be exactly 10 digits',
        'string.pattern.base': 'Phone number must contain only digits',
        'any.required': 'Phone number is required'
    }),
    userType: Joi.string().valid('user', 'worker', 'admin').default('user'),
    password: Joi.string().min(6).optional(), // Optional as we are using OTP mostly
});

export const loginSchema = Joi.object({
    phone: Joi.string().length(10).pattern(/^[0-9]+$/).required().messages({
        'string.length': 'Phone number must be exactly 10 digits',
        'string.pattern.base': 'Phone number must contain only digits',
        'any.required': 'Phone number is required'
    }),
    otp: Joi.string().length(4).pattern(/^[0-9]+$/).required().messages({
        'string.length': 'OTP must be exactly 4 digits',
        'string.pattern.base': 'OTP must contain only digits',
        'any.required': 'OTP is required'
    })
});

export const sendOtpSchema = Joi.object({
    phone: Joi.string().length(10).pattern(/^[0-9]+$/).required().messages({
        'string.length': 'Phone number must be exactly 10 digits',
        'string.pattern.base': 'Phone number must contain only digits',
        'any.required': 'Phone number is required'
    })
});

export const bookingSchema = Joi.object({
    workerId: Joi.string().required(),
    category: Joi.string().required(),
    service: Joi.string().required(),
    description: Joi.string().allow('').optional(),
    bookingType: Joi.string().valid('full-day', 'half-day', 'multiple-days').default('full-day'),
    days: Joi.number().min(1).default(1),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    bookingDate: Joi.date().required(),
    bookingTime: Joi.string().required(),
    address: Joi.object({
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        zipCode: Joi.string().required()
    }).required(),
    totalPrice: Joi.number().required(),
    finalPrice: Joi.number().required(),
    price: Joi.number().required(),
    couponCode: Joi.string().allow('').optional(),
    coinsUsed: Joi.number().optional(),
    paymentMethod: Joi.string().optional()
});

export const supportTicketSchema = Joi.object({
    subject: Joi.string().required(),
    message: Joi.string().required(),
    userType: Joi.string().valid('user', 'worker').required()
});
