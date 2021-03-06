import React from 'react'
import { Circle } from 'react-konva'

import { NODE_RADIUS, GRID_LINE_STEP } from '../constants'

const Node = (props) => {
  const { index, node, fill, bindCursorToNode, unbindCursorFromNode } = props

  const handleMouseEnter = () => {
    bindCursorToNode(index)
  }

  const handleMouseLeave = () => {
    unbindCursorFromNode()
  }

  return (
    <Circle
      {...node}
      radius={NODE_RADIUS}
      fill={fill}
      stroke="transparent"
      strokeWidth={GRID_LINE_STEP}
      perfectDrawEnabled={false}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  )
}

export default Node
