import React, { useState, useEffect } from 'react'
import { Stage, Layer } from 'react-konva'
import Konva from 'konva'

import { CURSOR_TOOL } from '../LayoutPlanner/constants'
import { STAGE_SCALE_STEP } from './constants'

import Cursor from './shapes/Cursor'
import Node from './shapes/Node'
import Edge from './shapes/Edge'
import Polygon from './shapes/Polygon'
import TmpEdge from './shapes/TmpEdge'

Konva.dragButtons = [2]

const Canvas = (props) => {
  const {
    container,
    tmpEdge,
    nodes,
    edges,
    polygons,
    setCursorCoords,
    getCursorCoords,
    beginTmpEdge,
    endTmpEdge,
    isCursorBound,
    cursorTool
  } = props

  const [stage, setStage] = useState(null)
  const [sizes, setSizes] = useState({
    width: container.clientWidth,
    height: container.clientHeight
  })
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [scale, setScale] = useState({ x: 1, y: 1 })

  const resizeCanvas = () => {
    setSizes({
      width: container.clientWidth,
      height: container.clientHeight
    })
  }

  const resizeCanvasEffect = () => {
    window.onresize = resizeCanvas

    return () => {
      window.onresize = null
    }
  }

  useEffect(resizeCanvasEffect, [])

  const handleMouseMove = () => {
    const { x, y } = stage.getRelativePointerPosition()

    setCursorCoords(x, y)
  }

  const isLeftButton = (e) => {
    return e.evt.button === 0
  }

  const handleMouseDown = (e) => {
    if (isLeftButton(e)) {
      beginTmpEdge()
    }
  }

  const handleMouseUp = (e) => {
    if (isLeftButton(e)) {
      endTmpEdge()
    }
  }

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragMove = () => {
    setCoords({ x: stage.x(), y: stage.y() })
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

  const renderTmpEdge = () => {
    if (!tmpEdge) {
      return null
    }

    const { nodes, isAllowed } = tmpEdge

    if (nodes[0] === 'tmpNode') {
      return null
    }

    return <TmpEdge nodes={nodes} isAllowed={isAllowed} />
  }

  return (
    <Stage
      ref={setStage}
      {...sizes}
      {...coords}
      scale={scale}
      draggable
      style={{ cursor: isDragging ? 'move' : 'default' }}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={(e) => {
        e.evt.preventDefault()
      }}>
      <Layer>
        {polygons.map((polygonNodes, polygonIndex) => {
          return (
            <Polygon
              key={`polygon-${polygonIndex}`}
              index={polygonIndex}
              nodes={polygonNodes}
            />
          )
        })}
        {edges.map(({ nodes, length, angle, shape }, edgeIndex) => {
          return (
            <Edge
              key={`edge-${edgeIndex}`}
              index={edgeIndex}
              nodes={nodes}
              length={length}
              angle={angle}
              shape={shape}
            />
          )
        })}
        {renderTmpEdge()}
        {cursorTool === CURSOR_TOOL.MOVE &&
          nodes.map((node, nodeIndex) => {
            return (
              <Node key={`node-${nodeIndex}`} index={nodeIndex} node={node} />
            )
          })}
        {cursorTool === CURSOR_TOOL.DRAW_WALL && isCursorBound && (
          <Cursor coords={getCursorCoords()} />
        )}
      </Layer>
    </Stage>
  )
}

export default Canvas
