const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message", required: true },
  email: { type: String, required: true },
  notifyAt: { type: Date, required: true },
  sent: { type: Boolean, default: false }
});

module.exports = mongoose.model("Notification", notificationSchema);
