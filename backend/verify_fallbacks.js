import axios from 'axios';

async function testFetch() {
    try {
        console.log('Testing with non-existent city: [Mumbai]');
        const res = await axios.get('http://localhost:5000/api/categories?city=Mumbai', { timeout: 10000 });
        console.log('Result count (should be 17 due to fallback):', res.data.length);
        
        console.log('\nTesting with valid city: [Patna]');
        const res2 = await axios.get('http://localhost:5000/api/categories?city=Patna', { timeout: 10000 });
        console.log('Result count (should be 9 for Patna):', res2.data.length);
        
    } catch (error) {
        console.error('Fetch failed:', error.message);
    }
}

testFetch();
