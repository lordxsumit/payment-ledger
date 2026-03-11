import { asyncHandler } from '../utils/asyncHandler.js';
import { user } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';


/**
 * - user register controller
 * - POST /api/v1/users/register
 */
const registerUser = asyncHandler(async (req, res) => {
    // get user detail from the frontend
    const {name, email, password} = req.body;

    // validation - not empty
    if(
        [name, email, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    // check if user already exists: username, email
    const existedUser = await user.findOne({
        $or: [{name}, {email}]
    })
    if(existedUser){
        throw new ApiError(409, "An user already exists with this name and email")
    }

    // create user object - create entry in db
    const User = await user.create({
        name,
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

// const loginUser = asyncHandler(async (req, res) => {
    
// })

export {
    registerUser,
    // loginUser
}