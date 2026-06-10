import express from "express";
import cookieParser from "cookie-parser";

const app = express()

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// Routes import
import userRouter from './routes/user.route.js'
import accountRouter from './routes/account.route.js'
import transactionRouter from './routes/transaction.route.js'

// routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/accounts", accountRouter)
app.use("/api/v1/transactions", transactionRouter)

export {app}