import mongoose, { Schema } from "mongoose";

const communitySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },

        college: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },

        icon: {
            type: String,
            default: "👥",
        },

        tags: [
            {
                type: String,
                trim: true,
                lowercase: true,
            },
        ],

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        membersCount: {
            type: Number,
            default: 0,
        },

        postsCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

communitySchema.index({
    name: "text",
    college: "text",
    description: "text",
});

export const Community = mongoose.model(
    "Community",
    communitySchema
);