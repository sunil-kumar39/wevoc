import { Router } from "express";

import { verifyJWT } from "../middleware/auth.middleware.js";

import {
    publishVoice,
    getAllVoices,
    getCommunityVoices,
    getVoiceById,
    updateVoice,
    deleteVoice
} from "../controllers/voice.controller.js";

import { upload } from "../middleware/multer.middleware.js";


const router = Router();


// ========================================
// ALL VOICE ROUTES REQUIRE LOGIN
// ========================================

router.use(verifyJWT);


// ========================================
// PUBLISH VOICE
// ========================================

router.post(
    "/publish",

    upload.fields([
        {
            name: "voiceFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),

    publishVoice
);


// ========================================
// ALL VOICES
// ========================================

router.get(
    "/",
    getAllVoices
);


// ========================================
// COMMUNITY VOICES
// IMPORTANT: this must come BEFORE /:voiceId
// ========================================

router.get(
    "/community/:communityId",
    getCommunityVoices
);


// ========================================
// SINGLE VOICE
// ========================================

router.get(
    "/:voiceId",
    getVoiceById
);


// ========================================
// UPDATE VOICE
// ========================================

router.patch(
    "/:voiceId",

    upload.single("thumbnail"),

    updateVoice
);


// ========================================
// DELETE VOICE
// ========================================

router.delete(
    "/:voiceId",

    deleteVoice
);


export default router;