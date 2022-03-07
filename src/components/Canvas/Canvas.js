import React, { useState, useEffect } from 'react'
import { Stage, Layer } from 'react-konva'
import Konva from 'konva'

import { CURSOR_TOOL } from '../LayoutPlanner/constants'
import { STAGE_SCALE_STEP } from './constants'

import { Grid, Cursor, Node, Edge, Polygon, TmpEdge } from './shapes'

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
    endTmpEdge,
    pixelsToMeters
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

  const isNodeHovered = (nodeIndex) => {
    if (cursor.grabbedObject) {
      return (
        cursor.grabbedObject.type === 'node' &&
        cursor.grabbedObject.index === nodeIndex
      )
    }

    if (cursor.hoveredObject) {
      return (
        cursor.hoveredObject.type === 'node' &&
        cursor.hoveredObject.index === nodeIndex
      )
    }

    return false
  }

  const renderTmpEdge = () => {
    if (!tmpEdge) {
      return null
    }

    const { nodes, length, angle, isAllowed } = tmpEdge

    if (nodes[0] === 'tmpNode') {
      return null
    }

    return (
      <TmpEdge
        nodes={nodes}
        length={length}
        angle={angle}
        isAllowed={isAllowed}
        pixelsToMeters={pixelsToMeters}
      />
    )
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
      <Grid sizes={sizes} coords={coords} scale={scale.x} />
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
        {cursor.tool === CURSOR_TOOL.MOVE &&
          nodes.map((node, nodeIndex) => {
            const isHovered = isNodeHovered(nodeIndex)

            return (
              <Node
                key={`node-${nodeIndex}`}
                index={nodeIndex}
                node={node}
                isHovered={isHovered}
              />
            )
          })}
        {cursor.tool === CURSOR_TOOL.DRAW_WALL && (
          <Cursor coords={cursor.coords} />
        )}
      </Layer>
    </Stage>
  )
}

export default Canvas
