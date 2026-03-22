import City from '../model/City.js';

// @desc    Get city by name
// @route   GET /api/cities/name/:name
// @access  Public
export const getCityByName = async (req, res) => {
    try {
        const city = await City.findOne({ name: { $regex: new RegExp(`^${req.params.name}$`, 'i') } });
        if (city) {
            res.json(city);
        } else {
            res.status(404).json({ message: 'City not found' });
        }
    } catch (error) {
        console.error('Error fetching city:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all cities
// @route   GET /api/cities
// @access  Public
export const getCities = async (req, res) => {
    try {
        const cities = await City.find({});
        res.json(cities);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a city
// @route   POST /api/cities
// @access  Private (Admin)
export const createCity = async (req, res) => {
    const { name, state, assignedCategories } = req.body;

    try {
        const cityExists = await City.findOne({ name });

        if (cityExists) {
            return res.status(400).json({ message: 'City already exists' });
        }

        const city = new City({
            name,
            state,
            assignedCategories,
        });

        const createdCity = await city.save();
        res.status(201).json(createdCity);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a city's assigned categories
// @route   PUT /api/cities/:id/assign-categories
// @access  Admin
export const updateCityCategories = async (req, res) => {
    const { assignedCategories } = req.body;

    try {
        const city = await City.findById(req.params.id);

        if (city) {
            city.assignedCategories = assignedCategories;
            const updatedCity = await city.save();
            res.json(updatedCity);
        } else {
            res.status(404).json({ message: 'City not found' });
        }
    } catch (error) {
        console.error('Error assigning categories to city:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a city's name and state
// @route   PUT /api/cities/:id
// @access  Admin
export const updateCity = async (req, res) => {
    const { name, state } = req.body;

    try {
        const city = await City.findById(req.params.id);

        if (city) {
            city.name = name || city.name;
            city.state = state || city.state;

            const updatedCity = await city.save();
            res.json(updatedCity);
        } else {
            res.status(404).json({ message: 'City not found' });
        }
    } catch (error) {
        console.error('Error updating city:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a city
// @route   DELETE /api/cities/:id
// @access  Admin
export const deleteCity = async (req, res) => {
    try {
        const city = await City.findById(req.params.id);

        if (city) {
            await City.deleteOne({ _id: req.params.id });
            res.json({ message: 'City removed' });
        } else {
            res.status(404).json({ message: 'City not found' });
        }
    } catch (error) {
        console.error('Error deleting city:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
