import { Mongoose, Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new Schema({
    userName: {
        type: String,
        require: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: string,
        require: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        require: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String,     // cloudinary url
        require: true
    },
    coverImage: {
        type: String,
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "video",
        }
    ],
    password: {
        type: String,
        require: [true, "Password Required"],
    },
    refreshToken: {
        type: String,
    },
}, { timestamps: true });

userSchema.pre("save", async function (next) {
    if (!this.isModefied("password")) {
        return next()
    }
    this.password = bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAcessToken = async function () {
    return jwt.sign({
        _id: this._id,
        userName: this.userName,
        email: this.email,
        fullName: this.fullName
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign({
        _id: this._id
    },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY
        }
    )
}

export const Users = Mongoose.model("Users", userSchema)
