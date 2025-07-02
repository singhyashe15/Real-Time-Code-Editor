import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1]; // Bearer <token>
  
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_TOKEN, (err, decoded) => {
    if (err) return res.status(403).json({ message: err });

    req.user = decoded;
    next();
  });
}

export default verifyToken;
