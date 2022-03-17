// TODO: move text to another shape/layer

import React, { useMemo } from 'react'
import { Layer } from 'react-konva'
import { useDeepCompareMemo, useDeepCompareCallback } from 'use-deep-compare'

import { CURSOR_TOOL } from '../../LayoutPlanner/constants'
import { SHAPE_OPTIMIZATION_CONFIG } from '../constants'

import {
  Cursor,
  Node,
  WallsFilling,
  Polygon,
  TmpEdge,
  EdgeBorders,
  EdgeMeasurement
} from '../shapes'

const ShapesLayer = (props) => {
  const { cursor, tmpEdge, nodes, edges, polygons } = props

  const isNodeHovered = useDeepCompareCallback(
    (nodeIndex) => {
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
    },
    [cursor.grabbedObject, cursor.hoveredObject]
  )

  const memoizedPolygons = useDeepCompareMemo(() => {
    return polygons.map(({ nodes, center, area, color }, polygonIndex) => {
      return (
        <Polygon
          key={`polygon-${polygonIndex}`}
          nodes={nodes}
          center={center}
          area={area}
          color={color}
        />
      )
    })
  }, [polygons])

  const memoizedNodes = useMemo(() => {
    if (cursor.tool !== CURSOR_TOOL.MOVE) {
      return null
    }

    return nodes.map((node, nodeIndex) => {
      return (
        <Node
          key={`node-${nodeIndex}`}
          index={nodeIndex}
          node={node}
          isHovered={isNodeHovered(nodeIndex)}
        />
      )
    })
  }, [cursor.tool, nodes, isNodeHovered])

  const memoizedEdgesMeasurement = useMemo(() => {
    return edges.map(({ borders }, edgeIndex) => {
      return (
        <EdgeMeasurement
          key={`edge-measurement-${edgeIndex}`}
          borders={borders}
        />
      )
    })
  }, [edges])

  const memoizedEdgesBorders = useMemo(() => {
    return edges.map(({ borders }, edgeIndex) => {
      return <EdgeBorders key={`edge-borders-${edgeIndex}`} borders={borders} />
    })
  }, [edges])

  const memoizedCursor = useDeepCompareMemo(() => {
    if (cursor.tool !== CURSOR_TOOL.DRAW_WALL) {
      return null
    }

    return <Cursor coords={cursor.coords} />
  }, [cursor.tool, cursor.coords])

  return (
    <Layer {...SHAPE_OPTIMIZATION_CONFIG}>
      {memoizedPolygons}
      <WallsFilling edges={edges} />
      {memoizedNodes}
      {memoizedEdgesMeasurement}
      {memoizedEdgesBorders}
      <TmpEdge {...(tmpEdge || {})} />
      {memoizedCursor}
    </Layer>
  )
}

export default ShapesLayer
