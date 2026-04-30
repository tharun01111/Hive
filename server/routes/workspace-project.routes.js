import { Router } from "express";
import {
  createProjectController,
  getProjects,
} from "../controllers/project.controller.js";
import { authenticate } from "../middleware/auth.js";
import { requireWorkspaceMember } from "../middleware/workspace.js";
import { validate } from "../middleware/validate.js";
import { projectSchemas } from "../validation/schemas.js";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post(
  "/",
  validate(projectSchemas.create),
  requireWorkspaceMember,
  createProjectController,
);

router.get(
  "/",
  validate(projectSchemas.workspaceProjectList),
  requireWorkspaceMember,
  getProjects,
);

export default router;
