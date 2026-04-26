import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'ioredis'
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

  // Redis pub/sub adapter — supports multiple server instances
  const pubClient = createClient({ url: process.env.REDIS_URL })
  const subClient = pubClient.duplicate()

  await Promise.all([pubClient.connect(), subClient.connect()])

  io.adapter(createAdapter(pubClient, subClient))

  // Auth middleware for Socket.IO
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

    // Join a project room to receive real-time updates
    socket.on('join:project', (projectId) => {
      socket.join(`project:${projectId}`)
      console.log(`User ${socket.userId} joined project:${projectId}`)
    })

    // Leave a project room
    socket.on('leave:project', (projectId) => {
      socket.leave(`project:${projectId}`)
      console.log(`User ${socket.userId} left project:${projectId}`)
    })

    registerKanbanHandlers(io, socket)

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`)
    })
  })

  return io
}