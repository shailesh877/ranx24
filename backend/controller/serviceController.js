import Service from '../model/Service.js';

// @desc    Get all services
// @route   GET /api/services
// @access  Public
export const getServices = async (req, res) => {
    try {
        const { category, subCategory } = req.query;
        const query = { isActive: true };

        if (category) query.category = category;
        if (subCategory) query.subCategory = subCategory;

        const services = await Service.find(query).populate('category', 'name subCategories');

        // Manually populate subCategory name since it's an embedded document
        const populatedServices = services.map(service => {
            const serviceObj = service.toObject();
            if (serviceObj.subCategory && serviceObj.category && serviceObj.category.subCategories) {
                const subCat = serviceObj.category.subCategories.find(
                    sub => sub._id.toString() === serviceObj.subCategory.toString()
                );
                if (subCat) {
                    serviceObj.subCategory = { _id: subCat._id, name: subCat.name };
                }
            }
            // Clean up category object to remove subCategories array from response if not needed
            if (serviceObj.category && serviceObj.category.subCategories) {
                delete serviceObj.category.subCategories;
            }
            return serviceObj;
        });

        res.json(populatedServices);
    } catch (error) {
        console.error("Error in getServices:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get service by ID
// @route   GET /api/services/:id
// @access  Public
export const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id).populate('category', 'name subCategories');

        if (service) {
            const serviceObj = service.toObject();
            if (serviceObj.subCategory && serviceObj.category && serviceObj.category.subCategories) {
                const subCat = serviceObj.category.subCategories.find(
                    sub => sub._id.toString() === serviceObj.subCategory.toString()
                );
                if (subCat) {
                    serviceObj.subCategory = { _id: subCat._id, name: subCat.name };
                }
            }
            if (serviceObj.category && serviceObj.category.subCategories) {
                delete serviceObj.category.subCategories;
            }
            res.json(serviceObj);
        } else {
            console.warn(`Service not found for ID: ${req.params.id}`);
            res.status(404).json({ message: 'Service not found or outdated ID' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a service
// @route   POST /api/services
// @access  Private/Admin
export const createService = async (req, res) => {
    try {
        const { name, category, subCategory, description, basePrice, priceUnit } = req.body;

        let image = req.body.image;
        if (req.files && req.files.image) {
            image = req.files.image[0].path;
        }

        const service = new Service({
            name,
            category,
            subCategory,
            description,
            basePrice,
            priceUnit,
            image,
        });

        const createdService = await service.save();
        res.status(201).json(createdService);
    } catch (error) {
        res.status(400).json({ message: 'Invalid service data', error: error.message });
    }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private/Admin
export const updateService = async (req, res) => {
    try {
        const { name, category, subCategory, description, basePrice, priceUnit, isActive } = req.body;

        const service = await Service.findById(req.params.id);

        if (service) {
            service.name = name || service.name;
            service.category = category || service.category;
            service.subCategory = subCategory || service.subCategory;
            service.description = description || service.description;
            service.basePrice = basePrice || service.basePrice;
            service.priceUnit = priceUnit || service.priceUnit;
            service.isActive = isActive !== undefined ? isActive : service.isActive;

            if (req.files && req.files.image) {
                service.image = req.files.image[0].path;
            } else if (req.body.image) {
                service.image = req.body.image;
            }

            const updatedService = await service.save();
            res.json(updatedService);
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid service data', error: error.message });
    }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private/Admin
export const deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (service) {
            await service.deleteOne();
            res.json({ message: 'Service removed' });
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
