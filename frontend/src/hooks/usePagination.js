import { useState, useEffect } from 'react';

/**
 * Pagination hook for managing paginated data
 * @param {Function} fetchFunction - Function to fetch data (receives page, limit)
 * @param {number} initialLimit - Initial items per page
 * @returns {Object} - Pagination state and controls
 */
export const usePagination = (fetchFunction, initialLimit = 10) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit] = useState(initialLimit);

    const fetchData = async (pageNum = page) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetchFunction(pageNum, limit);

            if (response.data) {
                setData(response.data);
                setTotalPages(response.pagination?.totalPages || 1);
                setTotalItems(response.pagination?.totalItems || 0);
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch data');
            console.error('Pagination error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page]);

    const goToPage = (pageNum) => {
        if (pageNum >= 1 && pageNum <= totalPages) {
            setPage(pageNum);
        }
    };

    const nextPage = () => {
        if (page < totalPages) {
            setPage(prev => prev + 1);
        }
    };

    const prevPage = () => {
        if (page > 1) {
            setPage(prev => prev - 1);
        }
    };

    const refresh = () => {
        fetchData(page);
    };

    return {
        data,
        loading,
        error,
        page,
        totalPages,
        totalItems,
        limit,
        goToPage,
        nextPage,
        prevPage,
        refresh,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
    };
};

export default usePagination;
