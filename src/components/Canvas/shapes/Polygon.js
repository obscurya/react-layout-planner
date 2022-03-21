import React from 'react'
import { Shape } from 'react-konva'

import { memoizeComponent } from '../../../helpers/memo'

import { SHAPE_OPTIMIZATION_CONFIG } from '../constants'

import {
  sortPointsInClockwiseOrder,
  sortPointsInCounterClockwiseOrder
} from '../../../helpers'

const Polygon = (props) => {
  const { points, innerPolygonsPoints, color } = props

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
}

export default memoizeComponent(Polygon)
