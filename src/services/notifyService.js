const { notificationQueue } = require('../queues/notificationQueue');
const Message = require('../models/Message');

async function scheduleNotification(recipientId, delayMinutes) {
  const delay = delayMinutes * 60 * 1000;

  await notificationQueue.add(
    'notify',
    { recipientId },
    {
      delay,
      jobId: `notify:${recipientId}`, // one job per recipient
      removeOnComplete: true
    }
  );
}

async function cancelNotificationIfNoUnread(recipientId) {
  const count = await Message.countDocuments({ recipient: recipientId, is_read: false });
  if (count === 0) {
    const job = await notificationQueue.getJob(`notify:${recipientId}`);
    if (job) await job.remove();
  }
}

module.exports = { scheduleNotification, cancelNotificationIfNoUnread };
