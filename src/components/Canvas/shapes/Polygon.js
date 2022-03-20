import React from 'react'
import { Line } from 'react-konva'
import { useDeepCompareMemo } from 'use-deep-compare'

import { SHAPE_OPTIMIZATION_CONFIG } from '../constants'

import { pixelsToSquareMeters } from '../../LayoutPlanner/helpers'

import { Text } from './'

const Polygon = (props) => {
  const { nodes, center, area, color } = props

  const polygon = useDeepCompareMemo(() => {
    const points = nodes.reduce((points, { x, y }) => {
      return [...points, x, y]
    }, [])

    return (
      <Line
        points={points}
        fill={color}
        closed
        {...SHAPE_OPTIMIZATION_CONFIG}
      />
    )
  }, [nodes])

  return (
    <>
      {polygon}
      {center && (
        <Text text={`${pixelsToSquareMeters(area)}m²`} position={center} />
      )}
    </>
  )
}

export default Polygon
