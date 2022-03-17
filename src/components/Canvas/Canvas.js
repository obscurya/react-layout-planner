import React, { useState } from 'react'
import useResizeObserver from '@react-hook/resize-observer'
import { Stage } from 'react-konva'
import Konva from 'konva'

import { CURSOR_TOOL } from '../LayoutPlanner/constants'
import { STAGE_INITIAL_SCALE, STAGE_SCALE_STEP } from './constants'

import { GridLayer, ShapesLayer } from './layers'

Konva.dragButtons = [2]
Konva.angleDeg = false

const Canvas = (props) => {
  const {
    container,
    tmpEdge,
    nodes,
    edges,
    polygons,
    cursor,
    setCursorCoords,
    beginGrabbing,
    endGrabbing,
    beginTmpEdge,
    endTmpEdge
  } = props

  const [stage, setStage] = useState(null)
  const [sizes, setSizes] = useState({
    width: 0,
    height: 0
  })
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [scale, setScale] = useState({
    x: STAGE_INITIAL_SCALE,
    y: STAGE_INITIAL_SCALE
  })
  const [gridCursorCoords, setGridCursorCoords] = useState({ x: 0, y: 0 })

  useResizeObserver(container, (entry) => {
    const { width, height } = entry.contentRect

    setSizes({ width, height })
  })

  const getStageCursorCoords = () => {
    if (!stage || !('pointerPos' in stage)) {
      return { x: 0, y: 0 }
    }

    return stage.getRelativePointerPosition()
  }

  const handleMouseMove = () => {
    // const { x, y } = getStageCursorCoords()
    const { x, y } = gridCursorCoords

    setCursorCoords(x, y)
  }

  const isLeftButton = (e) => {
    return e.evt.button === 0
  }

  const handleMouseDown = (e) => {
    if (isLeftButton(e)) {
      if (cursor.hoveredObject) {
        beginGrabbing()
        return
      }

      if (cursor.tool === CURSOR_TOOL.DRAW_WALL) {
        beginTmpEdge()
      }
    }
  }

  const handleMouseUp = (e) => {
    if (isLeftButton(e)) {
      if (cursor.grabbedObject) {
        endGrabbing()
        return
      }

      if (cursor.tool === CURSOR_TOOL.DRAW_WALL) {
        endTmpEdge()
      }
    }
  }

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragMove = () => {
    setCoords(stage.position())
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleWheel = (e) => {
    e.evt.preventDefault()

    if (isDragging) {
      return
    }

    const oldScale = scale.x
    const sign = e.evt.deltaY > 0 ? -1 : 1
    const newScale = oldScale * Math.exp(sign * STAGE_SCALE_STEP)

    setScale({ x: newScale, y: newScale })

    const { x, y } = stage.getPointerPosition()
    const cursorTo = {
      x: (x - coords.x) / oldScale,
      y: (y - coords.y) / oldScale
    }

    setCoords({
      x: x - cursorTo.x * newScale,
      y: y - cursorTo.y * newScale
    })
  }

  const handleContextMenu = (e) => {
    e.evt.preventDefault()
  }

  const getCursorStyle = () => {
    if (isDragging) {
      return 'move'
    }

    if (cursor.grabbedObject || cursor.hoveredObject) {
      return 'pointer'
    }

    return 'default'
  }

  return (
    <Stage
      ref={setStage}
      {...sizes}
      {...coords}
      scale={scale}
      draggable
      style={{ cursor: getCursorStyle() }}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={handleContextMenu}>
      <GridLayer
        sizes={sizes}
        coords={coords}
        scale={scale.x}
        stageCursorCoords={getStageCursorCoords()}
        gridCursorCoords={gridCursorCoords}
        setGridCursorCoords={setGridCursorCoords}
      />
      <ShapesLayer
        cursor={cursor}
        tmpEdge={tmpEdge}
        nodes={nodes}
        edges={edges}
        polygons={polygons}
      />
    </Stage>
  )
}

export default Canvas
