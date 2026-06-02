'use client'

import { useRouter } from 'next/navigation'
import { use, useEffect, useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [roomId, setRoomId] = useState('')
  const [name, setName] = useState('')

  useEffect(() => {
    const savedName = localStorage.getItem('name')
    if (savedName) setName(savedName)
  }, [])

  const createRoom = () => {
    console.log(localStorage.getItem('name'))
    if(localStorage.getItem('name') === null) {
      alert('Please set your name before creating a room.')
      return
    }
    const id = crypto.randomUUID()
    router.push(`/canvas/${id}`)
  }

  const joinRoom = () => {
    if(localStorage.getItem('name') === null) {
      alert('Please set your name before joining a room.')
      return
    }
    if (!roomId.trim()) return
    router.push(`/canvas/${roomId}`)
  }

  const setname = () => {
    if (!name.trim()) return
    localStorage.setItem('name', name.trim())
    alert('Name saved! You can now create or join a room.') 
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-lg mb-6">
        
        {/* Logo / Heading */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-semibold tracking-tight text-black">
            Inkwell
          </h1>
          <p className=" text-gray-500 text-sm italic">
            share your strokes
          </p>

          <p className="mt-4 text-gray-500 text-lg">
            Create a room or join an existing collaborative canvas.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-neutral-500 rounded-3xl  p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">

          <div className="space-y-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter ur Name"
              className="
                w-full
                h-12
                px-5
                rounded-xl
                border
                border-neutral-500
                outline-none
                text-black
                placeholder:text-neutral-500
                focus:border-black
                transition-all
              "
            />

            <button
              onClick={setname}
              className="
                w-full
                h-12
                rounded-xl
                border
                border-neutral-400
                bg-white
                text-black
                font-medium
                transition-all
                hover:bg-neutral-50
              "
            >
              Set Name
            </button>
          </div>

          <div className="flex items-center gap-4 my-8">
            <div className="h-px bg-neutral-500 flex-1" />
            <span className="text-sm text-neutral-400">AND</span>
            <div className="h-px bg-neutral-500 flex-1" />
          </div>
          
          <button
            onClick={createRoom}
            className="
              w-full
              h-12
              mt-4
              rounded-xl
              bg-black
              text-white
              font-medium
              transition-all
              hover:scale-[1.01]
              active:scale-[0.99]
            "
          >
            Create New Room
          </button>

          <div className="flex items-center gap-4 my-8">
            <div className="h-px bg-neutral-500 flex-1" />
            <span className="text-sm text-neutral-400">OR</span>
            <div className="h-px bg-neutral-500 flex-1" />
          </div>

          <div className="space-y-4">
            <input
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter room ID"
              className="
                w-full
                h-12
                px-5
                rounded-xl
                border
                border-neutral-500
                outline-none
                text-black
                placeholder:text-neutral-500
                focus:border-black
                transition-all
              "
            />

            <button
              onClick={joinRoom}
              className="
                w-full
                h-12
                rounded-xl
                border
                border-neutral-400
                bg-white
                text-black
                font-medium
                transition-all
                hover:bg-neutral-50
              "
            >
              Join Room
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-neutral-400 mt-6">
          Share your room ID with others to collaborate in real time.
        </p>

      </div>
    </main>
  )
}