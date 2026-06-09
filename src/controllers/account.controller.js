import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { account } from "../models/account.model.js";


const generateAccount = asyncHandler(async (req, res) => {
    const userId = req.newUser?._id || req.body.user;
    if(!userId){
        throw new ApiError(400, "User is required to create an account")
    }

    const Account = await account.create({
        user: userId
    })

    const createdAccount = await account.findById(Account._id)
    if(!createdAccount){
        throw new ApiError(500, "Something went wrong while creating the account")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, createdAccount, "Account created successfully")
    )
})

export {
    generateAccount
}