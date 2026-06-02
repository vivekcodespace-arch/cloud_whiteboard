'use client'

import { useRoomStore } from '@/store/useRoomStore'
import {useState} from "react";

export default function Panel() {
  const users   = useRoomStore((s) => s.users)
  const myColor = useRoomStore((s) => s.myColor)
  const roomId  = useRoomStore((s) => s.roomId)
  const name    = useRoomStore((s) => s.myName)
  const [copied, setCopied] = useState<boolean>(false)

  const onlineCount = users.length

  function copyLink() {
    if (!roomId) return
    
    navigator.clipboard.writeText(`${window.location.origin}/canvas/${roomId}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <aside
      className="
        absolute top-4 right-4 w-64
        overflow-hidden rounded-2xl
        border border-white/10
        bg-[#171717]/95 backdrop-blur-xl
        text-white shadow-2xl
      "
    >
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-medium">Room</h3>
        <div className="ml-auto flex items-center gap-2 text-xs text-zinc-400">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          {onlineCount} online
        </div>
      </div>

      {/* Users */}
      <div className="p-3 space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-2"
          >
            {/* Avatar */}
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
              style={{ backgroundColor: user.color }}
            >
              {user.name.slice(0, 1).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm">
                  {name === user.name ? `${user.name} (you)` : user.name}
                </span>

                {user.isHost && (
                  <span className="rounded-md bg-red-500/10 px-1.5 py-0.5 text-[10px] text-red-400">
                    host
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 p-3">
        <button
          onClick={copyLink}
          className={`
            w-full rounded-xl 
            py-2 text-xs 
            transition
            ${copied ? 'text-green-400 bg-green-500/20' : 'bg-zinc-500/10 hover:bg-zinc-500/20'}
          `}
        >
          {copied ? 'Link Copied!' : 'Copy Link'}
        </button>
      </div>
    </aside>
  )
}