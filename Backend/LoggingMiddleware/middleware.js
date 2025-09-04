const axios = require('axios');

// Replace this with your actual token from onboarding/docs
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJ5YXN3YW50aGJhZGV0aUBnbWFpbC5jb20iLCJleHAiOjE3NTY5NzAzNzQsImlhdCI6MTc1Njk2OTQ3NCwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6Ijc0ZTk4Y2U3LWNiZmYtNDFhYS04YTRmLWRmZGE3OTc4YzdlYyIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6Inlhc2h3YW50aCBiYWRldGkiLCJzdWIiOiIzZGMwYTI2Yy05YjQ1LTQ2NjQtYWI2Yi03MTM4NTM4NGZkZTMifSwiZW1haWwiOiJ5YXN3YW50aGJhZGV0aUBnbWFpbC5jb20iLCJuYW1lIjoieWFzaHdhbnRoIGJhZGV0aSIsInJvbGxObyI6IjIyZmUxYTA1MDkiLCJhY2Nlc3NDb2RlIjoiWXp1SmVVIiwiY2xpZW50SUQiOiIzZGMwYTI2Yy05YjQ1LTQ2NjQtYWI2Yi03MTM4NTM4NGZkZTMiLCJjbGllbnRTZWNyZXQiOiJKRGZoc1JQUnNBUXZVZkpDIn0.aVVG5B9hd9Fs0rd8Zt5DtFWMRLNczJ2AS7cVcwCCoTg';

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

function isValid(stack, level, pkg) {
    if (!STACKS.includes(stack)) return false;
    if (!LEVELS.includes(level)) return false;
    if (!PACKAGES[stack].includes(pkg)) return false;
    return true;
}

async function log(stack, level, pkg, message) {
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
                    Authorization: `Bearer ${AUTH_TOKEN}`
                }
            }
        );
        return response.data;
    } catch (err) {
        // Do not block request in case of logging failure
        return null;
    }
}

module.exports = async function loggingMiddleware(req, res, next) {
    try {
        await log(
            "backend",                // stack
            "info",                   // level
            "middleware",             // package
            `${req.method} ${req.originalUrl} | IP: ${req.ip}` // message
        );
    } catch (err) {
        // Optionally console.error(err);
    }
    next();
};
