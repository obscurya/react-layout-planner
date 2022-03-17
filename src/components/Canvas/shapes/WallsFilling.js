import React, { useMemo } from 'react'
import { Group, Rect, Shape } from 'react-konva'

import { WALLS_PATTERN, SHAPE_OPTIMIZATION_CONFIG } from '../constants'

const WallsFilling = (props) => {
  const { edges } = props

  if (!edges.length) {
    return null
  }

  const wallsFilling = useMemo(() => {
    const pointsGroups = edges.reduce((groups, { shape }) => {
      if (!shape) {
        return groups
      }

      const group = [
        ...shape.reduce((points, pointsGroup) => {
          return [...points, ...pointsGroup]
        }, []),
        shape[0][0]
      ]

      return [...groups, group]
    }, [])

    if (!pointsGroups.length) {
      return null
    }

    const firstPoint = pointsGroups[0][0]
    const [startPoint, rightBottom] = pointsGroups.reduce(
      ([startPoint, rightBottom], pointsGroup) => {
        pointsGroup.forEach((point) => {
          if (point.x < startPoint.x) {
            startPoint.x = point.x
          }

          if (point.y < startPoint.y) {
            startPoint.y = point.y
          }

          if (point.x > rightBottom.x) {
            rightBottom.x = point.x
          }

          if (point.y > rightBottom.y) {
            rightBottom.y = point.y
          }
        })

        return [startPoint, rightBottom]
      },
      [{ ...firstPoint }, { ...firstPoint }]
    )
    const dx = rightBottom.x - startPoint.x
    const dy = rightBottom.y - startPoint.y
    const size = dx > dy ? dx : dy

    if (!size) {
      return null
    }

    const endPoint = {
      x: startPoint.x + size,
      y: startPoint.y + size
    }
    const linesNumber = Math.floor(size / WALLS_PATTERN.STEP) + 1
    const lines = [...new Array(linesNumber)].reduce((linesPoints, _, i) => {
      const x = startPoint.x + WALLS_PATTERN.STEP * (i + 1)
      const y = startPoint.y + WALLS_PATTERN.STEP * (i + 1)

      return [
        ...linesPoints,
        [
          { x, y: startPoint.y },
          { x: startPoint.x, y }
        ],
        [
          { x, y: endPoint.y },
          { x: endPoint.x, y }
        ]
      ]
    }, [])

    return (
      <Group
        clipFunc={(c) => {
          c.beginPath()

          pointsGroups.forEach((pointsGroup) => {
            pointsGroup.forEach((point, i) => {
              const to = i ? c.lineTo : c.moveTo

              to.call(c, point.x, point.y)
            })
          })
          c.closePath()
        }}
        {...SHAPE_OPTIMIZATION_CONFIG}>
        <Rect
          {...startPoint}
          width={size}
          height={size}
          fill="#fff"
          {...SHAPE_OPTIMIZATION_CONFIG}
        />
        <Shape
          stroke={WALLS_PATTERN.COLOR}
          strokeWidth={1}
          sceneFunc={(c, shape) => {
            c.beginPath()

            lines.forEach(([start, end]) => {
              c.moveTo(start.x, start.y)
              c.lineTo(end.x, end.y)
            })

            c.strokeShape(shape)
            c.closePath()
          }}
          {...SHAPE_OPTIMIZATION_CONFIG}
        />
      </Group>
    )
  }, [edges])

  return wallsFilling
}

export default WallsFilling
