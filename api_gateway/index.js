const express = require('express');
const axios = require('axios');
const os = require('os');
const app = express();
const port = 3001;
const host = '0.0.0.0';

// Middleware to parse JSON bodies
app.use(express.json());

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

const servers = [
    { name: 'Server 1', url: 'http://server1:3000' },
    { name: 'Server 2', url: 'http://server2:3000' },
    { name: 'Server 3', url: 'http://server3:3000' }
];

// Round-robin counter
let currentServerIndex = 0;

// Round-robin load balancer function
function getNextServer() {
    const server = servers[currentServerIndex];
    currentServerIndex = (currentServerIndex + 1) % servers.length;
    return server;
}

// Proxy middleware for load balancing
app.use('/', async (req, res) => {
    const server = getNextServer();
    const timestamp = new Date().toISOString();
    
    console.log(`[${timestamp}] Routing request to ${server.name} (${server.url})`);
    
    try {
        const response = await axios({
            method: req.method,
            url: `${server.url}${req.path}`,
            data: req.body,
            headers: {
                ...req.headers,
                host: undefined // Remove host header to avoid conflicts
            },
            params: req.query
        });
        
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error(`[${timestamp}] Error forwarding to ${server.name}:`, error.message);
        res.status(500).json({ 
            error: 'Internal Server Error', 
            message: `Failed to reach ${server.name}` 
        });
    }
});

// Start the server
app.listen(port, host, () => {
    const privateIP = getPrivateIP();
    console.log(`✅ Load Balancer is running at http://${host}:${port}`);
    console.log(`🌐 Access via private IP: http://${privateIP}:${port}`);
});
