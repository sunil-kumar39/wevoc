import { Router } from "express";

import { verifyJWT } from "../middleware/auth.middleware.js";

import {
    toggleBookmark,
    getBookmarkedVoices,
    checkBookmark,
} from "../controllers/bookmark.controller.js";


const router = Router();

router.use(verifyJWT);


router.route("/").get(
    getBookmarkedVoices
);


router.route("/toggle/:voiceId").post(
    toggleBookmark
);


router.route("/:voiceId").get(
    checkBookmark
);


export default router;