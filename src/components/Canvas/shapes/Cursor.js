import React from 'react'
import { Circle } from 'react-konva'

import {
  NODE_RADIUS,
  CURSOR_COLOR,
  SHAPE_OPTIMIZATION_CONFIG
} from '../constants'

const Cursor = (props) => {
  const {
    coords: { x, y }
  } = props

  return (
    <Circle
      x={x}
      y={y}
      radius={NODE_RADIUS}
      fill={CURSOR_COLOR}
      {...SHAPE_OPTIMIZATION_CONFIG}
    />
  )
}

export default Cursor
