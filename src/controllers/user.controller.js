import { asyncHandler } from '../utils/asyncHandler.js';
import { user } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';


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
})

// const loginUser = asyncHandler(async (req, res) => {
    
// })

export {
    registerUser,
    // loginUser
}