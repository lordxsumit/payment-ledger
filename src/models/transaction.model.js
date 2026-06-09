import mongoose from "mongoose";


const transactionSchema = new mongoose.Schema({
    fromAcc: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: true,
        index: true
    },
    toAcc: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
            message: "Status can either be PENDING, COMPLETED, FAILED or REVERSED"
        },
        default: "PENDING"
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    idempotencyKey: {
        type: String,
        required: true,
        index: true,
        unique: true
    }
}, {timestamps: true})


export const transaction = mongoose.model("transaction", transactionSchema)