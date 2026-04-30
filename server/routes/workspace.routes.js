import { Router } from "express";
import {
  createWorkspaceController,
  getMyWorkspaces,
  getWorkspace,
  updateWorkspaceController,
  deleteWorkspaceController,
  inviteMember,
  removeMember,
} from "../controllers/workspace.controller.js";
import { authenticate } from "../middleware/auth.js";
import {
  requireWorkspaceMember,
  requireWorkspaceAdmin,
} from "../middleware/workspace.js";
import { validate } from "../middleware/validate.js";
import { workspaceSchemas } from "../validation/schemas.js";

const router = Router();

router.use(authenticate);

router.post("/", validate(workspaceSchemas.create), createWorkspaceController);
router.get("/", getMyWorkspaces);
router.get(
  "/:workspaceId",
  validate(workspaceSchemas.workspaceId),
  requireWorkspaceMember,
  getWorkspace,
);
router.put(
  "/:workspaceId",
  validate(workspaceSchemas.update),
  requireWorkspaceAdmin,
  updateWorkspaceController,
);
router.delete(
  "/:workspaceId",
  validate(workspaceSchemas.workspaceId),
  requireWorkspaceAdmin,
  deleteWorkspaceController,
);
router.post(
  "/:workspaceId/invite",
  validate(workspaceSchemas.invite),
  requireWorkspaceAdmin,
  inviteMember,
);
router.delete(
  "/:workspaceId/members/:userId",
  validate(workspaceSchemas.removeMember),
  requireWorkspaceAdmin,
  removeMember,
);

export default router;
