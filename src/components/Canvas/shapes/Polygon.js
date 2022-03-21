import React from 'react'
import { Shape } from 'react-konva'
import { useDeepCompareMemo } from 'use-deep-compare'

import { SHAPE_OPTIMIZATION_CONFIG } from '../constants'

import {
  sortPointsInClockwiseOrder,
  sortPointsInCounterClockwiseOrder
} from '../../../helpers'
import { pixelsToSquareMeters } from '../../LayoutPlanner/helpers'

import { Text } from './'

const Polygon = (props) => {
  const { points, innerPolygonsPoints, center, area, color } = props

  const polygon = useDeepCompareMemo(() => {
    return (
      <Shape
        fill={color}
        sceneFunc={(c, shape) => {
          const pointsInClockwiseOrder = sortPointsInClockwiseOrder(points)

          c.beginPath()

          pointsInClockwiseOrder.forEach(({ x, y }, pi) => {
            const to = pi ? c.lineTo : c.moveTo

            to.call(c, x, y)
          })

          c.closePath()

          innerPolygonsPoints.forEach((innerPolygonPoints) => {
            const innerPointsInCounterClockwiseOrder =
              sortPointsInCounterClockwiseOrder(innerPolygonPoints)

            innerPointsInCounterClockwiseOrder.forEach(({ x, y }, pi) => {
              const to = pi ? c.lineTo : c.moveTo

              to.call(c, x, y)
            })

            c.closePath()
          })

          c.fillShape(shape)
        }}
        {...SHAPE_OPTIMIZATION_CONFIG}
      />
    )
  }, [points, innerPolygonsPoints])

  return (
    <>
      {polygon}
      {center && (
        <Text text={`${pixelsToSquareMeters(area)}m²`} position={center} />
      )}
    </>
  )
}

export default Polygon
