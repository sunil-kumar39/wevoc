import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true,
            default: ""
        },

        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        voices: [
            {
                type: Schema.Types.ObjectId,
                ref: "Voice"
            }
        ]
    },
    {
        timestamps: true
    }
);

export const Playlist = mongoose.model("Playlist", playlistSchema);