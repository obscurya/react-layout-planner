import React from 'react'
import { Shape } from 'react-konva'
import { useDeepCompareMemo } from 'use-deep-compare'

import {
  HALF_EDGE_WIDTH,
  EDGE_MEASUREMENT_LINE_END_SIZE,
  EDGE_MEASUREMENT_LINE_SKEW_SIZE,
  EDGE_MEASUREMENT_LINE_COLOR,
  SHAPE_OPTIMIZATION_CONFIG
} from '../constants'

import {
  getAngleBetweenPoints,
  getDistanceBetweenPoints,
  movePointDistanceAngle
} from '../../../helpers'

import { pixelsToMeters } from '../../LayoutPlanner/helpers'

import { Text } from './'

const EdgeMeasurement = (props) => {
  const { borders } = props

  const bordersData = borders.map((border) => {
    const [p1, p2] = border
    const borderLength = getDistanceBetweenPoints(p1, p2)
    const borderAngle = getAngleBetweenPoints(p1, p2)
    const rightAngle = borderAngle - Math.PI / 2
    const mainLine = border.map((p) => {
      return movePointDistanceAngle(p, HALF_EDGE_WIDTH, rightAngle)
    })

    return { borderLength, borderAngle, rightAngle, mainLine }
  })

  const borderMeasurements = useDeepCompareMemo(() => {
    return borders.map((border, borderIndex) => {
      const { borderAngle, rightAngle, mainLine } = bordersData[borderIndex]

      const lineEnds = border.map((p) => {
        const lineEnd = movePointDistanceAngle(
          p,
          EDGE_MEASUREMENT_LINE_END_SIZE,
          rightAngle
        )

        return [p, lineEnd]
      })
      const lineSkews = mainLine.map((p) => {
        const lineSkew = [-Math.PI / 4, (3 * Math.PI) / 4].map((angle) => {
          return movePointDistanceAngle(
            p,
            EDGE_MEASUREMENT_LINE_SKEW_SIZE,
            borderAngle + angle
          )
        })

        return lineSkew
      })
      const pointsGroups = [mainLine, ...lineEnds, ...lineSkews]

      return (
        <Shape
          key={`edge-border-${borderIndex}`}
          stroke={EDGE_MEASUREMENT_LINE_COLOR}
          strokeWidth={0.5}
          lineCap="round"
          {...SHAPE_OPTIMIZATION_CONFIG}
          sceneFunc={(c, shape) => {
            c.beginPath()

            pointsGroups.forEach((pointsGroup) => {
              pointsGroup.forEach((point, i) => {
                const to = i ? c.lineTo : c.moveTo

                to.call(c, point.x, point.y)
              })
            })

            c.strokeShape(shape)
            c.closePath()
          }}
        />
      )
    })
  }, [borders])

  return (
    <>
      {borderMeasurements}
      {bordersData.map(
        ({ borderLength, borderAngle, mainLine }, borderIndex) => {
          const textPosition = {
            x: (mainLine[0].x + mainLine[1].x) / 2,
            y: (mainLine[0].y + mainLine[1].y) / 2
          }

          return (
            <Text
              key={`edge-border-text-${borderIndex}`}
              text={`${pixelsToMeters(borderLength)}m`}
              position={textPosition}
              angle={borderAngle}
            />
          )
        }
      )}
    </>
  )
}

export default EdgeMeasurement
