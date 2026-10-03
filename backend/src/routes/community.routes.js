import { Router } from "express";

import { verifyJWT } from "../middleware/auth.middleware.js";

import {
    createCommunity,
    getAllCommunities,
    getCommunityById,
    joinCommunity,
    leaveCommunity,
    getCommunityMembers,
    updateCommunity,
    deleteCommunity,
    getCommunityPosts
} from "../controllers/community.controller.js";


const router = Router();


// All community routes require login
router.use(verifyJWT);


// Create community
router.post(
    "/",
    createCommunity
);


// Get all communities
router.get(
    "/",
    getAllCommunities
);


// Get single community
router.get(
    "/:communityId",
    getCommunityById
);


// Join community
router.post(
    "/:communityId/join",
    joinCommunity
);


// Leave community
router.post(
    "/:communityId/leave",
    leaveCommunity
);


// Get members
router.get(
    "/:communityId/members",
    getCommunityMembers
);


// Update community
router.patch(
    "/:communityId",
    updateCommunity
);


// Delete community
router.delete(
    "/:communityId",
    deleteCommunity
);

router.get(
    "/:communityId/posts",
    getCommunityPosts
);


export default router;