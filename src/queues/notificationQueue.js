const { Queue, QueueScheduler } = require('bullmq');
const IORedis = require('ioredis');

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

const notificationQueue = new Queue('notifications', { connection });
new QueueScheduler('notifications', { connection }); // ensures delayed jobs are processed

module.exports = { notificationQueue, connection };
