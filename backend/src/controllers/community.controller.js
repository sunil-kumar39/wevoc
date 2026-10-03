import mongoose from "mongoose";

import { Community } from "../models/community.model.js";
import { CommunityMember } from "../models/communityMember.model.js";
import { Voice } from "../models/voice.model.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// =====================================================
// CREATE COMMUNITY
// =====================================================

const createCommunity = asyncHandler(async (req, res) => {

    const {
        name,
        description,
        college,
        icon,
        tags,
    } = req.body;


    if (!name?.trim()) {
        throw new ApiError(
            400,
            "Community name is required"
        );
    }


    if (!description?.trim()) {
        throw new ApiError(
            400,
            "Community description is required"
        );
    }


    if (!college?.trim()) {
        throw new ApiError(
            400,
            "College name is required"
        );
    }


    const existingCommunity =
        await Community.findOne({
            name: name.trim(),
            college: college.trim(),
        });


    if (existingCommunity) {
        throw new ApiError(
            409,
            "This community already exists for this college"
        );
    }


    const community =
        await Community.create({

            name: name.trim(),

            description:
                description.trim(),

            college:
                college.trim(),

            icon:
                icon?.trim() || "👥",

            tags:
                Array.isArray(tags)
                    ? tags
                    : [],

            createdBy:
                req.user._id,

            membersCount: 1,
        });


    // Creator automatically becomes owner
    await CommunityMember.create({

        community:
            community._id,

        user:
            req.user._id,

        role:
            "owner",
    });


    const populatedCommunity =
        await Community.findById(
            community._id
        ).populate(
            "createdBy",
            "fullname username avatar"
        );


    return res.status(201).json(

        new ApiResponse(
            201,
            populatedCommunity,
            "Community created successfully"
        )

    );
});


// =====================================================
// GET ALL COMMUNITIES
// =====================================================

const getAllCommunities = asyncHandler(
    async (req, res) => {

        const search =
            req.query.search?.trim() || "";


        const query = {};


        if (search) {

            query.$or = [

                {
                    name: {
                        $regex: search,
                        $options: "i",
                    },
                },

                {
                    college: {
                        $regex: search,
                        $options: "i",
                    },
                },

                {
                    description: {
                        $regex: search,
                        $options: "i",
                    },
                },

                {
                    tags: {
                        $regex: search,
                        $options: "i",
                    },
                },

            ];
        }


        const communities =
            await Community.find(query)
                .populate(
                    "createdBy",
                    "fullname username avatar"
                )
                .sort({
                    createdAt: -1,
                });


        // Find communities current user joined
        const memberships =
            await CommunityMember.find({
                user: req.user._id,
            }).select("community");


        const joinedIds =
            new Set(
                memberships.map(
                    item =>
                        item.community.toString()
                )
            );


        const result =
            communities.map(
                community => ({

                    ...community.toObject(),

                    joined:
                        joinedIds.has(
                            community._id.toString()
                        ),

                })
            );


        return res.status(200).json(

            new ApiResponse(
                200,
                result,
                "Communities fetched successfully"
            )

        );
    }
);


// =====================================================
// GET SINGLE COMMUNITY
// =====================================================

const getCommunityById = asyncHandler(
    async (req, res) => {

        const { communityId } =
            req.params;


        if (
            !mongoose.isValidObjectId(
                communityId
            )
        ) {
            throw new ApiError(
                400,
                "Invalid community id"
            );
        }


        const community =
            await Community.findById(
                communityId
            ).populate(
                "createdBy",
                "fullname username avatar"
            );


        if (!community) {
            throw new ApiError(
                404,
                "Community not found"
            );
        }


        const membership =
            await CommunityMember.findOne({
                community: communityId,
                user: req.user._id,
            });


        return res.status(200).json(

            new ApiResponse(
                200,
                {
                    ...community.toObject(),

                    joined:
                        !!membership,

                    memberRole:
                        membership?.role ||
                        null,
                },
                "Community fetched successfully"
            )

        );
    }
);


// =====================================================
// JOIN COMMUNITY
// =====================================================

const joinCommunity = asyncHandler(
    async (req, res) => {

        const { communityId } =
            req.params;


        if (
            !mongoose.isValidObjectId(
                communityId
            )
        ) {
            throw new ApiError(
                400,
                "Invalid community id"
            );
        }


        const community =
            await Community.findById(
                communityId
            );


        if (!community) {
            throw new ApiError(
                404,
                "Community not found"
            );
        }


        const alreadyMember =
            await CommunityMember.findOne({

                community:
                    communityId,

                user:
                    req.user._id,

            });


        if (alreadyMember) {

            throw new ApiError(
                400,
                "You are already a member of this community"
            );
        }


        await CommunityMember.create({

            community:
                communityId,

            user:
                req.user._id,

            role:
                "member",

        });


        await Community.findByIdAndUpdate(
            communityId,
            {
                $inc: {
                    membersCount: 1,
                },
            }
        );


        return res.status(200).json(

            new ApiResponse(
                200,
                {
                    joined: true,
                },
                "Joined community successfully"
            )

        );
    }
);


// =====================================================
// LEAVE COMMUNITY
// =====================================================

const leaveCommunity = asyncHandler(
    async (req, res) => {

        const { communityId } =
            req.params;


        if (
            !mongoose.isValidObjectId(
                communityId
            )
        ) {
            throw new ApiError(
                400,
                "Invalid community id"
            );
        }


        const membership =
            await CommunityMember.findOne({

                community:
                    communityId,

                user:
                    req.user._id,

            });


        if (!membership) {

            throw new ApiError(
                400,
                "You are not a member of this community"
            );
        }


        if (
            membership.role ===
            "owner"
        ) {

            throw new ApiError(
                400,
                "Community owner cannot leave the community"
            );
        }


        await CommunityMember.findByIdAndDelete(
            membership._id
        );


        await Community.findByIdAndUpdate(
            communityId,
            {
                $inc: {
                    membersCount: -1,
                },
            }
        );


        return res.status(200).json(

            new ApiResponse(
                200,
                {
                    joined: false,
                },
                "Left community successfully"
            )

        );
    }
);


// =====================================================
// GET MEMBERS
// =====================================================

const getCommunityMembers =
    asyncHandler(
        async (req, res) => {

            const { communityId } =
                req.params;


            if (
                !mongoose.isValidObjectId(
                    communityId
                )
            ) {
                throw new ApiError(
                    400,
                    "Invalid community id"
                );
            }


            const community =
                await Community.findById(
                    communityId
                );


            if (!community) {
                throw new ApiError(
                    404,
                    "Community not found"
                );
            }


            const members =
                await CommunityMember.find({
                    community:
                        communityId,
                })
                    .populate(
                        "user",
                        "fullname username avatar bio"
                    )
                    .sort({
                        createdAt: -1,
                    });


            return res.status(200).json(

                new ApiResponse(
                    200,
                    {
                        members,
                        totalMembers:
                            members.length,
                    },
                    "Community members fetched successfully"
                )

            );
        }
    );

    const getCommunityPosts = asyncHandler(
    async (req, res) => {

        const { communityId } =
            req.params;


        if (
            !mongoose.isValidObjectId(
                communityId
            )
        ) {
            throw new ApiError(
                400,
                "Invalid community id"
            );
        }


        const community =
            await Community.findById(
                communityId
            );


        if (!community) {
            throw new ApiError(
                404,
                "Community not found"
            );
        }


        const voices =
            await Voice.find({
                community: communityId,
                isPublished: true
            })
                .populate(
                    "owner",
                    "fullname username avatar"
                )
                .populate(
                    "community",
                    "name icon college"
                )
                .sort({
                    createdAt: -1
                });


        return res.status(200).json(

            new ApiResponse(
                200,
                voices,
                "Community posts fetched successfully"
            )

        );
    }
);

// =====================================================
// UPDATE COMMUNITY
// =====================================================

const updateCommunity =
    asyncHandler(
        async (req, res) => {

            const { communityId } =
                req.params;


            if (
                !mongoose.isValidObjectId(
                    communityId
                )
            ) {
                throw new ApiError(
                    400,
                    "Invalid community id"
                );
            }


            const community =
                await Community.findById(
                    communityId
                );


            if (!community) {
                throw new ApiError(
                    404,
                    "Community not found"
                );
            }


            if (
                community.createdBy.toString() !==
                req.user._id.toString()
            ) {

                throw new ApiError(
                    403,
                    "Only community owner can update it"
                );
            }


            const {
                name,
                description,
                college,
                icon,
                tags,
            } = req.body;


            if (name !== undefined) {
                community.name =
                    name.trim();
            }


            if (description !== undefined) {
                community.description =
                    description.trim();
            }


            if (college !== undefined) {
                community.college =
                    college.trim();
            }


            if (icon !== undefined) {
                community.icon =
                    icon.trim();
            }


            if (tags !== undefined) {
                community.tags =
                    Array.isArray(tags)
                        ? tags
                        : [];
            }


            await community.save();


            const updated =
                await Community.findById(
                    communityId
                ).populate(
                    "createdBy",
                    "fullname username avatar"
                );


            return res.status(200).json(

                new ApiResponse(
                    200,
                    updated,
                    "Community updated successfully"
                )

            );
        }
    );


// =====================================================
// DELETE COMMUNITY
// =====================================================

const deleteCommunity =
    asyncHandler(
        async (req, res) => {

            const { communityId } =
                req.params;


            if (
                !mongoose.isValidObjectId(
                    communityId
                )
            ) {
                throw new ApiError(
                    400,
                    "Invalid community id"
                );
            }


            const community =
                await Community.findById(
                    communityId
                );


            if (!community) {
                throw new ApiError(
                    404,
                    "Community not found"
                );
            }


            if (
                community.createdBy.toString() !==
                req.user._id.toString() &&
                req.user.role !== "admin"
            ) {

                throw new ApiError(
                    403,
                    "You are not allowed to delete this community"
                );
            }


            await CommunityMember.deleteMany({
                community:
                    communityId,
            });


            await Community.findByIdAndDelete(
                communityId
            );


            return res.status(200).json(

                new ApiResponse(
                    200,
                    {},
                    "Community deleted successfully"
                )

            );
        }
    );


export {
    createCommunity,
    getAllCommunities,
    getCommunityById,
    joinCommunity,
    leaveCommunity,
    getCommunityMembers,
    updateCommunity,
    deleteCommunity,
    getCommunityPosts
};