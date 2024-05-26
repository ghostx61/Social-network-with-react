const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Session = require("../models/session");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

router.get("/test", auth, isAdmin, async (req, res) => {
  res.status(200).json({ page: "test" });
});

router.post("/update/user", auth, isAdmin, async (req, res) => {
  try {
    const updatedUser = await User.updateMany({}, { $set: { role: "user" } });
    // console.log(updatedUser);
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err });
  }
});

// GET | get all users | /admin/user
router.get("/user", auth, isAdmin, async (req, res) => {
  try {
    let select = "";
    if (req.query.select) {
      select = req.query.select.replace(/,/g, " ");
    }
    // console.log(select);
    const users = await User.find({}).select(select).sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) {
    // console.error(err.message);
    res.status(400).json({ errors: [{ msg: "Server Error" }] });
  }
});

router.get("/session", auth, isAdmin, async (req, res) => {
  try {
    const allSessions = await Session.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: allSessions });
  } catch (err) {
    // console.error(err.message);
    res.status(400).json({ errors: [{ msg: "Server Error" }] });
  }
});

module.exports = router;
