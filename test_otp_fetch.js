async function testOtp() {
    try {
        console.log('Testing connection to http://localhost:5000/api/auth/send-otp...');
        const response = await fetch('http://localhost:5000/api/auth/send-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phone: '9876543210' })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);
    } catch (error) {
        console.log('Fetch error:', error.message);
        if (error.cause) console.log('Cause:', error.cause);
    }
}

testOtp();
