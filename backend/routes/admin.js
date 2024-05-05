const express = require("express");
const router = express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

router.get("/test", auth, isAdmin, async (req, res) => {
  res.status(200).json({ page: "test" });
});

router.post("/update/user", async (req, res) => {
  try {
    const updatedUser = await User.updateMany({}, { $set: { role: "user" } });
    console.log(updatedUser);
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err });
  }
});

module.exports = router;
