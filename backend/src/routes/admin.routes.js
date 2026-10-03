import { Router } from "express";

import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/admin.middleware.js";

import {
    getAdminDashboard,
    getAllUsers,
    deleteUser,
    getAllVoices,
    deleteVoice,
    getUserDetails
} from "../controllers/admin.controller.js";


const router = Router();


router.use(verifyJWT);
router.use(verifyAdmin);


router.get(
    "/dashboard",
    getAdminDashboard
);


router.get(
    "/users",
    getAllUsers
);

router.get(
    "/users/:userId",
    getUserDetails
);

router.delete(
    "/users/:userId",
    deleteUser
);


router.get(
    "/voices",
    getAllVoices
);


router.delete(
    "/voices/:voiceId",
    deleteVoice
);


export default router;