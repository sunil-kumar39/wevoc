import { Router } from "express";

import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

import {
    sendVoiceMessage,
    getConversations,
    getMessagesWithUser,
    getUnreadMessageCount,
    markMessagesAsRead,
} from "../controllers/message.controller.js";

const router = Router();


// ==========================================
// ALL MESSAGE ROUTES REQUIRE LOGIN
// ==========================================

router.use(verifyJWT);


// ==========================================
// CONVERSATIONS
// ==========================================

router.get(
    "/conversations",
    getConversations
);


// ==========================================
// UNREAD COUNT
// ==========================================

router.get(
    "/unread-count",
    getUnreadMessageCount
);


// ==========================================
// MARK MESSAGES AS READ
// ==========================================

router.patch(
    "/read/:userId",
    markMessagesAsRead
);


// ==========================================
// GET MESSAGES WITH USER
// ==========================================

router.get(
    "/:userId",
    getMessagesWithUser
);


// ==========================================
// SEND VOICE MESSAGE
// ==========================================

router.post(
    "/:receiverId",
    upload.single("voiceFile"),
    sendVoiceMessage
);


export default router;