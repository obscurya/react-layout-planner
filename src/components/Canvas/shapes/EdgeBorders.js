import React from 'react'
import { Shape } from 'react-konva'

import { memoizeComponent } from '../../../helpers/memo'

import { EDGE_BORDER_COLOR, SHAPE_OPTIMIZATION_CONFIG } from '../constants'

const EdgeBorders = (props) => {
  const { borders } = props

  return (
    <Shape
      stroke={EDGE_BORDER_COLOR}
      strokeWidth={1}
      lineCap="round"
      sceneFunc={(c, shape) => {
        c.beginPath()

        borders.forEach(({ points: [p1, p2] }) => {
          c.moveTo(p1.x, p1.y)
          c.lineTo(p2.x, p2.y)
        })

        c.strokeShape(shape)
        c.closePath()
      }}
      {...SHAPE_OPTIMIZATION_CONFIG}
    />
  )
}

export default memoizeComponent(EdgeBorders)
