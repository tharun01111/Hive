import { Router } from "express";
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  inviteProjectMember,
} from "../controllers/project.controller.js";
import { authenticate } from "../middleware/auth.js";
import {
  requireWorkspaceMember,
  requireProjectMember,
  requireProjectAdmin,
} from "../middleware/workspace.js";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post("/", requireWorkspaceMember, createProject);
router.get("/", requireWorkspaceMember, getProjects);
router.get("/direct/:projectId", authenticate, async (req, res) => {
  const { projectId } = req.params;
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
        },
      },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });
    return res.status(200).json({ project });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/:projectId", requireProjectMember, getProject);
router.put("/:projectId", requireProjectAdmin, updateProject);
router.delete("/:projectId", requireProjectAdmin, deleteProject);
router.post("/:projectId/invite", requireProjectAdmin, inviteProjectMember);

export default router;
