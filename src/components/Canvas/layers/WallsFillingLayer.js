import React, { useMemo } from 'react'
import { Layer, Group, Rect, Shape } from 'react-konva'

import { WALLS_PATTERN, SHAPE_OPTIMIZATION_CONFIG } from '../constants'

const WallsFillingLayer = (props) => {
  const { edges } = props

  if (!edges.length) {
    return null
  }

  const wallsFilling = useMemo(() => {
    const pointsGroups = edges.reduce((groups, { points }) => {
      return [...groups, [...points, points[0]]]
    }, [])

    if (!pointsGroups.length) {
      return null
    }

    const firstPoint = pointsGroups[0][0]
    const [startPoint, endPoint] = pointsGroups.reduce(
      ([startPoint, endPoint], pointsGroup) => {
        pointsGroup.forEach((point) => {
          if (point.x < startPoint.x) {
            startPoint.x = point.x
          }

          if (point.y < startPoint.y) {
            startPoint.y = point.y
          }

          if (point.x > endPoint.x) {
            endPoint.x = point.x
          }

          if (point.y > endPoint.y) {
            endPoint.y = point.y
          }
        })

        return [startPoint, endPoint]
      },
      [{ ...firstPoint }, { ...firstPoint }]
    )
    const width = endPoint.x - startPoint.x
    const height = endPoint.y - startPoint.y

    if (width === 0 || height === 0) {
      return null
    }

    const linesNumber = Math.floor((width + height) / WALLS_PATTERN.STEP)
    const diagonalLength = height * Math.sqrt(2)

    let lineStartX = startPoint.x
    let lineEndX = lineStartX + diagonalLength * Math.cos(3 * (Math.PI / 4))

    const lines = [...new Array(linesNumber)].reduce((linesPoints) => {
      lineStartX += WALLS_PATTERN.STEP
      lineEndX += WALLS_PATTERN.STEP

      const p1 = {
        x: lineStartX,
        y: startPoint.y
      }
      const p2 = {
        x: lineEndX,
        y: endPoint.y
      }

      return [...linesPoints, [p1, p2]]
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
          width={width}
          height={height}
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

  return <Layer {...SHAPE_OPTIMIZATION_CONFIG}>{wallsFilling}</Layer>
}

export default WallsFillingLayer
