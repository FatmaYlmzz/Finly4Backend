require("dotenv").config();


const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Token eksik" });

    const token = authHeader.split(" ")[1]; // "Bearer token"

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: "Token geçersiz" });
        req.userId = decoded.id; // Kullanıcı ID'si
        next();
    });
}

module.exports = verifyToken;
