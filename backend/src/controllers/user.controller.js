import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from "../config/cloudinary.js";
import { ApiResponse } from '../utils/ApiResponse.js';
import { Follow } from "../models/follow.model.js";
import jwt from "jsonwebtoken"
import mongoose from 'mongoose';

const generateAccessAndRefreshTokens = async(userId)=>{
    try{
        const user = await User.findById(userId)
        if (!user) {
         throw new ApiError(404, "User not found");
        }
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}
    }
    catch(error){
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    const {
        fullname,
        email,
        username,
        password
    } = req.body;

    if (
        [fullname, email, username, password]
            .some((field) => field?.trim() === "")
    ) {

        throw new ApiError(
            400,
            "All fields are required"
        );

    }

    const existedUser = await User.findOne({
        $or: [
            { username },
            { email }
        ]
    });


    if (existedUser) {

        throw new ApiError(
            409,
            "User with email or username already exists"
        );

    }

    const avatarLocalPath =
        req.files?.avatar?.[0]?.path;


    let coverImageLocalPath;


    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {

        coverImageLocalPath =
            req.files.coverImage[0].path;

    }

    let avatarUrl = "";


    if (avatarLocalPath) {

        const avatar =
            await uploadOnCloudinary(
                avatarLocalPath
            );


        if (
            !avatar ||
            !avatar.url
        ) {

            throw new ApiError(
                400,
                "Failed to upload avatar on cloudinary"
            );

        }


        avatarUrl = avatar.url;

    }

    let coverImageUrl = "";


    if (coverImageLocalPath) {

        const coverImage =
            await uploadOnCloudinary(
                coverImageLocalPath
            );


        if (
            !coverImage ||
            !coverImage.url
        ) {

            throw new ApiError(
                400,
                "Failed to upload cover image on cloudinary"
            );

        }


        coverImageUrl =
            coverImage.url;

    }

    const user = await User.create({

        fullname,

        avatar: avatarUrl,

        coverImage: coverImageUrl,

        email,

        password,

        username:
            username
                .trim()
                .toLowerCase()

    });

    const createdUser =
        await User.findById(
            user._id
        ).select(
            "-password -refreshToken"
        );


    if (!createdUser) {

        throw new ApiError(
            500,
            "Something went wrong while registering user"
        );

    }


    return res.status(201).json(

        new ApiResponse(
            201,
            createdUser,
            "User registered successfully"
        )

    );

});

const loginUser = asyncHandler(async(req,res)=>{
    const {email,username,password} = req.body

    if (!(username || email) || !password) {
    throw new ApiError(400, "Username/email and password are required");
}

    const user = await User.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw new ApiError(401,"Invalid credentials")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials")
    }

    const {accessToken,refreshToken} = await  generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production"
        ? "none"
        : "lax"
};

    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken},"User loggedIn successfully"))
})

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken:1
            }
        },
        {
            new:true
        }
    )

    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request")
    }
    try{
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401,"Invalid refresh Token")
        }

        if(incomingRefreshToken!==user?.refreshToken){
            throw new ApiError(401,"Refresh Token is expired or used")
        }

        const options={
            httpOnly:true,
            secure:true
        }

        const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)
        return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options)
        .json(new ApiResponse(200,{accessToken,refreshToken},"Access token refreshed"))
    }
    catch(error){
        throw new ApiError(401,error?.message || "Invalid refresh Token")
    }
})

const getCurrentUser = asyncHandler(async(req,res)=>{
   return res.status(200).json(new ApiResponse(200,req.user,"User fetched Successfully"))
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword} = req.body

    if (
    [oldPassword, newPassword].some(
        (field) => field?.trim() === ""
    )
) {
    throw new ApiError(400,"All fields are required")
}

    if (oldPassword === newPassword) {
    throw new ApiError(
        400,
        "New password must be different from old password"
    )
    }
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(401, "Invalid old password")
    }

    user.password = newPassword
    await user.save()
    return res.status(200).json(new ApiResponse(200,{},"Password changed successfully"))
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullname,email,bio} = req.body
    if([fullname, email, bio].some((field)=> field?.trim()==="")){
        throw new ApiError(400,"All fields are required")
    }

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                fullname,
                email,
                bio
            }
        },
        {
            new:true
        }
    ).select("-password -refreshToken")

    res.status(200).json(new ApiResponse(200,user,"User details updated successfully"))

})

const  updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar || !avatar.url){
        throw new ApiError(400,"error while updating avatar")
    }

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {
            new:true
        }
    ).select("-password -refreshToken")

    return res.status(200).json(new ApiResponse(200,user,"Avatar updated successfully"))
})

const  updateUserCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400,"coverImage file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage || !coverImage.url){
        throw new ApiError(400,"error while updating coverImage")
    }

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {
            new:true
        }
    ).select("-password -refreshToken")

    return res.status(200).json(new ApiResponse(200,user,"coverImage updated successfully"))
})

const getSuggestedUsers = asyncHandler(async (req, res) => {

    const currentUserId = req.user._id;

    const following = await Follow.find({
        follower: currentUserId
    }).select("following");

    const followingIds = following.map(
        item => item.following
    );

    followingIds.push(currentUserId);

    const users = await User.find({
        _id: {
            $nin: followingIds
        }
    })
        .select("fullname username avatar bio")
        .limit(5);

    return res.status(200).json(
        new ApiResponse(
            200,
            users,
            "Suggested users fetched successfully"
        )
    );
});

export {generateAccessAndRefreshTokens,registerUser,loginUser,logoutUser,refreshAccessToken
    ,getCurrentUser,updateAccountDetails,updateUserAvatar,updateUserCoverImage,changeCurrentPassword,getSuggestedUsers}