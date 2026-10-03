import { Router } from "express";

import { verifyJWT } from "../middleware/auth.middleware.js";

import {
    toggleVoiceLike,
    getLikedVoices,
    toggleCommentLike,
    getLikedComments,
} from "../controllers/like.controller.js";

const router = Router();

router.use(verifyJWT);


// Voice likes
router.route("/toggle/voice/:voiceId").post(toggleVoiceLike);

router.route("/voices").get(getLikedVoices);


// Comment likes
router.route("/toggle/comment/:commentId").post(toggleCommentLike);

router.route("/comments").get(getLikedComments);

export default router;