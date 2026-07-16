const Redis = require('ioredis');
const { config } = require('.');
const logger = require('./logger');
//need to check this , whether  this is correct 
// Singleton Redis client instance with event logging. No use of constructor , as it will give a new instance everytime.
class RedisClient {
  static instance;
  static isConnected = false;

  static getInstance() {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis(config.REDIS_URL, {
        retryStrategy(times) {
          return Math.min(times * 50, 2000);
        },
        maxRetriesPerRequest: 3,
      });

      RedisClient.setupEventListeners();
    }

    return RedisClient.instance;
  }

  static setupEventListeners() {
    const client = RedisClient.instance;
    if (!client) {
      return;
    }

    client.on('connect', () => {
      logger.info('Redis client connecting...');
    });

    client.on('ready', () => {
      RedisClient.isConnected = true;
      logger.info('Redis client is ready');
    });

    client.on('error', (error) => {
      logger.error(`Redis client error: ${error instanceof Error ? error.message : error}`);
    });

    client.on('close', () => {
      RedisClient.isConnected = false;
      logger.warn('Redis client connection closed');
    });

    client.on('reconnecting', (delay) => {
      logger.info(`Redis client reconnecting in ${delay}ms`);
    });
  }
}

module.exports = RedisClient;
