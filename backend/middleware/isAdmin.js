const isAdmin = async (req, res, next) => {
  const user = req.user;
  console.log(user);
  if (user && user.role === "admin") {
    next();
  } else {
    console.error({ msg: "Authorization failed" });
    return res.status(400).json({ errors: [{ msg: "Authorization failed" }] });
  }
};

module.exports = isAdmin;
