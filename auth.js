const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  //get the token
  const token = req.header("x-auth-token");
  // check if there is no token
  if (!token) {
    return res.status(401).json({ msg: "no token, authorized denied" });
  }
  // verify token
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    // geting user in req object , 
    //setting it to the decoded value which has user in the payload
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ msg: "token not valid" });
  }
};
