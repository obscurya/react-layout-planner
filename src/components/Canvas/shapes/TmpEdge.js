import React from 'react'
import { Line } from 'react-konva'

import {
  EDGE_WIDTH,
  TMP_EDGE_COLOR_ALLOWED,
  TMP_EDGE_COLOR_NOT_ALLOWED
} from '../constants'

const TmpEdge = (props) => {
  const { nodes, isAllowed } = props

  const [n1, n2] = nodes
  const color = isAllowed ? TMP_EDGE_COLOR_ALLOWED : TMP_EDGE_COLOR_NOT_ALLOWED

  return (
    <Line
      points={[n1.x, n1.y, n2.x, n2.y]}
      strokeWidth={EDGE_WIDTH}
      stroke={color}
      lineCap="round"
    />
  )
}

export default TmpEdge
