import {
  getProjectMessages,
  createMessage,
  deleteMessage,
} from '../services/message.service.js'
import { handle } from '../utils/controllerHandler.js'

export const getMessages = handle(async (req, res) => {
  const { cursor, limit } = req.query
  const result = await getProjectMessages(req.params.projectId, { cursor, limit })
  return res.status(200).json(result)
})

export const createMessageController = handle(async (req, res) => {
  const { content } = req.body
  if (!content?.trim()) {
    return res.status(400).json({ error: 'Message content is required' })
  }
  const message = await createMessage({
    content,
    projectId: req.params.projectId,
    userId: req.userId,
  })
  return res.status(201).json({ message })
})

export const deleteMessageController = handle(async (req, res) => {
  await deleteMessage(req.params.messageId, req.userId)
  return res.status(200).json({ message: 'Message deleted successfully' })
})