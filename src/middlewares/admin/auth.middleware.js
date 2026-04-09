// middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");
const { User } = require("../../models/index");

const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        console.log("Received token:", token); // Debugging line

        if (!token) throw new Error("No token");

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log("Decoded JWT:", decoded); // Debugging line

        const user = await User.findById(decoded.id);

        if (!user || !user.isActive) {
            throw new Error("Unauthorized");
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("Authentication error:", err); // Debugging line  
        res.status(401).json({ message: "Unauthorized" });
    }
};

const requireSuperAdmin = (req, res, next) => {
    if (req.user.role !== "super_admin") {
        return res.status(403).json({ message: "Only Super Admin allowed" });
    }
    next();
};

module.exports = {
    auth,
    requireSuperAdmin
};