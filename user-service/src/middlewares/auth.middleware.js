const { UnauthorizedError } = require("../utils/error");
const { verifyAccessToken } = require("../utils/auth");

function requireAuth(req, res, next){
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return next(new UnauthorizedError("Authorization token missing")) ;
    }

    const accessToken = authHeader.split(" ")[1] ;

    try{
        const payload = verifyAccessToken(accessToken) ;
        req.user = payload;
        return next();
    } catch (error) {
        return next(new UnauthorizedError("Invalid or expired token"));
    }
}

module.exports = { requireAuth };