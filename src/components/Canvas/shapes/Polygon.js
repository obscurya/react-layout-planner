import React from 'react'
import { Group, Line } from 'react-konva'

import { POLYGON_COLORS, SHAPE_OPTIMIZATION_CONFIG } from '../constants'

import { CustomText } from './'

const Polygon = (props) => {
  const { index, nodes, center, area, pixelsToSquareMeters } = props

  if (!nodes) {
    return null
  }

  const points = nodes.reduce((points, { x, y }) => {
    return [...points, x, y]
  }, [])

  return (
    <Group>
      <Line
        points={points}
        fill={POLYGON_COLORS[index]}
        closed
        {...SHAPE_OPTIMIZATION_CONFIG}
      />
      {center && (
        <CustomText
          text={`${pixelsToSquareMeters(area)}m2`}
          position={center}
        />
      )}
    </Group>
  )
}

export default Polygon
