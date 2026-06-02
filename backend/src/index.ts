import express from 'express'
import { createServer } from 'http'
import Redis from 'ioredis'
import { abort } from 'process'
import { Server } from 'socket.io'

// create express app
const app = express()

function generateColor() {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, '0')}`
}

// create http server from express
const httpServer = createServer(app)

// create socket.io server on top of http server
const io = new Server(httpServer, {
  cors: {
    origin: "*",  // allow all origins for now
    methods: ["GET", "POST"]
  }
})

const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379')

redis.on('connect', () => {
  console.log('Redis connected')
})


const ROOM_TTL_SECONDS = 60 * 60 * 24 * 7
const PORT = 3001
const COLOR_POOL = [
  '#e74c3c', '#3498db', '#2ecc71', '#f39c12',
  '#9b59b6', '#1abc9c', '#e67e22', '#e91e63'
]
const rooms = new Map<string, { socketId: string, color: string, isHost: boolean, name: string, strokeCount: number, joinedAt: number }[]>()

// basic health check route
app.get('/', (req, res) => {
  res.send('Canvas WebSocket server is running')
})

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id)

  socket.on('join-room', async (roomId, name: string) => {
    socket.join(roomId)
    console.log(`${socket.id} joined ${roomId}`)

    if (!rooms.has(roomId)) {
      rooms.set(roomId, [])
    }

    const users = rooms.get(roomId)!
    const isHost  = users.length === 0
    const color  = generateColor()

    users.push({
      socketId:    socket.id,
      color,
      isHost,
      name,
      strokeCount: 0,
      joinedAt:    Date.now()
    });
    
    (socket as any).roomId = roomId
    socket.emit('room-info', { isHost, color })

    io.to(roomId).emit('users-update', users.map((u) => ({
      id:          u.socketId,
      color:       u.color,
      isHost:      u.isHost,
      name:        u.name,
      strokeCount: u.strokeCount,
      joinedAt:    u.joinedAt
    })))


    const raw = await redis.lrange(`room:${roomId}:strokes`, 0, -1) 

    if(raw.length > 0) {
      const history = raw.map((item) => JSON.parse(item))
      socket.emit('sync', history)
      console.log(`sent sync history to ${socket.id} for room ${roomId}, ${history.length} strokes`)
    }
  })

  socket.on('stroke', async (data) => {
    // increment stroke count for this user
    const users = rooms.get(data.roomId)
    if (users) {
      const user = users.find((u) => u.socketId === socket.id)
      if (user) user.strokeCount++
    }

    // save to Redis
    await redis.rpush(
      `room:${data.roomId}:strokes`,
      JSON.stringify({ points: data.points, color: data.color, width: data.width })
    )
    await redis.expire(`room:${data.roomId}:strokes`, ROOM_TTL_SECONDS)

    // broadcast to everyone else in the room
    socket.to(data.roomId).emit('stroke', data)
    console.log(`stroke broadcasted to room ${data.roomId}`)
  })

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id)

    const roomId = (socket as any).roomId
    if (!roomId) return

    const users = rooms.get(roomId)
    if (!users) return

    // remove this user from the room
    const index = users.findIndex((u) => u.socketId === socket.id)
    if (index !== -1) users.splice(index, 1)

    // if the host left, assign host to the next user
    if (users.length > 0 && !users.some((u) => u.isHost)) {
      users[0].isHost = true
    }

    // if room is empty clean it up from memory (Redis keeps the strokes)
    if (users.length === 0) {
      rooms.delete(roomId)
    } else {
      // tell remaining users the updated list
      io.to(roomId).emit('users-update', users.map((u) => ({
        id:          u.socketId,
        color:       u.color,
        isHost:      u.isHost,
        name:        u.name,  
        strokeCount: u.strokeCount,
        joinedAt:    u.joinedAt
      })))
    }
  })
})


// start server
httpServer.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})