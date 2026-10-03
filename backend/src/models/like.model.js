import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
    {
        voice:{
            type:Schema.Types.ObjectId,
            ref:"Voice"
        },
        comment:{
            type:Schema.Types.ObjectId,
            ref:"Comment"
        },
        likedBy:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        }
    },
    {
        timestamps:true
    }
)

export const Like = mongoose.model("Like", likeSchema);