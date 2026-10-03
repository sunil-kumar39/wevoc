import mongoose, { Schema } from "mongoose";

const voiceSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },

        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },

        voiceFile: {
            type: String,
            required: true,
        },

        thumbnail: {
            type: String,
            default: "",
        },

        duration: {
            type: Number,
            default: 0,
        },

        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Community post ke liye
        community: {
            type: Schema.Types.ObjectId,
            ref: "Community",
            default: null,
        },

        views: {
            type: Number,
            default: 0,
        },

        isPublished: {
            type: Boolean,
            default: true,
        },

        isAnonymous: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);


// Useful indexes
voiceSchema.index({
    community: 1,
    createdAt: -1,
});

voiceSchema.index({
    owner: 1,
    createdAt: -1,
});

voiceSchema.index({
    isPublished: 1,
    createdAt: -1,
});


export const Voice = mongoose.model(
    "Voice",
    voiceSchema
);