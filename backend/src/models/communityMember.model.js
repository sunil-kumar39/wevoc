import mongoose, { Schema } from "mongoose";

const communityMemberSchema = new Schema(
    {
        community: {
            type: Schema.Types.ObjectId,
            ref: "Community",
            required: true,
        },

        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        role: {
            type: String,
            enum: ["member", "moderator", "owner"],
            default: "member",
        },
    },
    {
        timestamps: true,
    }
);

communityMemberSchema.index(
    {
        community: 1,
        user: 1,
    },
    {
        unique: true,
    }
);

export const CommunityMember =
    mongoose.model(
        "CommunityMember",
        communityMemberSchema
    );