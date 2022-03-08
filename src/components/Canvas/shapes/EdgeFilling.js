import React from 'react'
import { Line } from 'react-konva'

import { EDGE_COLOR } from '../constants'

const Edge = (props) => {
  const { points } = props

  if (!points) {
    return null
  }

  return (
    <Line
      points={points}
      fill={EDGE_COLOR}
      strokeWidth={1}
      stroke={EDGE_COLOR}
      // stroke="green"
      lineJoin="round"
      closed
    />
  )
}

export default Edge
