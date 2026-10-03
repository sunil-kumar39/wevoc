import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

import { User } from "../models/user.model.js";
import { Voice } from "../models/voice.model.js";


const searchUsers = asyncHandler(async (req, res) => {

    const { query } = req.query;

    if (!query || query.trim() === "") {
        throw new ApiError(
            400,
            "Search query is required"
        );
    }

    const users = await User.find({
        $or: [
            {
                fullname: {
                    $regex: query.trim(),
                    $options: "i"
                }
            },
            {
                username: {
                    $regex: query.trim(),
                    $options: "i"
                }
            }
        ]
    })
        .select(
            "fullname username avatar bio"
        )
        .limit(20);


    return res.status(200).json(
        new ApiResponse(
            200,
            users,
            "Users fetched successfully"
        )
    );

});


const searchVoices = asyncHandler(async (req, res) => {

    const { query } = req.query;

    if (!query || query.trim() === "") {
        throw new ApiError(
            400,
            "Search query is required"
        );
    }


    const voices = await Voice.aggregate([

        {
            $match: {

                isPublished: true,

                $or: [
                    {
                        title: {
                            $regex: query.trim(),
                            $options: "i"
                        }
                    },
                    {
                        description: {
                            $regex: query.trim(),
                            $options: "i"
                        }
                    }

                ]

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
            $lookup: {

                from: "likes",

                localField: "_id",

                foreignField: "voice",

                as: "likes"

            }

        },

        {
            $addFields: {

                likesCount: {
                    $size: "$likes"
                }

            }

        },

        {
            $project: {

                likes: 0

            }

        },

        {
            $sort: {

                createdAt: -1

            }

        },

        {
            $project: {

                _id: 1,

                title: 1,

                description: 1,

                thumbnail: 1,

                voiceFile: 1,

                duration: 1,

                views: 1,

                likesCount: 1,

                createdAt: 1,

                owner: 1

            }

        }

    ]);


    return res.status(200).json(
        new ApiResponse(
            200,
            voices,
            "Voices fetched successfully"
        )
    );

});


export {
    searchUsers,
    searchVoices
};