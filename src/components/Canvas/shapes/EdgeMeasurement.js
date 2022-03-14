import React from 'react'
import { Group, Line } from 'react-konva'
import { useDeepCompareMemo } from 'use-deep-compare'

import {
  EDGE_WIDTH,
  HALF_EDGE_WIDTH,
  EDGE_MEASUREMENT_LINE_COLOR,
  SHAPE_OPTIMIZATION_CONFIG
} from '../constants'

import {
  getAngleBetweenPoints,
  getDistanceBetweenPoints,
  movePointDistanceAngle
} from '../../../helpers'

import { EdgeText } from './'

const MeasurementLine = (props) => {
  const { points } = props

  return (
    <Line
      points={points}
      stroke={EDGE_MEASUREMENT_LINE_COLOR}
      strokeWidth={0.5}
      lineCap="round"
      {...SHAPE_OPTIMIZATION_CONFIG}
    />
  )
}

const EdgeMeasurement = (props) => {
  const { borders, pixelsToMeters } = props

  if (!borders) {
    return null
  }

  const borderMeasurements = useDeepCompareMemo(() => {
    return borders.map((border, borderIndex) => {
      const [p1, p2] = border
      const borderLength = getDistanceBetweenPoints(p1, p2)
      const borderAngle = getAngleBetweenPoints(p1, p2)
      const nodes = border.map((p) => {
        return movePointDistanceAngle(
          p,
          HALF_EDGE_WIDTH,
          borderAngle - Math.PI / 2
        )
      })

      return (
        <Group key={`edge-border-${borderIndex}`}>
          {border.map((p, i) => {
            const lineEnd = movePointDistanceAngle(
              p,
              EDGE_WIDTH,
              borderAngle - Math.PI / 2
            )

            return (
              <MeasurementLine
                key={`edge-border-${borderIndex}-lineEnd-${i}`}
                points={[p.x, p.y, lineEnd.x, lineEnd.y]}
              />
            )
          })}
          {nodes.map((p, i) => {
            const lineSkew = [-Math.PI / 4, (3 * Math.PI) / 4].map((angle) => {
              return movePointDistanceAngle(
                p,
                HALF_EDGE_WIDTH / 1.5,
                borderAngle + angle
              )
            })

            return (
              <MeasurementLine
                key={`edge-border-${borderIndex}-lineSkew-${i}`}
                points={lineSkew.reduce((points, { x, y }) => {
                  return [...points, x, y]
                }, [])}
              />
            )
          })}
          <MeasurementLine
            points={nodes.reduce((points, { x, y }) => {
              return [...points, x, y]
            }, [])}
          />
          <EdgeText
            text={`${pixelsToMeters(borderLength)}m`}
            nodes={nodes}
            angle={borderAngle}
            maxWidth={borderLength}
          />
        </Group>
      )
    })
  }, [borders])

  return <Group>{borderMeasurements}</Group>
}

export default EdgeMeasurement
