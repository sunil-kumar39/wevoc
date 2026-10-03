import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    addComment,
    getVoiceComments,
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/voice/:voiceId").post(addComment);
router.route("/voice/:voiceId").get(getVoiceComments);

router.route("/:commentId")
    .patch(updateComment)
    .delete(deleteComment);

export default router;