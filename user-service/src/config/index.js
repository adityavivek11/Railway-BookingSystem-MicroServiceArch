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
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || "http://localhost:4001",
    OTP_MAX_VERIFY_ATTEMPTS: process.env.OTP_MAX_VERIFY_ATTEMPTS || 5 ,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "0f8bf908f8d38527c188cc93bda49d48bd421a43fa0bdf3e77de1f0db785e6f37",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "826d2c0edb5ad8f8ac7668556c034ea228931a49576aefccc80d6f469cc4a34c4da82ca43a5c43de91ffdad2f4644c655e2eb3ccbb8bc2848cb64fe7ea2a1ab9",
    ACCESS_TOKEN_EXP: process.env.ACCESS_TOKEN_EXP || "15m",
    REFRESH_TOKEN_EXP: process.env.REFRESH_TOKEN_EXP || "7d",
    ACCESS_TOKEN_EXP_SEC: Number(process.env.ACCESS_TOKEN_EXP_SEC || 900),
    REFRESH_TOKEN_EXP_SEC: Number(process.env.REFRESH_TOKEN_EXP_SEC || 604800),
    REDIS_USER_TTL: Number(process.env.REDIS_USER_TTL || 86400),
};

module.exports = { config };