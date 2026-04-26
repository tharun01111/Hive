import { Router } from 'express'
import {
  getMessages,
  createMessage,
  deleteMessage,
} from '../controllers/message.controller.js'
import { authenticate } from '../middleware/auth.js'
import { requireProjectMember } from '../middleware/workspace.js'

const router = Router({ mergeParams: true })

router.use(authenticate)
router.use(requireProjectMember)

router.get('/', getMessages)
router.post('/', createMessage)
router.delete('/:messageId', deleteMessage)

export default router