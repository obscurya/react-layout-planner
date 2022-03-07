import React from 'react'
import { Circle } from 'react-konva'

import { NODE_RADIUS, NODE_COLOR, HOVERED_NODE_COLOR } from '../constants'

const Node = (props) => {
  const {
    node: { x, y },
    isHovered
  } = props

  const fill = isHovered ? HOVERED_NODE_COLOR : NODE_COLOR

  return <Circle x={x} y={y} radius={NODE_RADIUS} fill={fill} />
}

export default Node
