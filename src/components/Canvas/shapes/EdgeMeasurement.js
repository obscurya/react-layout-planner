import React from 'react'
import { Shape } from 'react-konva'

import { memoizeComponent } from '../../../helpers/memo'

import {
  EDGE_MEASUREMENT_LINE_COLOR,
  SHAPE_OPTIMIZATION_CONFIG
} from '../constants'

const EdgeMeasurement = (props) => {
  const { borders } = props

  return borders.map(({ mainLine, lineEnds, lineSkews }, borderIndex) => {
    const pointsGroups = [mainLine, ...lineEnds, ...lineSkews]

    return (
      <Shape
        key={`edge-border-${borderIndex}`}
        stroke={EDGE_MEASUREMENT_LINE_COLOR}
        strokeWidth={0.5}
        lineCap="round"
        {...SHAPE_OPTIMIZATION_CONFIG}
        sceneFunc={(c, shape) => {
          c.beginPath()

          pointsGroups.forEach((pointsGroup) => {
            pointsGroup.forEach((point, i) => {
              const to = i ? c.lineTo : c.moveTo

              to.call(c, point.x, point.y)
            })
          })

          c.strokeShape(shape)
          c.closePath()
        }}
      />
    )
  })
}

export default memoizeComponent(EdgeMeasurement)
