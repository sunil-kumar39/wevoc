import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    searchUsers,
    searchVoices
} from "../controllers/search.controller.js";

const router = Router();

router.use(verifyJWT);

router.get("/users", searchUsers);
router.get("/voices", searchVoices);

export default router;