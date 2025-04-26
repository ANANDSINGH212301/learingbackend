import { asyncHandler } from "../utils/asynchandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh token or access token");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // Get the credentials from frontend
    // data from FORMS
    const { username, fullname, email, password } = req.body;

    // Validate the user 
    if ([username, fullname, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All credentials are require")
    }

    // Check if the user already exist  -- username or email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User Already Exist email or username")
    }

    // Check for  avatar
    const localPathAvatar = req.files?.avatar[0]?.path

    // Check for images
    let localPathCoverimage;
    if (req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length > 0) {
        localPathCoverimage = req.files?.coverimage[0]?.path
    }
    if (!localPathAvatar) {
        throw new ApiError(400, "Avatar Image is required")
    }

    // Upload image to cloudinary  , avatar
    const avatarC = await uploadOnCloudinary(localPathAvatar);
    const coverimageC = await uploadOnCloudinary(localPathCoverimage);
    if (!avatarC) {
        throw new ApiError(400, "Avatar is required")
    }

    // Create user object  - create user in DB
    const newUser = await User.create({
        fullName: fullname,
        avatar: avatarC.url,
        coverImage: coverimageC?.url || "",
        email,
        password,
        userName: username
    })
    // Remove password and refresh token field
    const createdUser = await User.findById(newUser._id).select(
        "-password -refreshToken"
    )

    // Check for user creation
    if (!createdUser) {
        throw new ApiError(500, "Sever error while user registration")
    }
    // Return Response or Error
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    // req body => body
    const { email, username, password } = req.body;
    // username and email
    if (!email && !username) {
        throw new ApiError(400, "Email or username is reuired")
    }
    // find the user
    const user = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (!user) {
        throw new ApiError(404, "No , username or email found !")
    }
    // password check
    const passCorrect = await user.isPasswordCorrect(password)
    if (!passCorrect) {
        throw new ApiError(404, "Invalid Password !")
    }
    // access and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    // send cookies
    const loginUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: accessToken, loginUser, refreshToken }, "User loggedin Sucessfully!"))
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .json(new ApiResponse(200, {}, "user logOut sucessfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookie?.refreshToken || req.body
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request")
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken.refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "Invalid refreshToken")
        }
        if (incomingRefreshToken.refreshToken !== user?.refreshToken) {
            throw new ApiError(401, " refreshToken is expired or used")
        }
        const options = {
            httpOnly: true,
            secure: true
        }
        console.log(user)
        const { accessToken, newrefreshToken } = await generateAccessAndRefreshToken(user._id)
        user.refreshToken = newrefreshToken
        const instance = await user.save();
        console.log(instance)
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newrefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newrefreshToken },
                    "Access Token Refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(500, error?.message || "Invalid req token")
    }
})
export { registerUser, loginUser, logoutUser, refreshAccessToken }