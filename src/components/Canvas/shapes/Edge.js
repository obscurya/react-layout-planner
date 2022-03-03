import React from 'react'
import { Group, Line, Text } from 'react-konva'

import {
  EDGE_WIDTH,
  EDGE_COLOR,
  EDGE_BORDER_COLOR,
  FONT_CONFIG
} from '../constants'

const Edge = (props) => {
  const { index, nodes, length, angle, shape } = props

  const [n1, n2] = nodes

  let textAngle = angle
  let textCoords = n1

  if (angle > Math.PI / 2 && angle < 3 * (Math.PI / 2)) {
    textAngle += Math.PI
    textCoords = n2
  }

  const renderLine = () => {
    if (shape) {
      const coords = shape.reduce((coords, pointsGroup) => {
        return [
          ...coords,
          ...pointsGroup.reduce((groupCoords, { x, y }) => {
            return [...groupCoords, x, y]
          }, [])
        ]
      }, [])
      const borders = shape.map((pointsGroup, groupIndex) => {
        return [
          pointsGroup.slice(-1)[0],
          (shape[groupIndex + 1] || shape[0])[0]
        ]
      })

      return (
        <>
          <Line
            points={coords}
            fill={EDGE_COLOR}
            strokeWidth={1}
            stroke={EDGE_COLOR}
            // stroke="green"
            closed
          />
          {borders.map(([p1, p2], borderIndex) => {
            return (
              <Line
                key={`edge-border-${borderIndex}`}
                points={[p1.x, p1.y, p2.x, p2.y]}
                strokeWidth={1}
                stroke={EDGE_BORDER_COLOR}
              />
            )
          })}
        </>
      )
    }

    return (
      <Line
        points={[n1.x, n1.y, n2.x, n2.y]}
        strokeWidth={EDGE_WIDTH}
        stroke={EDGE_COLOR}
        lineCap="round"
      />
    )
  }

  return (
    <Group>
      {renderLine()}
      <Text
        text={index}
        width={length}
        rotation={(textAngle * 180) / Math.PI}
        {...textCoords}
        {...FONT_CONFIG}
      />
    </Group>
  )
}

export default Edge
