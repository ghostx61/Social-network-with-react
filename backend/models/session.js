var mongoose = require("mongoose");
var SessionSchema = new mongoose.Schema({
  didLogin: {
    type: Boolean,
    required: true,
    default: false,
  },
  didSignup: {
    type: Boolean,
    required: true,
    default: false,
  },
  username: {
    type: String,
    ref: "User",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Session", SessionSchema);
