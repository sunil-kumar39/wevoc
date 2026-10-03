import mongoose, { isValidObjectId } from "mongoose";
import { Follow } from "../models/follow.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Notification } from "../models/notification.model.js";

const toggleFollow = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid UserId")
    }
    const user = await User.findById(userId)
    if(!user){
        throw new ApiError(404,"User not found")
    }

    if (userId === req.user._id.toString()) {
    throw new ApiError(400, "You cannot follow yourself");
    }

    const isFollowing = await Follow.findOne({
        follower:req.user._id,
        following:userId
    })
    if(isFollowing){
        await Follow.findOneAndDelete({
            follower:req.user._id,
            following:userId
        })
        return res.status(200).json(new ApiResponse(200,{},"User unfollowed successfully"))
    }

    const follow = await Follow.create({
        follower:req.user._id,
        following:userId
    })

    await Notification.create({
    sender: req.user._id,
    receiver: userId,
    type: "follow"
    });

    return res.status(201).json(new ApiResponse(201,follow,"User followed successfully"))
});

const getFollowers = asyncHandler(async(req,res)=>{
    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid UserId")
    }
    const user = await User.findById(userId);

if (!user) {
    throw new ApiError(404, "User not found");
}
    const followers = await Follow.aggregate([
        {
            $match:{
               following:new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"follower",
                foreignField:"_id",
                as:"follower",
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
                follower:{
                    $first:"$follower"
                }
            }
        },
        {
         $project: {
        _id: 0,
        follower: 1,
        followedAt: "$createdAt"
        }
        }
    ])
     const totalFollowers = followers.length;

    return res.status(200).json(new ApiResponse(200,{followers,totalFollowers},"Followers fetched successfully"))
})

const getFollowing = asyncHandler(async(req,res)=>{
    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid UserId")
    }
    const user = await User.findById(userId);

if (!user) {
    throw new ApiError(404, "User not found");
}
    const following = await Follow.aggregate([
        {
            $match:{
               follower:new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"following",
                foreignField:"_id",
                as:"following",
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
                following:{
                    $first:"$following"
                }
            }
        },
        {
         $project: {
        _id: 0,
        following: 1,
        followedAt: "$createdAt"
        }
        }
    ])
     const totalFollowing = following.length;

    return res.status(200).json(new ApiResponse(200,{following,totalFollowing},"Following fetched successfully"))
})

const getUserProfile = asyncHandler(async(req,res)=>{
    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid UserId")
    }

    const user = await User.findById(userId);
    if (!user) {
    throw new ApiError(404, "User not found");
    }

    const  userProfile = await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from:"follows",
                localField:"_id",
                foreignField:"following",
                as:"followers"
            }
        },
        {
            $lookup:{
                from:"follows",
                localField:"_id",
                foreignField:"follower",
                as:"following"
            }
        },
        {
            $addFields:{
                followersCount:{
                    $size:"$followers"
                },
                followingCount:{
                    $size:"$following"
                }
            }
        },
        {
            $addFields:{
                isFollowing:{
                    $cond:{
                        if:{
                            $in:[
                                new mongoose.Types.ObjectId(req.user._id), "$followers.follower"
                            ]
                        },
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
        $project:{
        fullname:1,
        username:1,
        avatar:1,
        bio:1,

        followersCount:1,
        followingCount:1,

        isFollowing:1
        }
        }
    ])
    return res.status(200).json(new ApiResponse(200,userProfile[0],"User Profile fetched successfully"))
})

export { toggleFollow,getFollowers,getFollowing,getUserProfile }