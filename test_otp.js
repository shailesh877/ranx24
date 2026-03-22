const axios = require('axios');

async function testOtp() {
    try {
        console.log('Testing connection to http://localhost:5000/api/auth/send-otp...');
        const response = await axios.post('http://localhost:5000/api/auth/send-otp', {
            phone: '9876543210'
        });
        console.log('Success:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('Server responded with error:', error.response.status, error.response.data);
        } else if (error.request) {
            console.log('No response received (Network Error). Is the server running?');
        } else {
            console.log('Error setting up request:', error.message);
        }
    }
}

testOtp();
