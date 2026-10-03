import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { Notification } from "../models/notification.model.js";
import { Voice } from "../models/voice.model.js";

import mongoose, {
    isValidObjectId
} from "mongoose";


const toggleVoiceLike = asyncHandler(
    async (req, res) => {

        const { voiceId } = req.params;



        if (!isValidObjectId(voiceId)) {
            throw new ApiError(
                400,
                "Invalid VoiceId"
            );
        }


        const voice =
            await Voice.findById(
                voiceId
            );


        if (!voice) {
            throw new ApiError(
                404,
                "Voice not found"
            );
        }


        const existingLike =
            await Like.findOne({
                voice: voiceId,
                likedBy: req.user._id
            });

        if (existingLike) {

            await Like.findOneAndDelete({
                voice: voiceId,
                likedBy: req.user._id
            });


            await Notification.findOneAndDelete({
                sender: req.user._id,
                receiver: voice.owner,
                type: "like",
                voice: voiceId
            });


            return res.status(200).json(
                new ApiResponse(
                    200,
                    {
                        isLiked: false
                    },
                    "Voice unliked successfully"
                )
            );

        }



        const like =
            await Like.create({
                voice: voiceId,
                likedBy: req.user._id
            });


        if (
            voice.owner.toString() !==
            req.user._id.toString()
        ) {

            const existingNotification =
                await Notification.findOne({
                    sender: req.user._id,
                    receiver: voice.owner,
                    type: "like",
                    voice: voiceId
                });


            if (!existingNotification) {

                await Notification.create({
                    sender: req.user._id,
                    receiver: voice.owner,
                    type: "like",
                    voice: voiceId
                });

            }

        }


        return res.status(201).json(
            new ApiResponse(
                201,
                {
                    ...like.toObject(),
                    isLiked: true
                },
                "Voice Liked successfully"
            )
        );

    }
);




const getLikedVoices =
    asyncHandler(
        async (req, res) => {

            const likedVoices =
                await Like.aggregate([

                    {
                        $match: {
                            likedBy:
                                new mongoose.Types.ObjectId(
                                    req.user._id
                                ),

                            voice: {
                                $ne: null
                            }
                        }
                    },

                    {
                        $lookup: {
                            from: "voices",

                            localField: "voice",

                            foreignField: "_id",

                            as: "voice",

                            pipeline: [

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
                                            $first:
                                                "$owner"
                                        }
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
                                        owner: 1
                                    }
                                }

                            ]
                        }
                    },

                    {
                        $addFields: {
                            voice: {
                                $first:
                                    "$voice"
                            }
                        }
                    },

                    {
                        $project: {
                            _id: 0,
                            likedAt:
                                "$createdAt",
                            voice: 1
                        }
                    }

                ]);


            return res.status(200).json(
                new ApiResponse(
                    200,
                    likedVoices,
                    "Liked voices fetched successfully"
                )
            );

        }
    );


const toggleCommentLike =
    asyncHandler(
        async (req, res) => {

            const { commentId } =
                req.params;


            if (
                !isValidObjectId(
                    commentId
                )
            ) {

                throw new ApiError(
                    400,
                    "Invalid CommentId"
                );

            }


            const comment =
                await Comment.findById(
                    commentId
                );


            if (!comment) {

                throw new ApiError(
                    404,
                    "Comment not found"
                );

            }


            const existingLike =
                await Like.findOne({
                    comment: commentId,
                    likedBy: req.user._id
                });


            if (existingLike) {

                await Like.findOneAndDelete({
                    comment: commentId,
                    likedBy: req.user._id
                });


                return res.status(200).json(
                    new ApiResponse(
                        200,
                        {
                            isLiked: false
                        },
                        "Comment unliked successfully"
                    )
                );

            }


            const like =
                await Like.create({
                    comment: commentId,
                    likedBy: req.user._id
                });


            return res.status(201).json(
                new ApiResponse(
                    201,
                    {
                        ...like.toObject(),
                        isLiked: true
                    },
                    "Comment Liked successfully"
                )
            );

        }
    );


const getLikedComments =
    asyncHandler(
        async (req, res) => {

            const likedComments =
                await Like.aggregate([

                    {
                        $match: {

                            likedBy:
                                new mongoose.Types.ObjectId(
                                    req.user._id
                                ),

                            comment: {
                                $ne: null
                            }

                        }
                    },

                    {
                        $lookup: {

                            from: "comments",

                            localField: "comment",

                            foreignField: "_id",

                            as: "comment",

                            pipeline: [

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
                                            $first:
                                                "$owner"
                                        }

                                    }
                                },

                                {
                                    $project: {

                                        _id: 1,
                                        content: 1,
                                        voice: 1,
                                        createdAt: 1,
                                        updatedAt: 1,
                                        owner: 1

                                    }

                                }

                            ]

                        }

                    },

                    {
                        $addFields: {

                            comment: {
                                $first:
                                    "$comment"
                            }

                        }

                    },

                    {
                        $project: {

                            _id: 0,

                            likedAt:
                                "$createdAt",

                            comment: 1

                        }

                    }

                ]);


            return res.status(200).json(
                new ApiResponse(
                    200,
                    likedComments,
                    "Liked Comments fetched successfully"
                )
            );

        }
    );


export {
    toggleVoiceLike,
    getLikedVoices,
    toggleCommentLike,
    getLikedComments
};