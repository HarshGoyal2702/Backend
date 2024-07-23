import jwt from "jsonwebtoken";
export const authentication = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({
        success: false,
        message: "Access denied"
    });

    try {
        const verified = jwt.verify(token, 'secretKey');
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({
            success: false,
            message: "Invalid token",
        });
    }
};
export const authorization = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(401).json({
        success: false,
        message: 'Access denied'
    });
    next();
}