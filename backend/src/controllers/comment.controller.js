import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import { Voice } from "../models/voice.model.js";
import { Notification } from "../models/notification.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const addComment = asyncHandler(async(req,res)=>{
    const { voiceId } = req.params;

    const { content } = req.body;
    if(!isValidObjectId(voiceId)){
        throw new ApiError(400,"Invalid VoiceId")
    }

    if (!content || content.trim() === "") {
    throw new ApiError(400, "Comment content is required");
}
    const voice = await Voice.findById(voiceId)
    if(!voice){
        throw new ApiError(404,"Voice not found")
    }

    const comment = await Comment.create({
        content,
        voice:voiceId,
        owner:req.user._id
    })

    if (voice.owner.toString() !== req.user._id.toString()) {
    await Notification.create({
        sender: req.user._id,
        receiver: voice.owner,
        type: "comment",
        voice: voiceId,
        comment: comment._id
    });
    }
    return res.status(201).json(new ApiResponse(201,comment,"Comment added successfully"))
})

const getVoiceComments = asyncHandler(async(req,res)=>{
    const { voiceId } = req.params;

    if(!isValidObjectId(voiceId)){
        throw new ApiError(400,"Invalid VoiceId")
    }

    const voice = await Voice.findById(voiceId)
    if(!voice){
        throw new ApiError(404,"Voice not found")
    }

    const comments = await Comment.aggregate([
        {
            $match:{
                voice:new mongoose.Types.ObjectId(voiceId)
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
            $project:{
                _id:1,
                content:1,
                createdAt:1,
                owner:1
            }
        },
        {
            $sort:{
                createdAt:-1
            }
        }
    ])

    return res.status(200).json(
    new ApiResponse(
        200,
        comments,
        "Comments fetched successfully"
    )
);

})

const updateComment = asyncHandler(async(req,res)=>{
    const {commentId} = req.params
    const { content } = req.body;
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid CommentId")
    }
    if(!content || content.trim()===""){
        throw new ApiError(400, "Comment content is required");
    }

    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404,"Comment not found")
    }


    if(comment.owner.toString()!==req.user._id.toString()){
        throw new ApiError(403, "You are not authorized to update comment");
    }
    const updatedComment = await Comment.findByIdAndUpdate(commentId,{
        $set:{
            content
        }
    },{new:true})
    return res.status(200).json(new ApiResponse(200,updatedComment,"Comment updated successfully"))
})

const deleteComment = asyncHandler(async(req,res)=>{
    const {commentId} = req.params
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid CommentId")
    }

    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404,"Comment not found")
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
        403,
        "You are not authorized to delete this comment"
    );
    }

    await Comment.findByIdAndDelete(commentId)
    return res.status(200).json(new ApiResponse(200,{},"Comment deleted successfully"))
})

export { addComment,getVoiceComments,updateComment,deleteComment }