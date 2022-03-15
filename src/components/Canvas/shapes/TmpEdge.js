import React from 'react'
import { Group, Line } from 'react-konva'

import {
  EDGE_WIDTH,
  TMP_EDGE_COLOR_ALLOWED,
  TMP_EDGE_COLOR_NOT_ALLOWED,
  SHAPE_OPTIMIZATION_CONFIG
} from '../constants'

import { Text } from './'

const TmpEdge = (props) => {
  const { nodes, length, angle, isAllowed, pixelsToMeters } = props

  const color = isAllowed ? TMP_EDGE_COLOR_ALLOWED : TMP_EDGE_COLOR_NOT_ALLOWED
  const [n1, n2] = nodes
  const textPosition = {
    x: (n1.x + n2.x) / 2,
    y: (n1.y + n2.y) / 2
  }

  return (
    <Group>
      <Line
        points={[n1.x, n1.y, n2.x, n2.y]}
        strokeWidth={EDGE_WIDTH}
        stroke={color}
        lineCap="round"
        {...SHAPE_OPTIMIZATION_CONFIG}
      />
      <Text
        text={`≈${pixelsToMeters(length)}m`}
        position={textPosition}
        angle={angle}
      />
    </Group>
  )
}

export default TmpEdge
