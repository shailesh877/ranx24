import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const testGetCategories = async () => {
    try {
        const params = {
            latitude: 25.336,
            longitude: 82.974,
            city: 'Varanasi'
        };

        console.log('Testing GET /categories with params:', params);

        const response = await axios.get(`${API_URL}/categories`, { params });

        console.log('Response Status:', response.status);
        console.log('Categories Found:', response.data.length);
        console.log('Categories:', response.data.map(c => c.name));

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
};

testGetCategories();
