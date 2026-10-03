import mongoose, { Schema } from "mongoose";

const bookmarkSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        voice: {
            type: Schema.Types.ObjectId,
            ref: "Voice",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Same user same voice ko multiple baar bookmark
// nahi kar sakta
bookmarkSchema.index(
    {
        user: 1,
        voice: 1,
    },
    {
        unique: true,
    }
);

export const Bookmark = mongoose.model(
    "Bookmark",
    bookmarkSchema
);