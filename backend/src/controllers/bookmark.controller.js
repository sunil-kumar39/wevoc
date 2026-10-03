import mongoose, { isValidObjectId } from "mongoose";

import { Bookmark } from "../models/bookmark.model.js";
import { Voice } from "../models/voice.model.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const toggleBookmark = asyncHandler(async (req, res) => {

    const { voiceId } = req.params;

    if (!isValidObjectId(voiceId)) {
        throw new ApiError(400, "Invalid VoiceId");
    }

    const voice = await Voice.findById(voiceId);

    if (!voice) {
        throw new ApiError(404, "Voice not found");
    }

    const existingBookmark = await Bookmark.findOne({
        user: req.user._id,
        voice: voiceId,
    });

    // Remove bookmark
    if (existingBookmark) {

        await Bookmark.findByIdAndDelete(
            existingBookmark._id
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    bookmarked: false,
                },
                "Bookmark removed successfully"
            )
        );
    }

    // Add bookmark
    const bookmark = await Bookmark.create({
        user: req.user._id,
        voice: voiceId,
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                bookmark,
                bookmarked: true,
            },
            "Voice bookmarked successfully"
        )
    );
});


const getBookmarkedVoices = asyncHandler(
    async (req, res) => {

        const bookmarks = await Bookmark.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(
                        req.user._id
                    ),
                },
            },

            {
                $lookup: {
                    from: "voices",
                    localField: "voice",
                    foreignField: "_id",
                    as: "voice",

                    pipeline: [
                        {
                            $match: {
                                isPublished: true,
                            },
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
                                            avatar: 1,
                                        },
                                    },
                                ],
                            },
                        },

                        {
                            $addFields: {
                                owner: {
                                    $first: "$owner",
                                },
                            },
                        },

                        {
                            $project: {
                                _id: 1,
                                title: 1,
                                description: 1,
                                voiceFile: 1,
                                thumbnail: 1,
                                duration: 1,
                                views: 1,
                                owner: 1,
                                createdAt: 1,
                            },
                        },
                    ],
                },
            },

            {
                $addFields: {
                    voice: {
                        $first: "$voice",
                    },
                },
            },

            {
                $match: {
                    voice: {
                        $ne: null,
                    },
                },
            },

            {
                $project: {
                    _id: 1,
                    bookmarkedAt: "$createdAt",
                    voice: 1,
                },
            },

            {
                $sort: {
                    bookmarkedAt: -1,
                },
            },
        ]);

        return res.status(200).json(
            new ApiResponse(
                200,
                bookmarks,
                "Bookmarked voices fetched successfully"
            )
        );
    }
);


const checkBookmark = asyncHandler(
    async (req, res) => {

        const { voiceId } = req.params;

        if (!isValidObjectId(voiceId)) {
            throw new ApiError(
                400,
                "Invalid VoiceId"
            );
        }

        const bookmark = await Bookmark.findOne({
            user: req.user._id,
            voice: voiceId,
        });

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    bookmarked: !!bookmark,
                },
                "Bookmark status fetched successfully"
            )
        );
    }
);


export {
    toggleBookmark,
    getBookmarkedVoices,
    checkBookmark,
};