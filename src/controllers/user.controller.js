import { asyncHandler } from "../utils/asynchandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
    // Get the credentials from frontend
    // data from FORMS
    const { username, fullname, email, password } = req.body;

    // Validate the user 
    if ([username, fullname, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All credentials are require")
    }

    // Check if the user already exist  -- username or email
    const existedUser =  User.findOne({
        $or: [{username},{email}]
    })
    if(existedUser){
       throw new ApiError(409, "User Already Exist email or username")
    }

    // Check for  avatar
    const localPathAvatar = req.files?.avatar[0]?.path

    // Check for images
    const localPathCoverimage = req.files?.coverimage[0]?.path

    if(!localPathAvatar){
       throw new ApiError(400 , "Avatar Image is required")
    }

    // Upload image to cloudinary  , avatar
    const avatarC = await uploadOnCloudinary(localPathAvatar);
    const coverimageC = await uploadOnCloudinary(localPathCoverimage);
    if(!avatarC){
        throw new ApiError(400,"Avatar is required")
    }

    // Create user object  - create user in DB
    const newUser = await User.create({
        fullname,
        avatar: avatarC.url,
        coverImage: coverimageC?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    // Remove password and refresh token field
    const createdUser = await User.findById(newUser._id).select(
        "-password -refreshToken"
    )

    // Check for user creation
    if(!createdUser){
        throw new ApiError(500, "Sever error while user registration")
    }
    // Return Response or Error
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User created and registered")
    )
})

export { registerUser }