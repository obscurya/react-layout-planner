import React from 'react'
import { Circle } from 'react-konva'

import { NODE_RADIUS, NODE_COLOR } from '../constants'

const Node = (props) => {
  const {
    node: { x, y }
  } = props

  return <Circle x={x} y={y} radius={NODE_RADIUS} fill={NODE_COLOR} />
}

export default Node
