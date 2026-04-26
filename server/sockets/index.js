import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import Redis from 'ioredis'
import { verifyAccessToken } from '../utils/tokens.js'
import { registerKanbanHandlers } from './kanban.handlers.js'

export const initSocket = async (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
    path: '/socket.io',
  })

  const pubClient = new Redis(process.env.REDIS_URL)
  const subClient = pubClient.duplicate()

  io.adapter(createAdapter(pubClient, subClient))

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token

    if (!token) {
      return next(new Error('Authentication required'))
    }

    try {
      const payload = verifyAccessToken(token)
      socket.userId = payload.userId
      next()
    } catch (err) {
      return next(new Error('Invalid or expired token'))
    }
  })

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (user: ${socket.userId})`)

    // Project room for kanban real-time
    socket.on('join:project', (projectId) => {
      socket.join(`project:${projectId}`)
      console.log(`User ${socket.userId} joined project:${projectId}`)
    })

    socket.on('leave:project', (projectId) => {
      socket.leave(`project:${projectId}`)
    })

    // Workspace room for activity feed real-time
    socket.on('join:workspace', (workspaceId) => {
      socket.join(`workspace:${workspaceId}`)
      console.log(`User ${socket.userId} joined workspace:${workspaceId}`)
    })

    socket.on('leave:workspace', (workspaceId) => {
      socket.leave(`workspace:${workspaceId}`)
    })

    registerKanbanHandlers(io, socket)

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`)
    })
  })

  return io
}