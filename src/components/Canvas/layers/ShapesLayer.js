import React from 'react'
import { Layer } from 'react-konva'

import { CURSOR_TOOL } from '../../LayoutPlanner/constants'
import { SHAPE_OPTIMIZATION_CONFIG } from '../constants'

import {
  pixelsToSquareMeters,
  pixelsToMeters
} from '../../LayoutPlanner/helpers'

import {
  Cursor,
  Polygon,
  TmpEdge,
  EdgeBorders,
  EdgeMeasurement,
  Text
} from '../shapes'

const ShapesLayer = (props) => {
  const { cursor, tmpEdge, edges, polygons } = props

  const renderCursor = () => {
    if (cursor.tool !== CURSOR_TOOL.DRAW_WALL) {
      return null
    }

    return <Cursor coords={cursor.coords} />
  }

  return (
    <Layer {...SHAPE_OPTIMIZATION_CONFIG}>
      {polygons.map((polygon, polygonIndex) => {
        return <Polygon key={`polygon-${polygonIndex}`} {...polygon} />
      })}
      {polygons.map(({ center, area }, polygonIndex) => {
        if (!center) {
          return null
        }

        return (
          <Text
            key={`polygon-text-${polygonIndex}`}
            text={`${pixelsToSquareMeters(area)}m²`}
            position={center}
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
        return borders.map(
          ({ borderLength, textPosition, borderAngle }, borderIndex) => {
            return (
              <Text
                key={`edge-${edgeIndex}-border-text-${borderIndex}`}
                text={`${pixelsToMeters(borderLength)}m`}
                position={textPosition}
                angle={borderAngle}
              />
            )
          }
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
