'use client'

import { useEffect, useRef } from 'react'

export default function Canvas() {

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const undoRef = useRef<() => void>(() => {})

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.strokeStyle = 'black'
    ctx.lineWidth   = 2
    ctx.lineCap     = 'round'

    let panX = 0
    let panY = 0
    let isPanning = false
    let panStartX = 0
    let panStartY = 0
    let scale = 1    

    let isDrawing = false
    let strokes: {x: number, y: number}[][] = []
    let currentStroke: {x: number, y: number}[] = []

    function drawSingleStroke(stroke: {x: number, y: number}[]) {
    if(!ctx || !canvas) return

      if (stroke.length < 2) return
      ctx.beginPath()
      ctx.moveTo(stroke[0].x, stroke[0].y)
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y)
      }
      ctx.stroke()
    }

    function redraw() {
    if(!ctx || !canvas) return
      // 1. clear canvas — no transform applied here
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 2. save clean state
      ctx.save()

      // 3. apply pan
      ctx.setTransform(scale, 0, 0, scale, panX, panY)

      // 4. draw all saved strokes
      for (const stroke of strokes) {
        drawSingleStroke(stroke)
      }

      // 5. draw current in-progress stroke
      if (currentStroke.length > 1) {
        drawSingleStroke(currentStroke)
      }

      // 6. restore clean state
      ctx.restore()
    }

    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 1) {
        isPanning = true
        panStartX = e.clientX
        panStartY = e.clientY
        return
      }

      if (e.button === 0) {
        isDrawing = true
        currentStroke = []
        const worldX = (e.clientX - panX) / scale
        const worldY = (e.clientY - panY) / scale
        currentStroke.push({ x: worldX, y: worldY })
      }
    })

    canvas.addEventListener('wheel', (e) => {
    e.preventDefault()

    const worldX = (e.clientX - panX) / scale
    const worldY = (e.clientY - panY) / scale

    // clamp deltaY to a max of 1 — stops trackpad from firing huge values
    const delta = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 1)

    const zoomFactor = 1 - delta * 0.1

    scale = scale * zoomFactor
    scale = Math.min(Math.max(scale, 0.1), 20)

    console.log("scale:", scale, "delta:", delta)

    panX = e.clientX - worldX * scale
    panY = e.clientY - worldY * scale

    redraw()
    }, { passive: false })

    canvas.addEventListener('mousemove', (e) => {
      if (isPanning) {
        const dx = e.clientX - panStartX
        const dy = e.clientY - panStartY
        panX += dx
        panY += dy
        panStartX = e.clientX
        panStartY = e.clientY
        redraw()
        return
      }

      if (!isDrawing) return

      const worldX = (e.clientX - panX) / scale
      const worldY = (e.clientY - panY) / scale

      currentStroke.push({ x: worldX, y: worldY })

      // one single redraw handles everything
      redraw()
    })

    canvas.addEventListener('mouseup', (e) => {
      if (e.button === 1) {
        isPanning = false
        return
      }

      if (e.button === 0) {
        isDrawing = false
        if (currentStroke.length > 1) {
          strokes.push([...currentStroke])
          console.log("stroke saved, total:", strokes.length)
        }
        currentStroke = []
      }
    })

    function undo() {
      if (strokes.length === 0) return
      strokes.pop()
      console.log("undo — remaining:", strokes.length)
      redraw()
    }

    undoRef.current = undo

    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault()
        undo()
      }
    })

  }, [])

  return (
    <div style={{ overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', cursor: 'crosshair' }} />

      <button
        onClick={() => undoRef.current()}
        style={{
          position: 'fixed',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '8px 24px',
          background: 'black',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          fontSize: 14,
        }}
      >
        Undo
      </button>
    </div>
  )
}