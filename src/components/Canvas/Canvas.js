import React, { useMemo, useState } from 'react'
import useResizeObserver from '@react-hook/resize-observer'
import { Stage, Layer } from 'react-konva'
import Konva from 'konva'

import { CURSOR_TOOL } from '../LayoutPlanner/constants'
import { STAGE_INITIAL_SCALE, STAGE_SCALE_STEP } from './constants'

import {
  Grid,
  Cursor,
  Node,
  WallsGradient,
  Polygon,
  TmpEdge,
  EdgeBorders,
  EdgeMeasurement
} from './shapes'

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
    pixelsToMeters,
    pixelsToSquareMeters
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

  const bindCursorToGrid = (callback) => {
    const position =
      stage && 'pointerPos' in stage
        ? stage.getRelativePointerPosition()
        : { x: 0, y: 0 }
    const coords = callback(position)

    if (coords.x === gridCursorCoords.x && coords.y === gridCursorCoords.y) {
      return
    }

    setGridCursorCoords(coords)
  }

  const handleMouseMove = () => {
    // const { x, y } = stage.getRelativePointerPosition()
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

  const _polygons = useMemo(() => {
    return polygons.map(({ nodes, center, area, color }, polygonIndex) => {
      return (
        <Polygon
          key={`polygon-${polygonIndex}`}
          index={polygonIndex}
          nodes={nodes}
          center={center}
          area={area}
          color={color}
          pixelsToSquareMeters={pixelsToSquareMeters}
        />
      )
    })
  }, [polygons])

  const _nodes = useMemo(() => {
    if (cursor.tool !== CURSOR_TOOL.MOVE) {
      return null
    }

    return nodes.map((node, nodeIndex) => {
      const isHovered = isNodeHovered(nodeIndex)

      return (
        <Node
          key={`node-${nodeIndex}`}
          index={nodeIndex}
          node={node}
          isHovered={isHovered}
        />
      )
    })
  }, [cursor.tool, nodes, isNodeHovered])

  const _edgesMeasurement = useMemo(() => {
    return edges.map(({ borders }, edgeIndex) => {
      return (
        <EdgeMeasurement
          key={`edge-measurement-${edgeIndex}`}
          borders={borders}
          pixelsToMeters={pixelsToMeters}
        />
      )
    })
  }, [edges])

  const _edgesBorders = useMemo(() => {
    return edges.map(({ borders }, edgeIndex) => {
      return <EdgeBorders key={`edge-borders-${edgeIndex}`} borders={borders} />
    })
  }, [edges])

  const _tmpEdge = useMemo(() => {
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
  }, [tmpEdge])

  const _cursor = useMemo(() => {
    if (cursor.tool !== CURSOR_TOOL.DRAW_WALL) {
      return null
    }

    return <Cursor coords={cursor.coords} />
  }, [cursor])

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
      <Grid
        sizes={sizes}
        coords={coords}
        scale={scale.x}
        bindCursorToGrid={bindCursorToGrid}
      />
      <Layer listening={false}>
        {_polygons}
        <WallsGradient edges={edges} scale={scale.x} />
        {_nodes}
        {_edgesMeasurement}
        {_edgesBorders}
        {_tmpEdge}
        {_cursor}
      </Layer>
    </Stage>
  )
}

export default Canvas
