import jwt from "jsonwebtoken";
import Worker from "../model/Worker.js";

export const protectWorker = async (req, res, next) => {
    if (!process.env.JWT_SECRET) {
        console.error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
        return res.status(500).json({ message: "Internal Server Error: Server is not configured properly." });
    }

    try {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];

            if (!token) {
                return res.status(401).json({ message: "Token missing" });
            }

            // Verify Token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (!decoded || !decoded.id) {
                return res.status(401).json({ message: "Invalid token" });
            }

            // Fetch worker from Worker model
            const worker = await Worker.findById(decoded.id);

            if (!worker) {
                return res.status(401).json({ message: "Worker not found" });
            }

            // Verify the token is for a worker
            if (decoded.role !== 'worker') {
                return res.status(403).json({ message: "Access denied. Worker authentication required." });
            }

            req.user = worker;
            req.user.role = 'worker';
            return next();
        }

        return res.status(401).json({ message: "No token provided" });
    } catch (error) {
        console.error("Worker Auth Middleware Error:", error.message);
        return res.status(401).json({ message: "Not authorized, token failed" });
    }
};
