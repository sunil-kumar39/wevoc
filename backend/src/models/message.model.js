import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
    {
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        receiver: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        voiceFile: {
            type: String,
            required: true,
        },

        duration: {
            type: Number,
            default: 0,
        },

        isRead: {
            type: Boolean,
            default: false,
        },

        readAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Sender -> Receiver conversation
messageSchema.index({
    sender: 1,
    receiver: 1,
    createdAt: -1,
});

// Receiver -> Sender conversation
messageSchema.index({
    receiver: 1,
    sender: 1,
    createdAt: -1,
});

export const Message = mongoose.model(
    "Message",
    messageSchema
);