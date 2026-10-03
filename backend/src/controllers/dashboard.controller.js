import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { Voice } from "../models/voice.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { Follow } from "../models/follow.model.js";
import { User } from "../models/user.model.js";

const getDashboard = asyncHandler(async (req, res) => {
    const  dashboard = await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {//user voices
            $lookup:{
                from:"voices",
                localField:"_id",
                foreignField:"owner",
                as:"voices",
                pipeline:[
                    {
                        $project:{
                            _id:1,
                            views:1
                        }
                    }
                ]
            }
        },
        {//user voice likes
            $lookup:{
                from:"likes",
                localField:"voices._id",
                foreignField:"voice",
                as:"voiceLikes",
                pipeline:[
                    {
                        $project:{
                            _id:1
                        }
                    }
                ]
            }
        },
        {//user voice comments
            $lookup:{
                from:"comments",
                localField:"voices._id",
                foreignField:"voice",
                as:"voiceComments",
                pipeline:[
                    {
                        $project:{
                            _id:1
                        }
                    }
                ]
            }
        },
        {//followers
            $lookup:{
                from:"follows",
                localField:"_id",
                foreignField:"following",
                as:"followers",
                pipeline:[
                    {
                        $project:{
                            _id:1
                        }
                    }
                ]
            }
        },
        {//following
            $lookup:{
                from:"follows",
                localField:"_id",
                foreignField:"follower",
                as:"following",
                pipeline:[{
                    $project:{
                        _id:1
                    }
                }
            ]
            }
        },
        {//playlists
            $lookup:{
                from:"playlists",
                localField:"_id",
                foreignField:"owner",
                as:"playlists",
                pipeline:[
                    {
                        $project:{
                            _id:1
                        }
                    }
                ]
            }
        },
        {//count+total views
            $addFields:{
                totalVoices:{
                    $size:"$voices"
                },
                totalLikes:{
                    $size:"$voiceLikes"
                },
                totalComments:{
                    $size:"$voiceComments"
                },
                totalFollowers:{
                    $size:"$followers"
                },
                totalFollowing:{
                    $size:"$following"
                },
                totalPlaylists:{
                    $size: "$playlists"
                },
                totalViews:{
                    $reduce:{
                        input:"$voices",
                        initialValue:0,
                        in:{
                            $add:[
                                "$$value",
                                "$$this.views"
                            ]
                        }
                    }
                }
            }
        },
        {
            $project:{
                _id:0,
                totalVoices: 1,
                totalViews: 1,
                totalLikes: 1,
                totalComments: 1,
                totalFollowers: 1,
                totalFollowing: 1,
                totalPlaylists: 1
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200,dashboard[0],"Dashboard fetched successfully"))

});

export {
    getDashboard
};