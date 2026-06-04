import { use, useEffect } from 'react'
import { getSocket } from '@/lib/socket'
import { useRoomStore } from '@/store/useRoomStore'

type Point = { x: number; y: number }

type SyncPayload = {
  points: Point[]
  color: string
  width: number
}[]

type UseSocketOptions = {
  onStrokeReceived: (points: Point[], color: string) => void
  onSyncReceived:   (history: SyncPayload) => void
}

export function useSocket({ onStrokeReceived, onSyncReceived }: UseSocketOptions) {
  // read roomId from store instead of prop
  const roomId                = useRoomStore((s) => s.roomId)
  const setAmIHost            = useRoomStore((s) => s.setAmIHost)
  const setMyColor            = useRoomStore((s) => s.setMyColor)
  const setUsers              = useRoomStore((s) => s.setUsers)
  const incrementTotalStrokes = useRoomStore((s) => s.incrementTotalStrokes)
  const name                  = useRoomStore((s) => s.myName)

  useEffect(() => {
    if (!roomId) return

    const socket = getSocket()

    // tell server which room we want to join
    const userId = localStorage.getItem('userId') ?? (() => {
      const id = crypto.randomUUID()
      localStorage.setItem('userId', id)
      return id
    })()
    socket.emit('join-room', roomId, name, userId)

    // server responds with your role and assigned color
    socket.on('room-info', (data: { isHost: boolean; color: string }) => {
      setAmIHost(data.isHost)
      setMyColor(data.color)
    })

    // server sends updated list whenever someone joins or leaves
    socket.on('users-update', (users) => {
      setUsers(users)
    })

    // another user drew something — forward it to canvas
    socket.on('stroke', (data: { points: Point[]; color: string }) => {
      incrementTotalStrokes()
      onStrokeReceived(data.points, data.color)
    })

    // you just joined — server sends all past strokes so you see existing drawing
    socket.on('sync', (history: SyncPayload) => {
      onSyncReceived(history)
    })

    // cleanup listeners when roomId changes or component unmounts
    return () => {
      socket.off('room-info')
      socket.off('users-update')
      socket.off('stroke')
      socket.off('sync')
    }
  }, [roomId])

  // called when local user finishes a stroke
  function emitStroke(points: Point[]) {
    // getState() used here instead of the hook value
    // because this runs inside an event handler (stale closure risk)
    const { myColor, roomId } = useRoomStore.getState()
    const socket = getSocket()
    socket.emit('stroke', { roomId, points, color: myColor, width: 2 })
    incrementTotalStrokes()
  }

  return { emitStroke }
}