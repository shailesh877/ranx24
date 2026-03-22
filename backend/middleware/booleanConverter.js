/**
 * Express Middleware to automatically convert boolean strings to actual booleans
 * This prevents MongoDB casting errors when boolean fields receive string values
 * 
 * Usage: Add this middleware before your routes
 * app.use(booleanConverter);
 */

import { toBoolean } from '../utils/typeConverter.js';

/**
 * List of fields that should be converted to boolean
 * Add any new boolean fields here
 */
const BOOLEAN_FIELDS = [
    'isActive',
    'isDefault',
    'isYcCoinsCredited',
    'read',
    'verified',
    'enabled',
    'published',
    'featured',
];

/**
 * Middleware to convert string booleans to actual booleans in request body
 */
export const booleanConverter = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        convertBooleans(req.body);
    }
    next();
};

/**
 * Recursively convert boolean fields in an object
 */
function convertBooleans(obj) {
    if (!obj || typeof obj !== 'object') return;

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];

            // Convert if it's a known boolean field
            if (BOOLEAN_FIELDS.includes(key)) {
                obj[key] = toBoolean(value);
            }
            // Recursively handle nested objects
            else if (typeof value === 'object' && value !== null) {
                if (Array.isArray(value)) {
                    value.forEach(item => convertBooleans(item));
                } else {
                    convertBooleans(value);
                }
            }
        }
    }
}

export default booleanConverter;
