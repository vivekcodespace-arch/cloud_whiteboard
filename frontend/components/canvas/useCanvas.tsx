'use client'

import { use, useEffect, useRef, useState } from 'react'
import Panel from '../panel'
import { useRoomStore } from '@/store/useRoomStore'
import { useSocket } from '@/hooks/useSocket'

type Point = { x: number; y: number }

export default function Canvas({ roomId }: { roomId: string }) {

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const undoRef   = useRef<() => void>(() => {})
  const [copied, setCopied] = useState(false)

  const setRoomId = useRoomStore((s) => s.setRoomId)
  const setMyName  = useRoomStore((s) => s.setMyName)

  // these refs are a bridge between the socket hook and the canvas useEffect
  // the socket hook calls these when events arrive
  // the canvas useEffect wires them up to the actual strokes array and redraw
  // we use refs because the canvas useEffect closure cant see hook state directly
  const onStrokeReceivedRef = useRef<(points: Point[], color: string) => void>(() => {})
  const onSyncReceivedRef   = useRef<(history: { points: Point[], color: string, width: number }[]) => void>(() => {})

  useEffect(() => {
    if(!localStorage.getItem('name')) {
      alert('Please set your name in the homepage before joining a room.')
      window.location.href = '/'
    }
  }, [])

  // put roomId into zustand so useSocket can read it
  useEffect(() => {
    setRoomId(roomId)
    setMyName(localStorage.getItem('name') || `User${Math.floor(Math.random() * 1000)}`)
  }, [roomId])

  // useSocket reads roomId from zustand itself — no need to pass it as prop
  const { emitStroke } = useSocket({
    onStrokeReceived: (points, color) => onStrokeReceivedRef.current(points, color),
    onSyncReceived:   (history)       => onSyncReceivedRef.current(history),
  })

  function copyLink() {
    const url = `${window.location.origin}/room/${roomId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.lineWidth = 2
    ctx.lineCap   = 'round'

    let panX = 0, panY = 0
    let isPanning = false, panStartX = 0, panStartY = 0
    let scale = 1

    let isDrawing     = false
    // strokes now store color too so each user's color is preserved
    let strokes:       { points: Point[], color: string }[] = []
    let currentStroke: Point[] = []

    // color is now a parameter so each stroke draws in the right color
    function drawSingleStroke(stroke: Point[], color: string) {
      if (!ctx || !canvas) return
      if (stroke.length < 2) return
      ctx.strokeStyle = color
      ctx.beginPath()
      ctx.moveTo(stroke[0].x, stroke[0].y)
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y)
      }
      ctx.stroke()
    }

    function redraw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.setTransform(scale, 0, 0, scale, panX, panY)
      for (const s of strokes) {
        drawSingleStroke(s.points, s.color)
      }
      // for the stroke currently being drawn, get live color from store
      if (currentStroke.length > 1) {
        const { myColor } = useRoomStore.getState()
        drawSingleStroke(currentStroke, myColor)
      }
      ctx.restore()
    }

    // wire the refs — now the socket hook can trigger canvas updates
    onStrokeReceivedRef.current = (points, color) => {
      strokes.push({ points, color })
      redraw()
    }

    // sync = history of all past strokes when you first join the room
    onSyncReceivedRef.current = (history) => {
      strokes.push(...history.map((s) => ({ points: s.points, color: s.color })))
      redraw()
    }

    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 1) {
        isPanning = true
        panStartX = e.clientX
        panStartY = e.clientY
        return
      }
      if (e.button === 0) {
        isDrawing     = true
        currentStroke = []
        const worldX  = (e.clientX - panX) / scale
        const worldY  = (e.clientY - panY) / scale
        currentStroke.push({ x: worldX, y: worldY })
      }
    })

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault()
      const worldX     = (e.clientX - panX) / scale
      const worldY     = (e.clientY - panY) / scale
      const delta      = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 1)
      const zoomFactor = 1 - delta * 0.1
      scale = Math.min(Math.max(scale * zoomFactor, 0.1), 20)
      panX  = e.clientX - worldX * scale
      panY  = e.clientY - worldY * scale
      redraw()
    }, { passive: false })

    canvas.addEventListener('mousemove', (e) => {
      if (isPanning) {
        panX      += e.clientX - panStartX
        panY      += e.clientY - panStartY
        panStartX  = e.clientX
        panStartY  = e.clientY
        redraw()
        return
      }
      if (!isDrawing) return
      const worldX = (e.clientX - panX) / scale
      const worldY = (e.clientY - panY) / scale
      currentStroke.push({ x: worldX, y: worldY })
      redraw()
    })

    canvas.addEventListener('mouseup', (e) => {
      if (e.button === 1) { isPanning = false; return }
      if (e.button === 0) {
        isDrawing = false
        if (currentStroke.length > 1) {
          // get live color at the moment stroke finishes
          const { myColor } = useRoomStore.getState()
          strokes.push({ points: [...currentStroke], color: myColor })
          console.log('stroke saved, total:', strokes.length)
          emitStroke([...currentStroke])
        }
        currentStroke = []
      }
    })

    function undo() {
      if (strokes.length === 0) return
      strokes.pop()
      console.log('undo — remaining:', strokes.length)
      redraw()
    }

    undoRef.current = undo

    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault()
        undo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, []) // empty array — canvas only sets up once, roomId changes handled separately

  return (
    <div style={{ overflow: 'hidden' }} className='relative'>
      <canvas ref={canvasRef} style={{ display: 'block', cursor: 'crosshair' }} />

      <button
        onClick={() => undoRef.current()}
        style={{
          position:     'fixed',
          bottom:       32,
          left:         '50%',
          transform:    'translateX(-50%)',
          padding:      '8px 24px',
          background:   'black',
          color:        'white',
          border:       'none',
          borderRadius: 8,
          cursor:       'pointer',
          fontSize:     14,
        }}
      >
        Undo
      </button>

      <Panel />
    </div>
  )
}