import React from 'react'
import { Line } from 'react-konva'

import { POLYGON_COLORS } from '../constants'

const Polygon = (props) => {
  const { index, nodes } = props

  return (
    <Line
      points={nodes.reduce((points, { x, y }) => {
        return [...points, x, y]
      }, [])}
      fill={POLYGON_COLORS[index]}
      closed
    />
  )
}

export default Polygon
