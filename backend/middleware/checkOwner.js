
const checkOwner = (req, res, next) => {
    if (req.user.username === req.params.username) {
        next();
        return;
    }
    res.status(400).json({ errors: [{ msg: 'You are not authorized to access this route' }] });
};


module.exports = checkOwner;