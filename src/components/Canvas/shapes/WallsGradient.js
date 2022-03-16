import React from 'react'
import { Group, Rect, Line } from 'react-konva'

import { WALLS_PATTERN, SHAPE_OPTIMIZATION_CONFIG } from '../constants'

const PatternLine = (props) => {
  const { points } = props

  return <Line points={points} stroke={WALLS_PATTERN.COLOR} strokeWidth={1} />
}

const WallsGradient = (props) => {
  const { edges } = props

  if (!edges.length) {
    return null
  }

  const pointGroups = edges.reduce((groups, { shape }) => {
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

  const points = pointGroups.reduce((points, pointGroup) => {
    return [...points, ...pointGroup]
  }, [])
  const [startPoint, rightBottom] = points.reduce(
    ([startPoint, rightBottom], point) => {
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

      return [startPoint, rightBottom]
    },
    [{ ...points[0] }, { ...points[0] }]
  )
  const dx = rightBottom.x - startPoint.x
  const dy = rightBottom.y - startPoint.y
  const size = dx > dy ? dx : dy
  const endPoint = {
    x: startPoint.x + size,
    y: startPoint.y + size
  }

  const getLines = () => {
    const lines = []

    let x = startPoint.x + WALLS_PATTERN.STEP
    let i = 1

    while (x < endPoint.x) {
      const y = startPoint.y + WALLS_PATTERN.STEP * i

      lines.push(
        <PatternLine
          key={`line-1-${x + y}`}
          points={[x, startPoint.y, startPoint.x, y]}
        />,
        <PatternLine
          key={`line-2-${x + y}`}
          points={[x, endPoint.y, endPoint.x, y]}
        />
      )

      x += WALLS_PATTERN.STEP
      i++
    }

    lines.push(
      <PatternLine
        key="line-diagonal"
        points={[startPoint.x, endPoint.y, endPoint.x, startPoint.y]}
      />
    )

    return lines
  }

  const lines = getLines()

  return (
    <Group
      listening={false}
      clipFunc={(c) => {
        c.beginPath()

        pointGroups.forEach((pointGroup) => {
          pointGroup.forEach((point, i) => {
            const to = i ? c.lineTo : c.moveTo

            to.call(c, point.x, point.y)
          })
        })
        c.closePath()
      }}>
      <Rect
        {...startPoint}
        width={size}
        height={size}
        fill="#fff"
        {...SHAPE_OPTIMIZATION_CONFIG}
      />
      {lines}
    </Group>
  )
}

export default WallsGradient
