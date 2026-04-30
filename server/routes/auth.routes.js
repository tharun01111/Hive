import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  me,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authRateLimiter } from "../middleware/rateLimit.js";
import { validate } from "../middleware/validate.js";
import { authSchemas } from "../validation/schemas.js";

const router = Router();

router.post(
  "/register",
  authRateLimiter,
  validate(authSchemas.register),
  register,
);
router.post("/login", authRateLimiter, validate(authSchemas.login), login);
router.post("/refresh", authRateLimiter, validate(authSchemas.refresh), refresh);
router.post("/logout", logout);
router.get("/me", authenticate, me);

export default router;
