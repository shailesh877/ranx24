/**
 * Pagination Helper Utility
 * Provides consistent pagination across all API endpoints
 */

/**
 * Get pagination parameters from request query
 * @param {Object} query - Express request query object
 * @returns {Object} - Pagination parameters
 */
export const getPaginationParams = (query) => {
    console.log('getPaginationParams called with:', query);
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    // Validate and cap limits
    const maxLimit = 100;
    const validatedLimit = Math.min(limit, maxLimit);

    return {
        page,
        limit: validatedLimit,
        skip
    };
};

/**
 * Create pagination metadata
 * @param {number} total - Total number of documents
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} - Pagination metadata
 */
export const createPaginationMeta = (total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
    };
};

/**
 * Create paginated response
 * @param {Array} data - Array of documents
 * @param {number} total - Total number of documents
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} - Paginated response object
 */
export const createPaginatedResponse = (data, total, page, limit) => {
    return {
        success: true,
        data,
        pagination: createPaginationMeta(total, page, limit)
    };
};

/**
 * Execute paginated query
 * @param {Model} model - Mongoose model
 * @param {Object} query - Query filter
 * @param {Object} options - Query options (sort, populate, select)
 * @param {Object} paginationParams - Pagination parameters
 * @returns {Promise<Object>} - Paginated results
 */
export const executePaginatedQuery = async (
    model,
    query = {},
    options = {},
    paginationParams
) => {
    const { skip, limit, page } = paginationParams;
    const { sort = { createdAt: -1 }, populate = '', select = '' } = options;

    // Execute query with pagination
    const [data, total] = await Promise.all([
        model
            .find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate(populate)
            .select(select)
            .lean(),
        model.countDocuments(query)
    ]);

    return createPaginatedResponse(data, total, page, limit);
};

/**
 * Middleware to add pagination to request
 * Note: This is optional - you can also just call getPaginationParams directly in controllers
 */
export const paginationMiddleware = (req, res, next) => {
    // Don't modify req directly, just call next
    // Controllers should use getPaginationParams(req.query) instead
    next();
};

export default {
    getPaginationParams,
    createPaginationMeta,
    createPaginatedResponse,
    executePaginatedQuery,
    paginationMiddleware
};
