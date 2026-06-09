import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { generateAccount } from "../controllers/account.controller.js";

const router = Router();

// secured routes
router.route("/create-account").post(verifyJWT, generateAccount)


export default router;