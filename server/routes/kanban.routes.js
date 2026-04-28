import { Router } from 'express'
import {
  getColumnsController,
  createColumnController,
  updateColumnController,
  deleteColumnController,
  reorderColumnsController,
} from '../controllers/column.controller.js'
import {
  createCardController,
  getCardController,
  updateCardController,
  deleteCardController,
  moveCardController,
  reorderCardsController,
  assignCardController,
  unassignCardController,
} from '../controllers/card.controller.js'
import { authenticate } from '../middleware/auth.js'
import { requireProjectMember } from '../middleware/workspace.js'

const router = Router({ mergeParams: true })

router.use(authenticate)
router.use(requireProjectMember)

router.post('/columns', createColumnController)
router.get('/columns', getColumnsController)
router.put('/columns/reorder', reorderColumnsController)
router.put('/columns/:columnId', updateColumnController)
router.delete('/columns/:columnId', deleteColumnController)

router.post('/columns/:columnId/cards', createCardController)
router.get('/cards/:cardId', getCardController)
router.put('/cards/reorder', reorderCardsController)
router.put('/cards/:cardId', updateCardController)
router.put('/cards/:cardId/move', moveCardController)
router.delete('/cards/:cardId', deleteCardController)
router.post('/cards/:cardId/assign', assignCardController)
router.delete('/cards/:cardId/assign/:userId', unassignCardController)

export default router