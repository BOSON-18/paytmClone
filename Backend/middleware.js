const { JWT_SECRET } = require("./config");
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    //? getting the user authorization header
    const authHeader = req.headers.authorization;

    //? checking the valid token exist or not
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(411).json({
            message: "Wrong token"
        });
    }

    //?getting rid of 'Bearer'
    const token = authHeader.split(' ')[1];

    //? Decoding the token -> setting userId of decode in req
    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.userId) {
            req.userId = decoded.userId;
            next();
        } else {
            return res.status(403).json({
                message: "missing user id"
            })
        }

    } catch (err) {
        return res.status(403).json({
            message: "token have some issue"
        })
    }
};

module.exports = {
    authMiddleware
}