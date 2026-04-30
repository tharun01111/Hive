import { Router } from "express";
import {
  getColumnsController,
  createColumnController,
  updateColumnController,
  deleteColumnController,
  reorderColumnsController,
} from "../controllers/column.controller.js";
import {
  createCardController,
  getCardController,
  updateCardController,
  deleteCardController,
  moveCardController,
  reorderCardsController,
  assignCardController,
  unassignCardController,
} from "../controllers/card.controller.js";
import { authenticate } from "../middleware/auth.js";
import { requireProjectMember } from "../middleware/workspace.js";
import { validate } from "../middleware/validate.js";
import { kanbanSchemas } from "../validation/schemas.js";

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(requireProjectMember);

router.post(
  "/columns",
  validate(kanbanSchemas.createColumn),
  createColumnController,
);
router.get("/columns", validate(kanbanSchemas.projectId), getColumnsController);
router.put(
  "/columns/reorder",
  validate(kanbanSchemas.reorderColumns),
  reorderColumnsController,
);
router.put(
  "/columns/:columnId",
  validate(kanbanSchemas.updateColumn),
  updateColumnController,
);
router.delete(
  "/columns/:columnId",
  validate(kanbanSchemas.columnId),
  deleteColumnController,
);

router.post(
  "/columns/:columnId/cards",
  validate(kanbanSchemas.createCard),
  createCardController,
);
router.get("/cards/:cardId", validate(kanbanSchemas.cardId), getCardController);
router.put(
  "/cards/reorder",
  validate(kanbanSchemas.reorderCards),
  reorderCardsController,
);
router.put(
  "/cards/:cardId",
  validate(kanbanSchemas.updateCard),
  updateCardController,
);
router.put(
  "/cards/:cardId/move",
  validate(kanbanSchemas.moveCard),
  moveCardController,
);
router.delete(
  "/cards/:cardId",
  validate(kanbanSchemas.cardId),
  deleteCardController,
);
router.post(
  "/cards/:cardId/assign",
  validate(kanbanSchemas.assignCard),
  assignCardController,
);
router.delete(
  "/cards/:cardId/assign/:userId",
  validate(kanbanSchemas.unassignCard),
  unassignCardController,
);

export default router;
