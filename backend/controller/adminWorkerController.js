// Admin Worker Controller - Manage worker services, pricing, and city assignments
// ---------------------------------------------------------------
// This controller provides admin-only endpoints to edit worker details,
// add/update/remove service pricing, and assign/remove cities where a
// worker can operate.

import Worker from '../model/Worker.js';
import City from '../model/City.js'; // Assuming a City model exists
import mongoose from 'mongoose';
import { toBoolean } from '../utils/typeConverter.js';


// Helper to find worker and ensure existence
const findWorker = async (workerId) => {
    const worker = await Worker.findById(workerId);
    if (!worker) {
        const err = new Error('Worker not found');
        err.status = 404;
        throw err;
    }
    return worker;
};

// @desc    Update basic worker details (name, phone, status, etc.)
// @route   PUT /api/admin/workers/:id
// @access  Admin
export const updateWorkerDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body; // allowed fields validated on client side
        const worker = await findWorker(id);
        Object.assign(worker, updates);
        await worker.save();
        res.json({ message: 'Worker details updated', worker });
    } catch (error) {
        console.error('Update worker error:', error);
        res.status(error.status || 500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Add a new service pricing entry for a worker
// @route   POST /api/admin/workers/:id/services
// @access  Admin
export const addWorkerService = async (req, res) => {
    try {
        const { id } = req.params;
        const { subCategoryId, categoryName, serviceName, price } = req.body;
        if (!serviceName || price == null) {
            return res.status(400).json({ message: 'serviceName and price are required' });
        }
        const worker = await findWorker(id);
        // Prevent duplicate service names for same worker
        if (worker.servicePricing.some(s => s.serviceName === serviceName)) {
            return res.status(400).json({ message: 'Service already exists for this worker' });
        }
        worker.servicePricing.push({
            subCategory: subCategoryId ? mongoose.Types.ObjectId(subCategoryId) : null,
            categoryName: categoryName || '',
            serviceName,
            price: parseFloat(price),
            isActive: true,
        });
        await worker.save();
        res.status(201).json({ message: 'Service added', worker });
    } catch (error) {
        console.error('Add service error:', error);
        res.status(error.status || 500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Update an existing service pricing entry
// @route   PUT /api/admin/workers/:id/services/:serviceId
// @access  Admin
export const updateWorkerService = async (req, res) => {
    try {
        const { id, serviceId } = req.params;
        const { subCategoryId, categoryName, serviceName, price, isActive } = req.body;
        const worker = await findWorker(id);
        const service = worker.servicePricing.id(serviceId);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        if (serviceName) service.serviceName = serviceName;
        if (price != null) service.price = parseFloat(price);
        if (subCategoryId) service.subCategory = mongoose.Types.ObjectId(subCategoryId);
        if (categoryName) service.categoryName = categoryName;
        if (isActive != null) service.isActive = toBoolean(isActive);
        await worker.save();
        res.json({ message: 'Service updated', worker });
    } catch (error) {
        console.error('Update service error:', error);
        res.status(error.status || 500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Remove a service pricing entry
// @route   DELETE /api/admin/workers/:id/services/:serviceId
// @access  Admin
export const removeWorkerService = async (req, res) => {
    try {
        const { id, serviceId } = req.params;
        const worker = await findWorker(id);
        const service = worker.servicePricing.id(serviceId);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        service.remove();
        await worker.save();
        res.json({ message: 'Service removed', worker });
    } catch (error) {
        console.error('Remove service error:', error);
        res.status(error.status || 500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Assign a city to a worker (admin)
// @route   POST /api/admin/workers/:id/cities
// @access  Admin
export const assignCityToWorker = async (req, res) => {
    try {
        const { id } = req.params;
        const { cityId } = req.body;
        if (!cityId) return res.status(400).json({ message: 'cityId required' });
        const worker = await findWorker(id);
        if (!worker.assignedCities.includes(cityId)) {
            worker.assignedCities.push(new mongoose.Types.ObjectId(cityId));
        }
        await worker.save();
        res.json({ message: 'City assigned', worker });
    } catch (error) {
        console.error('Assign city error:', error);
        res.status(error.status || 500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Remove a city from a worker (admin)
// @route   DELETE /api/admin/workers/:id/cities/:cityId
// @access  Admin
export const removeCityFromWorker = async (req, res) => {
    try {
        const { id, cityId } = req.params;
        const worker = await findWorker(id);
        worker.assignedCities = worker.assignedCities.filter(c => c.toString() !== cityId);
        await worker.save();
        res.json({ message: 'City removed', worker });
    } catch (error) {
        console.error('Remove city error:', error);
        res.status(error.status || 500).json({ message: error.message || 'Server Error' });
    }
};
