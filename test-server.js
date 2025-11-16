// Quick test script to verify the server is working
const http = require('http');

const testRequest = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/health',
    method: 'GET'
};

console.log('Testing server connection...');
const req = http.request(testRequest, (res) => {
    console.log(`Status: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log('Response:', data);
        if (res.statusCode === 200) {
            console.log('✅ Server is running correctly!');
        } else {
            console.log('❌ Server returned an error');
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Error connecting to server:', error.message);
    console.log('Make sure the server is running with: npm start');
});

req.end();

