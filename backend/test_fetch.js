import axios from 'axios';

async function testFetch() {
    try {
        console.log('Fetching http://localhost:5000/api/categories...');
        const res = await axios.get('http://localhost:5000/api/categories', { timeout: 10000 });
        console.log('Success! Count:', res.data.length);
    } catch (error) {
        console.error('Fetch failed:', error.message);
    }
}

testFetch();
