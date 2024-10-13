const jwt = require("jsonwebtoken")


const authMiddleware = (req, res,next) => {
    const auth = req.headers.authorization
    if(!auth){
        return res.status(403).json({"message": "Invalid Token"});
    }
    const token = auth.split(" ")[1]
    if(!token)
    return res.status(403).json({"message": "Invalid Token"});
    
    // verify token
    try{
        const verifyToken = jwt.verify(token, process.env.SECRET);
    if(!verifyToken){
        return res.status(403).json({"message": "Invalid Token"});
    }
    req.userToken = verifyToken;
    next();
    }catch(err){
        throw err
    }
}

function GenerateToken(token) {
    return jwt.sign(token,process.env.SECRET)
}


module.exports = {
    authMiddleware,
    GenerateToken
}