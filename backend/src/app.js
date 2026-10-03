import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import voiceRouter from "./routes/voice.routes.js";
import commentRouter from "./routes/comment.routes.js";
import followRouter from "./routes/follow.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import userRouter from "./routes/user.routes.js";
import historyRouter from "./routes/history.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import searchRouter from "./routes/search.routes.js";
import likeRouter from "./routes/like.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import bookmarkRouter from "./routes/bookmark.routes.js";
import messageRouter from "./routes/message.routes.js";
import adminRouter from "./routes/admin.routes.js";
import communityRouter from "./routes/community.routes.js";
import feedRouter from "./routes/feed.routes.js";

const app = express();

// =====================================================
// CORS CONFIGURATION
// =====================================================
const allowedOrigins = [
    process.env.CORS_ORIGIN,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps, curl, Postman)
            if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
                return callback(null, true);
            }
            return callback(null, true);
        },
        credentials: true,
    })
);

// =====================================================
// BODY PARSER & COOKIE MIDDLEWARE
// =====================================================
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// =====================================================
// HEALTH CHECK
// =====================================================
app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Wevoc API is running smoothly",
        timestamp: new Date().toISOString(),
    });
});

// =====================================================
// API ROUTES
// =====================================================
app.use("/api/v1/voices", voiceRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/follows", followRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/search", searchRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/history", historyRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/bookmarks", bookmarkRouter);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/communities", communityRouter);
app.use("/api/v1/feed", feedRouter);

// =====================================================
// ERROR HANDLING MIDDLEWARE
// =====================================================
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    return res.status(statusCode).json({
        statusCode,
        success: false,
        message,
        errors: err.errors || [],
    });
});

export { app };