require('dotenv').config();

const config = {
    SERVICE_NAME: require('../../package.json').name,
    PORT: Number(process.env.PORT) || 4001,
    NODE_ENV: process.env.NODE_ENV || "development",
    LOG_LEVEL: process.env.LOG_LEVEL || "info",
    REDIS_URL: process.env.REDIS_URL || "redis://:railwaypass@localhost:6379",
    HMAC_SECRET: process.env.HMAC_SECRET || "dev-only-otp-hmac-secret",
    OTP_TTL: Number(process.env.OTP_TTL) || 300,
    MAIL_SEND: process.env.MAIL_SEND || "adityasharma_it24b01_015@dtu.ac.in",
    APP_URL: process.env.APP_URL || "http://localhost:4001",
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || "http://localhost:4001"
};

module.exports = { config };