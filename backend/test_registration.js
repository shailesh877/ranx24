import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth/register';

const testRegistration = async () => {
    try {
        const userData = {
            name: 'Test User',
            phone: '9876543210',
            email: 'test@example.com',
            password: 'password123',
            userType: 'user'
        };

        console.log('Sending registration request:', userData);

        const response = await axios.post(API_URL, userData);
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
};

testRegistration();
