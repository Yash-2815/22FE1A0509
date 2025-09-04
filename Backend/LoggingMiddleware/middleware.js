const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// Replace this with your actual token from onboarding/docs
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJ5YXN3YW50aGJhZGV0aUBnbWFpbC5jb20iLCJleHAiOjE3NTY5NjcxODIsImlhdCI6MTc1Njk2NjI4MiwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6ImMxMjZkMTZmLWM5OWEtNDk0NS1hYzM2LThjMDM4Zjc4N2YwYSIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6Inlhc2h3YW50aCBiYWRldGkiLCJzdWIiOiIzZGMwYTI2Yy05YjQ1LTQ2NjQtYWI2Yi03MTM4NTM4NGZkZTMifSwiZW1haWwiOiJ5YXN3YW50aGJhZGV0aUBnbWFpbC5jb20iLCJuYW1lIjoieWFzaHdhbnRoIGJhZGV0aSIsInJvbGxObyI6IjIyZmUxYTA1MDkiLCJhY2Nlc3NDb2RlIjoiWXp1SmVVIiwiY2xpZW50SUQiOiIzZGMwYTI2Yy05YjQ1LTQ2NjQtYWI2Yi03MTM4NTM4NGZkZTMiLCJjbGllbnRTZWNyZXQiOiJKRGZoc1JQUnNBUXZVZkpDIn0.uZXhmI5dy-nSQtYw58aTexbpNqYJde-Yib925nGmvtk';

// Allowed stacks, levels, and packages
const STACKS = ["backend", "frontend"];
const LEVELS = ["debug", "info", "warn", "error", "fatal"];
const PACKAGES = {
    backend: [
        "cache", "controller", "cron_job", "db", "domain", "handler",
        "repository", "route", "service",
        "auth", "config", "middleware", "utils"
    ],
    frontend: [
        "api", "component", "hook", "page", "state", "style",
        "auth", "config", "middleware", "utils"
    ]
};

// Helper validation function
function isValid(stack, level, pkg) {
    if (!STACKS.includes(stack)) return false;
    if (!LEVELS.includes(level)) return false;
    if (!PACKAGES[stack].includes(pkg)) return false;
    return true;
}

const log = async (stack, level, pkg, message) => {
    // Lowercase normalization and validation
    stack = (stack || "").toLowerCase();
    level = (level || "").toLowerCase();
    pkg = (pkg || "").toLowerCase();

    if (!isValid(stack, level, pkg)) {
        throw new Error(`Invalid input: stack='${stack}', level='${level}', package='${pkg}'`);
    }

    const logData = { stack, level, package: pkg, message };

    try {
        const response = await axios.post(
            'http://20.244.56.144/evaluation-service/logs',
            logData,
            {
                headers: {
                    Authorization: `Bearer ${AUTH_TOKEN}` // You may need to change header name as per API requirements
                }
            }
        );
        return response.data;
    } catch (err) {
        // Relay server error response or friendly message
        throw err.response?.data || err;
    }
};

// Endpoint for custom logging
app.post('/log', async (req, res) => {
    const { stack, level, package: pkg, message } = req.body;
    try {
        const result = await log(stack, level, pkg, message);
        res.status(200).json(result);
    } catch (e) {
        res.status(401).json({ error: e.message });
    }
});
// Start server
app.listen(3000, () => {
    console.log('Express server listening on port 3000');
});
