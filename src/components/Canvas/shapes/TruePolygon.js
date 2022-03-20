import React from 'react'
import { Line } from 'react-konva'
import { useDeepCompareMemo } from 'use-deep-compare'

import { SHAPE_OPTIMIZATION_CONFIG } from '../constants'

const TruePolygon = (props) => {
  const { nodes } = props

  const polygon = useDeepCompareMemo(() => {
    const points = nodes.reduce((points, { x, y }) => {
      return [...points, x, y]
    }, [])

    return (
      <Line
        points={points}
        fill="rgba(255, 0, 0, 0.3)"
        closed
        {...SHAPE_OPTIMIZATION_CONFIG}
      />
    )
  }, [nodes])

  return polygon
}

export default TruePolygon
