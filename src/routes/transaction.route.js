import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { createTransaction } from "../controllers/transaction.controller.js";


const router = Router();

// secured routes
router.route("/create_transaction").post(verifyJWT, createTransaction)


export default router;