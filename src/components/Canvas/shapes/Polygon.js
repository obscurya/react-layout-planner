import React from 'react'
import { Line } from 'react-konva'
import { useDeepCompareMemo } from 'use-deep-compare'

import { SHAPE_OPTIMIZATION_CONFIG } from '../constants'

import { pixelsToSquareMeters } from '../../LayoutPlanner/helpers'

import { Text } from './'

const Polygon = (props) => {
  const { nodes, center, area, color } = props

  if (!nodes) {
    return null
  }

  const polygon = useDeepCompareMemo(() => {
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
  }, [nodes])

  return polygon
}

export default Polygon
