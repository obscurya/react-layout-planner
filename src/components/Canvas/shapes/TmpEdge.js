import React from 'react'
import { Group, Line, Text } from 'react-konva'

import {
  EDGE_WIDTH,
  TMP_EDGE_COLOR_ALLOWED,
  TMP_EDGE_COLOR_NOT_ALLOWED,
  FONT_CONFIG
} from '../constants'

const TmpEdge = (props) => {
  const { nodes, length, angle, isAllowed, pixelsToMeters } = props

  const color = isAllowed ? TMP_EDGE_COLOR_ALLOWED : TMP_EDGE_COLOR_NOT_ALLOWED
  const [n1, n2] = nodes

  let textAngle = angle
  let textCoords = n1

  if (angle > Math.PI / 2 && angle < 3 * (Math.PI / 2)) {
    textAngle += Math.PI
    textCoords = n2
  }

  return (
    <Group>
      <Line
        points={[n1.x, n1.y, n2.x, n2.y]}
        strokeWidth={EDGE_WIDTH}
        stroke={color}
        lineCap="round"
      />
      <Text
        text={`≈${pixelsToMeters(length)}m`}
        width={length}
        rotation={textAngle}
        {...textCoords}
        {...FONT_CONFIG}
      />
    </Group>
  )
}

export default TmpEdge
