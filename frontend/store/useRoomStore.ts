import { create } from 'zustand'

// types
interface User {
  id: string
  isHost: boolean
  name: string
  strokeCount: number
  color: string
  joinedAt: number
}

interface RoomStore {
  // state
  roomId: string | null
  amIHost: boolean
  myColor: string
  myName: string
  users: User[]
  totalStrokes: number

  // actions
  setRoomId: (roomId: string) => void
  setAmIHost: (isHost: boolean) => void
  setMyColor: (color: string) => void
  setMyName: (name: string) => void
  setUsers: (users: User[]) => void
  incrementTotalStrokes: () => void
  reset: () => void
}

export const useRoomStore = create<RoomStore>((set) => ({
  // initial state
  roomId: null,
  amIHost: false,
  myColor: '#000000',
  myName: '',
  users: [],
  totalStrokes: 0,

  // actions
  setRoomId:            (roomId) => set({ roomId }),
  setAmIHost:           (isHost) => set({ amIHost: isHost }),
  setMyColor:           (color)  => set({ myColor: color }),
  setMyName:            (name)   => set({ myName: name }),
  setUsers:             (users)  => set({ users }),
  incrementTotalStrokes: ()      => set((state) => ({ totalStrokes: state.totalStrokes + 1 })),
  reset: () => set({
    roomId: null,
    amIHost: false,
    myColor: '#000000',
    myName: '',
    users: [],
    totalStrokes: 0,
  }),
}))