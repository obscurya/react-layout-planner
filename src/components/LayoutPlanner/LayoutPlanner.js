import React from 'react'

import { useLayoutPlanner } from '../../hooks/useLayoutPlanner'

import Canvas from '../Canvas'

const LayoutPlanner = () => {
  const {
    tmpEdge,
    nodes,
    edges,
    polygons,
    setCursorCoords,
    getCursorCoords,
    beginTmpEdge,
    endTmpEdge
  } = useLayoutPlanner()

  return (
    <Canvas
      tmpEdge={tmpEdge}
      nodes={nodes}
      edges={edges}
      polygons={polygons}
      setCursorCoords={setCursorCoords}
      getCursorCoords={getCursorCoords}
      beginTmpEdge={beginTmpEdge}
      endTmpEdge={endTmpEdge}
    />
  )
}

export default LayoutPlanner
