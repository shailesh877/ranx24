import axios from 'axios';

// @desc    Reverse geocode coordinates to address
// @route   GET /api/location/reverse
// @access  Public
export const reverseGeocode = async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ message: 'Latitude and Longitude are required' });
    }

    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
            params: {
                format: 'json',
                lat,
                lon
            },
            headers: {
                'User-Agent': 'RanX24-App/1.0' // Required by Nominatim
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Geocoding error:', error.message);
        res.status(500).json({ message: 'Failed to fetch address' });
    }
};
