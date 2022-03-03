import React from 'react'
import { Circle } from 'react-konva'

import { CURSOR_RADIUS, CURSOR_COLOR } from '../constants'

const Cursor = (props) => {
  const {
    coords: { x, y }
  } = props

  return <Circle x={x} y={y} radius={CURSOR_RADIUS} fill={CURSOR_COLOR} />
}

export default Cursor
