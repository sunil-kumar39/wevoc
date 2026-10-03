import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
    {
        content:{
            type:String,
            required:true,
            trim:true
        },
        voice:{
            type:Schema.Types.ObjectId,
            ref:"Voice",
            required:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        }
    },
    {
        timestamps:true
    }
)

export const Comment = mongoose.model("Comment", commentSchema);