import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVoiceToPlaylist,
    removeVoiceFromPlaylist,
    updatePlaylist,
    deletePlaylist
} from "../controllers/playlist.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/")
    .post(createPlaylist)
    .get(getUserPlaylists);

router.route("/:playlistId")
    .get(getPlaylistById)
    .patch(updatePlaylist)
    .delete(deletePlaylist);

router.route("/:playlistId/voices/:voiceId")
    .post(addVoiceToPlaylist)
    .delete(removeVoiceFromPlaylist);

export default router;