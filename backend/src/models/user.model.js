import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const userSchema = new Schema(
    {
        fullname: {
            type: String,
            required: true,
            trim: true
        },

        username: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true,
            index: true
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true
        },

        password: {
            type: String,
            required: true
        },
        avatar: {
            type: String,
            default: ""
        },

        coverImage: {
            type: String,
            default: ""
        },

        bio: {
            type: String,
            default: "",
            trim: true
        },
        role: {
         type: String,
          enum: ["user", "admin"],
         default: "user",
         },

        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
);


// Password hashing
userSchema.pre("save", async function () {

    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(
        this.password,
        10
    );
});


// Check password
userSchema.methods.isPasswordCorrect =
    async function (password) {

        return await bcrypt.compare(
            password,
            this.password
        );

    };


// Access token
userSchema.methods.generateAccessToken =
    function () {

        return jwt.sign(
            {
                _id: this._id,
                email: this.email,
                fullname: this.fullname,
                username: this.username
            },

            process.env.ACCESS_TOKEN_SECRET,

            {
                expiresIn:
                    process.env.ACCESS_TOKEN_EXPIRY
            }
        );

    };


// Refresh token
userSchema.methods.generateRefreshToken =
    function () {

        return jwt.sign(
            {
                _id: this._id
            },

            process.env.REFRESH_TOKEN_SECRET,

            {
                expiresIn:
                    process.env.REFRESH_TOKEN_EXPIRY
            }
        );

    };


export const User =
    mongoose.model("User", userSchema);