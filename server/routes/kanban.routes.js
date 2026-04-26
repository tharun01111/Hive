import { Router } from 'express'
import {
  createColumn,
  getColumns,
  updateColumn,
  deleteColumn,
  reorderColumns,
} from '../controllers/column.controller.js'
import {
  createCard,
  getCard,
  updateCard,
  deleteCard,
  moveCard,
  reorderCards,
  assignCard,
  unassignCard,
} from '../controllers/card.controller.js'
import { authenticate } from '../middleware/auth.js'
import { requireProjectMember } from '../middleware/workspace.js'

const router = Router({ mergeParams: true })

router.use(authenticate)
router.use(requireProjectMember)

// Column routes
router.post('/columns', createColumn)
router.get('/columns', getColumns)
router.put('/columns/reorder', reorderColumns)
router.put('/columns/:columnId', updateColumn)
router.delete('/columns/:columnId', deleteColumn)

// Card routes
router.post('/columns/:columnId/cards', createCard)
router.get('/cards/:cardId', getCard)
router.put('/cards/reorder', reorderCards)
router.put('/cards/:cardId', updateCard)
router.put('/cards/:cardId/move', moveCard)
router.delete('/cards/:cardId', deleteCard)
router.post('/cards/:cardId/assign', assignCard)
router.delete('/cards/:cardId/assign/:userId', unassignCard)

export default router