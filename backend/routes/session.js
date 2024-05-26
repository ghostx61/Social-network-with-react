var express = require("express");
var router = express.Router();
const Session = require("../models/session");

router.get("/create", async (req, res) => {
  try {
    const newSession = await Session.create({});
    res.status(201).json({ success: true, sessionID: newSession._id });
  } catch (err) {
    // console.error(err.message);
    res.status(500).json({ errors: [{ msg: "Server Error" }] });
  }
});

router.post("/update", async (req, res) => {
  try {
    const { sessionID, updateType, username } = req.body;
    let updateQuery = { username };
    if (updateType === "login") updateQuery.didLogin = true;
    if (updateType === "signup") updateQuery.didSignup = true;
    console.log(sessionID, updateType, username);
    // console.log(updateQuery);
    await Session.findByIdAndUpdate(sessionID, updateQuery);
    res.status(201).json({ success: true });
  } catch (err) {
    // console.error(err.message);
    res.status(500).json({ errors: [{ msg: "Session tracking failed" }] });
  }
});

module.exports = router;
