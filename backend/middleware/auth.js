const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    //get token from auth header
    const authHeader = req.headers['authorization'];
    // console.log(authHeader);
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(400).json({ errors: [{ msg: 'Authorization failed' }] });
    }
    // console.log(token);

    //test
    // return res.status(400).json({ errors: [{ msg: 'Authorization failed' }] });
    //test
    try {
        //Validate token
        const decodedToken = jwt.verify(token, process.env.JWTSECRET);
        // console.log(user);
        //add user to request
        req.user = decodedToken.user;
        next();
    } catch (err) {
        console.error(err.message);
        return res.status(400).json({ errors: [{ msg: 'Authorization failed' }] });
    }

}

module.exports = auth;