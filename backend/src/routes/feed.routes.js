import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    getFeed,
    getTrendingVoices,
    getLatestVoices
} from "../controllers/feed.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getFeed);

router.route("/trending").get(getTrendingVoices);

router.route("/latest").get(getLatestVoices);

export default router;