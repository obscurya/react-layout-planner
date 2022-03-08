import React from 'react'
import { Group, Line } from 'react-konva'

import {
  EDGE_WIDTH,
  TMP_EDGE_COLOR_ALLOWED,
  TMP_EDGE_COLOR_NOT_ALLOWED
} from '../constants'

import { EdgeText } from './'

const TmpEdge = (props) => {
  const { nodes, length, angle, isAllowed, pixelsToMeters } = props

  const color = isAllowed ? TMP_EDGE_COLOR_ALLOWED : TMP_EDGE_COLOR_NOT_ALLOWED
  const [n1, n2] = nodes

  return (
    <Group>
      <Line
        points={[n1.x, n1.y, n2.x, n2.y]}
        strokeWidth={EDGE_WIDTH}
        stroke={color}
        lineCap="round"
      />
      <EdgeText
        text={`≈${pixelsToMeters(length)}m`}
        nodes={nodes}
        angle={angle}
      />
    </Group>
  )
}

export default TmpEdge
