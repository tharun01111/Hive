import { Router } from "express";
import {
  getProject,
  updateProjectController,
  deleteProjectController,
  inviteProjectMemberController,
} from "../controllers/project.controller.js";
import { authenticate } from "../middleware/auth.js";
import {
  requireProjectMember,
  requireProjectAdmin,
} from "../middleware/workspace.js";
import { validate } from "../middleware/validate.js";
import { projectSchemas } from "../validation/schemas.js";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get(
  "/:projectId",
  validate(projectSchemas.projectId),
  requireProjectMember,
  getProject,
);
router.put(
  "/:projectId",
  validate(projectSchemas.update),
  requireProjectAdmin,
  updateProjectController,
);
router.delete(
  "/:projectId",
  validate(projectSchemas.projectId),
  requireProjectAdmin,
  deleteProjectController,
);
router.post(
  "/:projectId/invite",
  validate(projectSchemas.invite),
  requireProjectAdmin,
  inviteProjectMemberController,
);

export default router;
