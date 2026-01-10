const fetch = require('node-fetch'); // Needs node-fetch, but standard node v18+ has fetch. 
// If environment is older node, might fail. 
// Let's use http module to be safe or just try naive fetch if node version allows.
// Actually, 'axios' is in server/package.json, so I can use that if I run from server dir.

const axios = require('axios');

async function testApi() {
    try {
        console.log('Testing access to Backend directly (3005)...');
        const resDirect = await axios.get('http://localhost:3005/api/terminals');
        console.log(`Direct Status: ${resDirect.status}`);
        console.log(`Direct Data Count: ${resDirect.data.length}`);

        console.log('\nTesting access via Frontend Proxy (8080)...');
        const resProxy = await axios.get('http://localhost:8080/api/terminals');
        console.log(`Proxy Status: ${resProxy.status}`);
        console.log(`Proxy Data Count: ${resProxy.data.length}`);
        if (resProxy.data.length > 0) {
            console.log('First Item Structure:', JSON.stringify(resProxy.data[0], null, 2));
        }

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    }
}

testApi();
