import "dotenv/config";
import http from "http";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { initializeSocket } from "./sockets/socket.js";

// =====================================================
// HTTP SERVER & SOCKET.IO SETUP
// =====================================================
const httpServer = http.createServer(app);

const io = initializeSocket(httpServer);

// Make io accessible inside Express controllers via req.app.get("io")
app.set("io", io);

// =====================================================
// DATABASE & SERVER STARTUP
// =====================================================
const PORT = process.env.PORT || 8000;

connectDB()
    .then(() => {
        httpServer.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`🔌 Socket.IO initialized on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    });