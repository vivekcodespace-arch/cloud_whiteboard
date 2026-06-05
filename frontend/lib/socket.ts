import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    console.log('url is', process.env.NEXT_PUBLIC_SOCKET_URL ?? 'https://localhost:3001')
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3001', { transports: ['websocket']
})

    socket.on('connect_error', (err) => {
      console.log('connect error', err.message)
      if ((err as any).context?.status === 429) {
        alert("Too many requests. Try again in a minute.")
      }
    })

  }

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}