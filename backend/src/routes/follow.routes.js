import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    toggleFollow,
    getFollowers,
    getFollowing,
    getUserProfile
} from "../controllers/follow.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/:userId")
    .post(toggleFollow);

router.route("/:userId/followers")
    .get(getFollowers);

router.route("/:userId/following")
    .get(getFollowing);

router.route("/:userId/profile")
    .get(getUserProfile);

export default router;