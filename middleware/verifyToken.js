import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {
    let token;
    
    // First, check for Authorization header (for mobile/cross-origin)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove "Bearer " prefix
    }
    // If no Authorization header, fallback to cookies (for desktop)
    else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }
    
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: "Unauthorized access, please login" 
        });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};