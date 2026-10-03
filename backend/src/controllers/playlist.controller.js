import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Voice } from "../models/voice.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    if(!name || name.trim()===""){
        throw new ApiError(400,"Playlist name is required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner:req.user._id
    })
    return res.status(201).json(
    new ApiResponse(
        201,
        playlist,
        "Playlist created successfully"
    )
);
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const playlists = await Playlist.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            fullname:1,
                            username:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                owner:{
                    $first:"$owner"
                },
                totalVoices:{
                    $size:"$voices"
                }
            }
        },
        {
            $project:{
                name:1,
                description:1,
                owner:1,
                totalVoices:1,
                createdAt:1
            }
        },
        {
            $sort:{
                createdAt:-1
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200,playlists,"Playlists fetched successfully"))
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
    }
    
    const playlist = await Playlist.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            fullname:1,
                            username:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                owner:{
                    $first:"$owner"
                }
            }
        },
        {
            $lookup:{
                from:"voices",
                localField:"voices",
                foreignField:"_id",
                as:"voices",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    },
                    {
                        $project:{
                            title:1,
                            description:1,
                            thumbnail:1,
                            duration:1,
                            voiceFile:1,
                            views:1,
                            owner:1,
                            createdAt:1
                        }
                    }
                ]
            }
        },
        {
            $project:{
                name:1,
                description:1,
                owner:1,
                voices:1,
                createdAt:1
            }
        }
    ])

    if (!playlist.length) {
    throw new ApiError(404, "Playlist not found");
}

    return res.status(200).json(new ApiResponse(200,playlist[0],"Playlist fetched successfully by playlistId"))
});

const addVoiceToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, voiceId } = req.params;
    if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
    }

   if (!isValidObjectId(voiceId)) {
    throw new ApiError(400, "Invalid voice id");
   }

   const playlist = await Playlist.findById(playlistId);
   if(!playlist){
    throw new ApiError(404,"Playlist not found")
   }
   const voice = await Voice.findById(voiceId)
   if(!voice){
    throw new ApiError(404,"Voice not found")
   }

   if(playlist.owner.toString()!==req.user._id.toString()){
    throw new ApiError(403,"Unauthorized")
   }

   if (playlist.voices.some(
    (id) => id.toString() === voiceId
)) {
    throw new ApiError(
        400,
        "Voice already exists in playlist"
    );
}

   const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,{
    $addToSet:{
        voices:voiceId
    }
   },{new:true})

   return res.status(200).json(new ApiResponse(200,updatedPlaylist,"Voice added successfully"))
});

const removeVoiceFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, voiceId } = req.params;
    if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
    }

   if (!isValidObjectId(voiceId)) {
    throw new ApiError(400, "Invalid voice id");
   }

   const playlist = await Playlist.findById(playlistId);
   if(!playlist){
    throw new ApiError(404,"Playlist not found")
   }
   const voice = await Voice.findById(voiceId)
   if(!voice){
    throw new ApiError(404,"Voice not found")
   }

   if(playlist.owner.toString()!==req.user._id.toString()){
    throw new ApiError(403,"Unauthorized")
   }

   const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,{
    $pull:{
        voices:voiceId
    }
   },{new:true})

   return res.status(200).json(new ApiResponse(200,updatedPlaylist,"Voice removed successfully"))
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid PlaylistId")
    }

    const {name,description} = req.body
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404, "Playlist not found");
    }

    if(playlist.owner.toString()!==req.user._id.toString()){
        throw new ApiError(403,"Unauthorized")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,
        {
            $set:{
                name:name || playlist.name,
                description:description || playlist.description
            }
        },
        {
            new:true
        }
    )
    return res.status(200).json(new ApiResponse(200,updatedPlaylist,"Playlist updated successfully"))
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid PlaylistId")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404, "Playlist not found");
    }

    if(playlist.owner.toString()!==req.user._id.toString()){
        throw new ApiError(403,"Unauthorized")
    }

    await Playlist.findByIdAndDelete(playlistId,)
    return res.status(200).json(new ApiResponse(200,{},"Playlist deleted successfully"))
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVoiceToPlaylist,
    removeVoiceFromPlaylist,
    updatePlaylist,
    deletePlaylist
};