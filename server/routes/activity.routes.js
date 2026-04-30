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
import { validate } from "../middleware/validate.js";
import { activitySchemas } from "../validation/schemas.js";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get(
  "/workspaces/:workspaceId/activities",
  validate(activitySchemas.workspaceList),
  requireWorkspaceMember,
  getWorkspaceActivities,
);

router.get(
  "/projects/:projectId/activities",
  validate(activitySchemas.projectList),
  requireProjectMember,
  getProjectActivities,
);

export default router;
