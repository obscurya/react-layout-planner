import React, { useState, useEffect } from 'react'
import { Stage, Layer } from 'react-konva'

import Cursor from './shapes/Cursor'
import Node from './shapes/Node'
import Edge from './shapes/Edge'
import Polygon from './shapes/Polygon'
import TmpEdge from './shapes/TmpEdge'

const Canvas = (props) => {
  const {
    tmpEdge,
    nodes,
    edges,
    polygons,
    setCursorCoords,
    getCursorCoords,
    beginTmpEdge,
    endTmpEdge
  } = props

  const [stage, setStage] = useState(null)

  const [sizes, setSizes] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  const resizeCanvas = () => {
    setSizes({
      width: window.innerWidth,
      height: window.innerHeight
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
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}>
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
        {/* {nodes.map((node, nodeIndex) => {
          return <Node key={`node-${nodeIndex}`} node={node} />
        })} */}
        <Cursor coords={getCursorCoords()} />
      </Layer>
    </Stage>
  )
}

export default Canvas
