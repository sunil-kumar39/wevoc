import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { Follow } from "../models/follow.model.js";
import mongoose from "mongoose";
import { Voice } from "../models/voice.model.js";

const getFeed = asyncHandler(async (req, res) => {
    const feed = await Follow.aggregate([
        {
            $match:{
                follower:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"voices",
                localField:"following",
                foreignField:"owner",
                as:"voices"
            }
        },
        {
            $unwind:"$voices"
        },
        {
            $match:{
                "voices.isPublished":true
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"voices.owner",
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
            $sort:{
                "voices.createdAt":-1
            }
        },
        {
            $project:{
                _id:0,
                voice:"$voices",
                owner:1
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200,feed,"Feed fetched successfully"))
});

const getTrendingVoices = asyncHandler(async (req, res) => {
    const trendingVoices = await Voice.aggregate([
        {
            $match:{
                isPublished:true
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
            $sort:{
                views:-1
            }
        },
        {
            $limit:10
        },
        {
            $project:{
                title:1,
                description: 1,
                thumbnail: 1,
                voiceFile: 1,
                duration: 1,
                views: 1,
                createdAt: 1,
                owner: 1
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200,trendingVoices,"Trending Voices fetched successfully"))
});

const getLatestVoices = asyncHandler(async (req, res) => {
    const latestVoices = await Voice.aggregate([
        {
            $match: {
                isPublished: true
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $limit: 10
        },
        {
            $project: {
                title: 1,
                description: 1,
                thumbnail: 1,
                voiceFile: 1,
                duration: 1,
                views: 1,
                createdAt: 1,
                owner: 1
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            latestVoices,
            "Latest voices fetched successfully"
        )
    );
});

export {
    getFeed,
    getTrendingVoices,
    getLatestVoices
};