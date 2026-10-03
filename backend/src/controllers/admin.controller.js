import mongoose from "mongoose";

import { User } from "../models/user.model.js";
import { Voice } from "../models/voice.model.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const getAdminDashboard = asyncHandler(async (req, res) => {

    const [
        totalUsers,
        totalVoices
    ] = await Promise.all([
        User.countDocuments(),
        Voice.countDocuments({
            isPublished: true
        })
    ]);


    const recentUsers = await User.find()
        .select(
            "fullname username email avatar role createdAt"
        )
        .sort({
            createdAt: -1
        })
        .limit(5);


    const recentVoices = await Voice.find({
        isPublished: true
    })
        .populate(
            "owner",
            "fullname username avatar"
        )
        .select(
            "title description thumbnail voiceFile views likesCount owner createdAt"
        )
        .sort({
            createdAt: -1
        })
        .limit(5);


    return res.status(200).json(
        new ApiResponse(
            200,
            {
                stats: {
                    totalUsers,
                    totalVoices
                },

                recentUsers,
                recentVoices
            },
            "Admin dashboard fetched successfully"
        )
    );
});


const getAllUsers = asyncHandler(async (req, res) => {

    const page =
        parseInt(req.query.page) || 1;

    const limit =
        parseInt(req.query.limit) || 20;

    const search =
        req.query.search?.trim() || "";


    const skip =
        (page - 1) * limit;


    const query = {};


    if (search) {

        query.$or = [
            {
                fullname: {
                    $regex: search,
                    $options: "i"
                }
            },
            {
                username: {
                    $regex: search,
                    $options: "i"
                }
            },
            {
                email: {
                    $regex: search,
                    $options: "i"
                }
            }
        ];

    }


    const [
        users,
        totalUsers
    ] = await Promise.all([

        User.find(query)
            .select(
                "-password -refreshToken"
            )
            .sort({
                createdAt: -1
            })
            .skip(skip)
            .limit(limit),

        User.countDocuments(query)

    ]);


    return res.status(200).json(
        new ApiResponse(
            200,
            {
                users,
                page,
                limit,
                totalUsers,
                totalPages:
                    Math.ceil(
                        totalUsers / limit
                    )
            },
            "Users fetched successfully"
        )
    );
});


const deleteUser = asyncHandler(async (req, res) => {

    const { userId } = req.params;


    if (
        !mongoose.isValidObjectId(userId)
    ) {
        throw new ApiError(
            400,
            "Invalid user id"
        );
    }


    if (
        userId.toString() ===
        req.user._id.toString()
    ) {
        throw new ApiError(
            400,
            "Admin cannot delete himself"
        );
    }


    const user = await User.findById(userId);


    if (!user) {
        throw new ApiError(
            404,
            "User not found"
        );
    }


    if (user.role === "admin") {
        throw new ApiError(
            403,
            "Admin user cannot be deleted"
        );
    }


    await User.findByIdAndDelete(userId);


    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "User deleted successfully"
        )
    );
});


const getAllVoices = asyncHandler(async (req, res) => {

    const page =
        parseInt(req.query.page) || 1;

    const limit =
        parseInt(req.query.limit) || 20;

    const search =
        req.query.search?.trim() || "";


    const skip =
        (page - 1) * limit;


    const query = {
        isPublished: true
    };


    if (search) {

        query.$or = [
            {
                title: {
                    $regex: search,
                    $options: "i"
                }
            },
            {
                description: {
                    $regex: search,
                    $options: "i"
                }
            }
        ];

    }


    const [
        voices,
        totalVoices
    ] = await Promise.all([

        Voice.find(query)
            .populate(
                "owner",
                "fullname username avatar"
            )
            .sort({
                createdAt: -1
            })
            .skip(skip)
            .limit(limit),

        Voice.countDocuments(query)

    ]);


    return res.status(200).json(
        new ApiResponse(
            200,
            {
                voices,
                page,
                limit,
                totalVoices,
                totalPages:
                    Math.ceil(
                        totalVoices / limit
                    )
            },
            "Admin voices fetched successfully"
        )
    );
});


const deleteVoice = asyncHandler(async (req, res) => {

    const { voiceId } = req.params;


    if (
        !mongoose.isValidObjectId(voiceId)
    ) {
        throw new ApiError(
            400,
            "Invalid voice id"
        );
    }


    const voice =
        await Voice.findById(voiceId);


    if (!voice) {
        throw new ApiError(
            404,
            "Voice not found"
        );
    }


    await Voice.findByIdAndDelete(
        voiceId
    );


    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Voice deleted successfully"
        )
    );
});

const getUserDetails = asyncHandler(async (req, res) => {

    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id");
    }

    const user = await User.findById(userId)
        .select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const [voicesCount, followersCount, followingCount] =
        await Promise.all([
            Voice.countDocuments({
                owner: userId,
                isPublished: true
            }),

            mongoose.connection.collection("follows").countDocuments({
                following: new mongoose.Types.ObjectId(userId)
            }),

            mongoose.connection.collection("follows").countDocuments({
                follower: new mongoose.Types.ObjectId(userId)
            })
        ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user,
                stats: {
                    voices: voicesCount,
                    followers: followersCount,
                    following: followingCount
                }
            },
            "User details fetched successfully"
        )
    );
});

export {
    getAdminDashboard,
    getAllUsers,
    deleteUser,
    getAllVoices,
    deleteVoice,getUserDetails
};