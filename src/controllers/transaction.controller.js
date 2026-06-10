import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { account } from "../models/account.model.js";
import { transaction } from "../models/transaction.model.js"
import { ledger } from "../models/ledger.model.js";
import mongoose from "mongoose";


/**
 * - Create a new transaction
 * The 10-step trasfer flow:
    * 1. validate request
    * 2. validate idempotency key
    * 3. check account status
    * 4. derive sender balance from ledger
    * 5. create transaction (pending)
    * 6. create DEBIT ledger entry 
    * 7. create CREDIT ledger entry 
    * 8. mark transaction COMPLETED
    * 9. commit MONGODB session
    * 10. Send email notification
 */

const createTransaction = asyncHandler(async (req, res) => {
    const { fromAcc, toAcc, amount, idempotencyKey} = req.body;
    if(
        [fromAcc, toAcc, amount, idempotencyKey].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existingAccounts = await account.findOne({
        $or: [{fromAcc}, {toAcc}]
    })
    if(!existingAccounts){
        throw new ApiError(400, "Account's were not found")
    }


    const transactionAlreadyExists = await transaction.findOne({
        idempotencyKey: idempotencyKey
    })
    if(transactionAlreadyExists){
        if(transactionAlreadyExists.status == "COMPLETED"){
            return res
            .status(200)
            .json(
                new ApiResponse(200, transactionAlreadyExists, "Trasaction has been completed")
            )
        }
        if(transactionAlreadyExists.status == "PENDING"){
            return res
            .status(200)
            .json(
                new ApiResponse(200, "", "Transaction is pending")
            )
        }
        if(transactionAlreadyExists.status == "FAILED"){
            return res
            .status(500)
            .json(
                new ApiResponse(500, "", "Transaction has failed, retry")
            )
        }
        if (status === "REVERSED") {
            return res.status(500).json(new ApiResponse(500, "", "Transaction has been reversed"))
        }
    }

    // Load accounts from DB
    const fromAccount = await account.findById(fromAcc)
    const toAccount = await account.findById(toAcc)
    if (!fromAccount || !toAccount) {
        throw new ApiError(400, "One or both accounts were not found")
    }
    if (fromAccount.status !== "ACTIVE" || toAccount.status !== "ACTIVE") {
        throw new ApiError(400, "Both fromAccount and toAccount must be active to process the transaction")
    }


    const balance = await fromAccount.getBalance();
    if(amount > balance){
        throw new ApiError(400, `Insufficient balance. Current balance is ${balance} and requested amount is ${amount}`)
    }


    const session = await mongoose.startSession()
    try{
        session.startTransaction()

        const Transaction = await transaction.create({
            fromAcc: fromAccount._id,
            toAcc: toAccount._id,
            amount,
            idempotencyKey,
            status: "PENDING"
        }, { session })

        const debitLedgerEntry = await ledger.create({
            account: fromAccount._id,
            amount: amount,
            transaction: Transaction._id,
            type: "DEBIT"
        }, { session })

        const creditLedgerEntry = await ledger.create({
            account: toAccount._id,
            amount: amount,
            transaction: Transaction._id,
            type: "CREDIT"
        }, { session })

        Transaction.status = "COMPLETED"
        await Transaction.save({session})

        await session.commitTransaction()
        session.endSession()

        return res
        .status(201)
        .json(
            new ApiResponse(201, Transaction, "Transaction completed")
        )
    } catch (err) {
        await session.abortTransaction().catch(() => {})
        session.endSession()
        throw err
    }
})



export {
    createTransaction
}