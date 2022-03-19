// TODO: move text to another shape/layer

import React, { useMemo } from 'react'
import { Layer } from 'react-konva'
import { useDeepCompareMemo } from 'use-deep-compare'

import { CURSOR_TOOL } from '../../LayoutPlanner/constants'
import { SHAPE_OPTIMIZATION_CONFIG } from '../constants'

import {
  Cursor,
  Polygon,
  TmpEdge,
  EdgeBorders,
  EdgeMeasurement
} from '../shapes'

const ShapesLayer = (props) => {
  const { cursor, tmpEdge, edges, polygons } = props

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
      {memoizedEdgesMeasurement}
      {memoizedEdgesBorders}
      <TmpEdge {...(tmpEdge || {})} />
      {memoizedCursor}
    </Layer>
  )
}

export default ShapesLayer
