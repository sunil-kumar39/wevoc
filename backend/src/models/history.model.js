import mongoose, { Schema } from "mongoose";

const historySchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        voice: {
            type: Schema.Types.ObjectId,
            ref: "Voice",
            required: true
        }
    },
    {
        timestamps: true
    }
);

export const History = mongoose.model("History", historySchema);