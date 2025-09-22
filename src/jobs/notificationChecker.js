const cron = require("node-cron");
const Notification = require("../models/Notification");
const nodemailer = require("nodemailer");

// configure email transporter (use Gmail or Mailtrap)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});


function startNotificationChecker() {
  // run every minute
  cron.schedule("* * * * *", async () => {
    console.log("⏰ Checking notifications...");

    const now = new Date();
    const pending = await Notification.find({
      notifyAt: { $lte: now },
      sent: false
    }).populate("userId");

    for (const notif of pending) {
      try {
        await transporter.sendMail({
          from: "noreply@dealnest.com",
          to: notif.email,
          subject: "Unread Message Reminder",
          text: `You have an unread message! Message ID: ${notif.messageId}`
        });

        notif.sent = true;
        await notif.save();
        console.log(`✅ Sent email to ${notif.email}`);
      } catch (err) {
        console.error("❌ Error sending email:", err);
      }
    }
  });
}

module.exports = startNotificationChecker;
