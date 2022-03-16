import React from 'react'
import { Line } from 'react-konva'
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

import { Text } from './'

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
      const textPosition = {
        x: (nodes[0].x + nodes[1].x) / 2,
        y: (nodes[0].y + nodes[1].y) / 2
      }

      return (
        <React.Fragment key={`edge-border-${borderIndex}`}>
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
          <Text
            text={`${pixelsToMeters(borderLength)}m`}
            position={textPosition}
            angle={borderAngle}
          />
        </React.Fragment>
      )
    })
  }, [borders])

  return borderMeasurements
}

export default EdgeMeasurement
