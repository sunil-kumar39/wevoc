import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    changeCurrentPassword,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getSuggestedUsers
} from "../controllers/user.controller.js";

const router = Router();

// Public Routes
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

router.route("/login").post(loginUser);

router.route("/refresh-token").post(refreshAccessToken);

// Protected Routes
router.use(verifyJWT);

router.route("/logout").post(logoutUser);

router.route("/current-user").get(getCurrentUser);

router.route("/change-password").post(changeCurrentPassword);

router.route("/update-account").patch(updateAccountDetails);

router.route("/avatar").patch(
    upload.single("avatar"),
    updateUserAvatar
);

router.route("/cover-image").patch(
    upload.single("coverImage"),
    updateUserCoverImage
);

router.route("/suggested").get(getSuggestedUsers);

export default router;