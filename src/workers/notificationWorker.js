const { Worker } = require('bullmq');
const { connection } = require('../queues/notificationQueue');
const Message = require('../models/Message');
const User = require('../models/User');

// mock email (replace with nodemailer if needed)
function sendEmail(to, subject, body) {
  console.log(`Sending email to ${to}: ${subject}\n${body}`);
}

const worker = new Worker('notifications', async job => {
  const { recipientId } = job.data;
  const count = await Message.countDocuments({ recipient: recipientId, is_read: false });

  if (count > 0) {
    const user = await User.findById(recipientId);
    if (!user) return;

    const subject = "You have unread messages";
    const body = `You have ${count} unread messages. Visit /messages to read them.`;

    sendEmail(user.email, subject, body);
  }
}, { connection });

worker.on('completed', job => {
  console.log(`Job ${job.id} completed`);
});
