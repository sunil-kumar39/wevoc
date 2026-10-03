import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { History } from "../models/history.model.js";
import { Voice } from "../models/voice.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const addToHistory = asyncHandler(async (req, res) => {
    const { voiceId } = req.params;
    if(!isValidObjectId(voiceId)){
        throw new ApiError(400,"Invalid VoiceId")
    }

    const voice = await Voice.findById(voiceId)
    if(!voice){
        throw new ApiError(404,"Voice not found")
    }

    await History.findOneAndDelete(
        {
            user:req.user._id,
            voice:voiceId
        }
    )
    const history = await History.create({
        user:req.user._id,
        voice:voiceId
    })
    return res.status(201).json(new ApiResponse(201,history,"Voice added to history successfully"))
});

const getHistory = asyncHandler(async (req, res) => {
    const history = await History.aggregate([
        {
            $match:{
                user:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"voices",
                localField:"voice",
                foreignField:"_id",
                as:"voice",
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
                    },{
            $project:{
                title:1,
                description:1,
                thumbnail:1,
                duration:1,
                views:1,
                owner:1,
                createdAt:1
            }
        }
                ]
            }
        },
        {
            $addFields:{
                voice:{
                    $first:"$voice"
                }
            }
        },
        {
            $match: {
             voice: {
                   $ne: null
                }
            }
         },
        {
            $sort:{
                createdAt:-1
            }
        },
        {
        $project:{
        _id:0,
        voice:1,
        listenedAt:"$createdAt"
    }
}
    ])

    return res.status(200).json(new ApiResponse(200,history,"History fetched successfully"))
});

const clearHistory = asyncHandler(async (req, res) => {
     await History.deleteMany({
        user: req.user._id
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "History cleared successfully"
        )
    );
});

export {
    addToHistory,
    getHistory,
    clearHistory
};