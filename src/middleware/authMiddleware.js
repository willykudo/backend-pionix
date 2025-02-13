// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Ambil token dari header Authorization
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Failed to authenticate token' });
        }
        req.userId = decoded.id; // Simpan ID pengguna ke dalam req untuk digunakan di rute selanjutnya
        req.userRole = decoded.role; // Simpan role pengguna untuk kontrol akses
        next(); // Lanjutkan ke rute berikutnya
    });
};

module.exports = authMiddleware;
