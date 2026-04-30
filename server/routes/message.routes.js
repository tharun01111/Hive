import { Router } from "express";
import {
  getMessages,
  createMessageController,
  deleteMessageController,
} from "../controllers/message.controller.js";
import { authenticate } from "../middleware/auth.js";
import { requireProjectMember } from "../middleware/workspace.js";
import { validate } from "../middleware/validate.js";
import { messageSchemas } from "../validation/schemas.js";

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(requireProjectMember);

router.get("/", validate(messageSchemas.list), getMessages);
router.post("/", validate(messageSchemas.create), createMessageController);
router.delete(
  "/:messageId",
  validate(messageSchemas.delete),
  deleteMessageController,
);

export default router;
