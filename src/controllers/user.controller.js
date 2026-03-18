import { asyncHandler } from '../utils/asyncHandler.js';
import { user } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';


const generateAccessAndRefreshToken = async (userID) => {
    try {
        const newUser = await user.findById(userID)
        const accessToken = newUser.generateAccessToken()
        const refreshToken = newUser.generateRefreshToken()

        console.log("accessToken : ", accessToken);
        console.log("refreshToken : ", refreshToken);

        newUser.refreshToken = refreshToken
        await newUser.save({validateBeforeSave: false})

        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

/**
 * - user register controller
 * - POST /api/v1/users/register
 */
const registerUser = asyncHandler(async (req, res) => {
    // get user detail from the frontend
    const {userName, fullName, email, password} = req.body;

    // validation - not empty
    if(
        [userName, fullName, email, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    // check if user already exists: username, email
    const existedUser = await user.findOne({
        $or: [{userName}, {email}]
    })
    if(existedUser){
        throw new ApiError(409, "An user already exists with this name and email")
    }

    // create user object - create entry in db
    const User = await user.create({
        userName,
        fullName,
        email,
        password
    })

    // remove password field from the response
    const createdUser = await user.findById(User._id).select("-password")
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    // check for user creation return res
    return res
    .status(200)
    .json(
        new ApiResponse(200, createdUser, "User registered successfully!")
    )
})


const loginUser = asyncHandler(async (req, res) => {
    const {userName, email, password} = req.body

    if(!userName && !email){
        throw new ApiError(400, "name or email is required!")
    }

    const User = await user.findOne({
        $or: [{userName}, {email}]
    }).select("+password")
    if(!User){
        throw new ApiError(404, "User not found or doesn't exists!")
    }

    const isPasswordValid = await User.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401, "User credentials not correct!")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(User._id)

    const loggedInUser = await user.findById(User._id).select("-refreshToken -password")

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        )
    )
})


const logoutUser = asyncHandler(async (req, res) => {
    await user.findByIdAndUpdate(
        req.newUser._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "User logged out successfully!")
    )
})

export {
    registerUser,
    loginUser,
    logoutUser
}