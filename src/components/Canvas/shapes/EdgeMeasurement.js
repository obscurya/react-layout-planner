import React from 'react'
import { Group } from 'react-konva'

import {
  getAngleBetweenPoints,
  getDistanceBetweenPoints
} from '../../../helpers'

import { EdgeText } from './'

const EdgeMeasurement = (props) => {
  const { borders, pixelsToMeters } = props

  if (!borders) {
    return null
  }

  return (
    <Group>
      {borders.map((border, borderIndex) => {
        const [p1, p2] = border
        const borderLength = getDistanceBetweenPoints(p1, p2)
        const borderAngle = getAngleBetweenPoints(p1, p2)

        return (
          <EdgeText
            key={`edge-border-${borderIndex}`}
            text={`${pixelsToMeters(borderLength)}m`}
            nodes={border}
            angle={borderAngle}
            maxWidth={borderLength}
          />
        )
      })}

      {/* <EdgeText text={`${pixelsToMeters(length)}m`} nodes={nodes} angle={angle} /> */}
    </Group>
  )
}

export default EdgeMeasurement
