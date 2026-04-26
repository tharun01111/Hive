import { Router } from "express";
import {
  getWorkspaceActivities,
  getProjectActivities,
} from "../controllers/activity.controller.js";
import { authenticate } from "../middleware/auth.js";
import {
  requireWorkspaceMember,
  requireProjectMember,
} from "../middleware/workspace.js";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get(
  "/workspaces/:workspaceId/activities",
  requireWorkspaceMember,
  getWorkspaceActivities,
);

router.get(
  "/projects/:projectId/activities",
  requireProjectMember,
  getProjectActivities,
);

export default router;
