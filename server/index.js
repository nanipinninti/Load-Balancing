const express = require('express');
const os = require('os'); // built-in module
const app = express();
const port = 3000;
const host = '0.0.0.0';

// Function to get private IP dynamically
function getPrivateIP() {
    const networkInterfaces = os.networkInterfaces();
    for (const iface of Object.values(networkInterfaces)) {
        for (const config of iface) {
            if (config.family === 'IPv4' && !config.internal) {
                return config.address;
            }
        }
    }
    return 'localhost';
}

// Sample route
let count = 0;
app.get('/', (req, res) => {
    count++;
    console.log(`Received a request for the homepage. Request count: ${count}`);
    res.send('Hello World!');
});

// Start the server
app.listen(port, host, () => {
    const privateIP = getPrivateIP();
    console.log(`✅ Server is running at http://${host}:${port}`);
    console.log(`🌐 Access via private IP: http://${privateIP}:${port}`);
});
