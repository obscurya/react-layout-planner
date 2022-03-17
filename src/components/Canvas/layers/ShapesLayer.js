// TODO: useDeepCompareMemo?
// TODO: improve naming

import React, { useMemo } from 'react'
import { Layer } from 'react-konva'

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
  const {
    cursor,
    tmpEdge,
    nodes,
    edges,
    polygons,
    pixelsToMeters,
    pixelsToSquareMeters
  } = props

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
    <Layer {...SHAPE_OPTIMIZATION_CONFIG}>
      {_polygons}
      <WallsFilling edges={edges} />
      {_nodes}
      {_edgesMeasurement}
      {_edgesBorders}
      {_tmpEdge}
      {_cursor}
    </Layer>
  )
}

export default ShapesLayer
