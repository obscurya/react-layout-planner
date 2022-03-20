import React from 'react'
import { Layer } from 'react-konva'

import { CURSOR_TOOL } from '../../LayoutPlanner/constants'
import { SHAPE_OPTIMIZATION_CONFIG } from '../constants'

import {
  Cursor,
  Polygon,
  TmpEdge,
  EdgeBorders,
  EdgeMeasurement,
  TruePolygon
} from '../shapes'

const ShapesLayer = (props) => {
  const { cursor, tmpEdge, edges, polygons, truePolygons } = props

  const renderCursor = () => {
    if (cursor.tool !== CURSOR_TOOL.DRAW_WALL) {
      return null
    }

    return <Cursor coords={cursor.coords} />
  }

  return (
    <Layer {...SHAPE_OPTIMIZATION_CONFIG}>
      {/* {polygons.map(({ nodes, center, area, color }, polygonIndex) => {
        return (
          <Polygon
            key={`polygon-${polygonIndex}`}
            nodes={nodes}
            center={center}
            area={area}
            color={color}
          />
        )
      })} */}
      {truePolygons.map((truePolygon, truePolygonIndex) => {
        return (
          <TruePolygon
            key={`truePolygon-${truePolygonIndex}`}
            nodes={truePolygon}
          />
        )
      })}
      {edges.map(({ borders }, edgeIndex) => {
        return (
          <EdgeMeasurement
            key={`edge-measurement-${edgeIndex}`}
            borders={borders}
          />
        )
      })}
      {edges.map(({ borders }, edgeIndex) => {
        return (
          <EdgeBorders key={`edge-borders-${edgeIndex}`} borders={borders} />
        )
      })}
      <TmpEdge {...(tmpEdge || {})} />
      {renderCursor()}
    </Layer>
  )
}

export default ShapesLayer
