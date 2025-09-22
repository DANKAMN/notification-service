const cron = require("node-cron");
const Message = require("../models/Message");
const User = require("../models/User");
const nodemailer = require("nodemailer");

// configure email transporter
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
    console.log("⏰ Checking unread messages...");

    try {
      // find all users
      const users = await User.find();

      for (const user of users) {
        // find all unread messages for this user
        const unreadMessages = await Message.find({
          recipient: user._id,
          is_read: false
        }).populate("sender", "name");

        if (unreadMessages.length > 0) {
          // collect sender names
          const senderNames = [
            ...new Set(unreadMessages.map(msg => msg.sender?.name || "Someone"))
          ];

          const senderList = senderNames.join(", ");

          await transporter.sendMail({
            from: "noreply@dealnest.com",
            to: user.email,
            subject: "Unread Message Reminder",
            text: `You have ${unreadMessages.length} unread message(s) from ${senderList}. Visit /messages to read them.`
          });

          console.log(`✅ Sent reminder to ${user.email}`);
        }
      }
    } catch (err) {
      console.error("❌ Error in notification checker:", err);
    }
  });
}

module.exports = startNotificationChecker;
