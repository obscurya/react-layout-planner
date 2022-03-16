import React from 'react'
import { Line } from 'react-konva'

import { SHAPE_OPTIMIZATION_CONFIG } from '../constants'

import { Text } from './'

const Polygon = (props) => {
  const { nodes, center, area, color, pixelsToSquareMeters } = props

  if (!nodes) {
    return null
  }

  const points = nodes.reduce((points, { x, y }) => {
    return [...points, x, y]
  }, [])

  return (
    <>
      <Line
        points={points}
        fill={color}
        closed
        {...SHAPE_OPTIMIZATION_CONFIG}
      />
      {center && (
        <Text text={`${pixelsToSquareMeters(area)}m²`} position={center} />
      )}
    </>
  )
}

export default Polygon
