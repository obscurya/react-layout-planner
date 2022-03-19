import React from 'react'
import { Shape } from 'react-konva'
import { useDeepCompareMemo } from 'use-deep-compare'

import { EDGE_BORDER_COLOR, SHAPE_OPTIMIZATION_CONFIG } from '../constants'

const EdgeBorders = (props) => {
  const { borders } = props

  const borderLines = useDeepCompareMemo(() => {
    return (
      <Shape
        stroke={EDGE_BORDER_COLOR}
        strokeWidth={1}
        lineCap="round"
        sceneFunc={(c, shape) => {
          c.beginPath()

          borders.forEach(([p1, p2]) => {
            c.moveTo(p1.x, p1.y)
            c.lineTo(p2.x, p2.y)
          })

          c.strokeShape(shape)
          c.closePath()
        }}
        {...SHAPE_OPTIMIZATION_CONFIG}
      />
    )
  }, [borders])

  return borderLines
}

export default EdgeBorders
