/**
 * Utility functions for data type conversions
 * Prevents type casting errors in MongoDB
 */

/**
 * Converts various boolean representations to actual boolean
 * Handles: true, false, "true", "false", "1", "0", 1, 0
 * @param {any} value - The value to convert
 * @returns {boolean} - The boolean value
 */
export const toBoolean = (value) => {
    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'string') {
        const lowerValue = value.toLowerCase().trim();
        return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
    }

    if (typeof value === 'number') {
        return value !== 0;
    }

    return Boolean(value);
};

/**
 * Safely converts a value to a number
 * @param {any} value - The value to convert
 * @param {number} defaultValue - Default value if conversion fails
 * @returns {number} - The number value
 */
export const toNumber = (value, defaultValue = 0) => {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
};

/**
 * Safely parses JSON string
 * @param {string} value - The JSON string to parse
 * @param {any} defaultValue - Default value if parsing fails
 * @returns {any} - The parsed value or default
 */
export const safeJSONParse = (value, defaultValue = null) => {
    try {
        return JSON.parse(value);
    } catch (error) {
        return defaultValue;
    }
};

/**
 * Converts string to array if needed
 * @param {any} value - The value to convert
 * @returns {Array} - The array value
 */
export const toArray = (value) => {
    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [value];
        } catch {
            return [value];
        }
    }

    return value ? [value] : [];
};

export default {
    toBoolean,
    toNumber,
    safeJSONParse,
    toArray
};
