const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) return res.status(401).json({ message: 'Access Denied. No token provided.' });

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;  
    next();
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
}
module.exports = authenticateToken;
