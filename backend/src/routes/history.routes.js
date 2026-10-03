import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    addToHistory,
    getHistory,
    clearHistory
} from "../controllers/history.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/")
    .get(getHistory)
    .delete(clearHistory);

router.route("/:voiceId")
    .post(addToHistory);

export default router;