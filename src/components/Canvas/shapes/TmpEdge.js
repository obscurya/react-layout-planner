import React from 'react'
import { Line } from 'react-konva'
import { useDeepCompareMemo } from 'use-deep-compare'

import {
  EDGE_WIDTH,
  TMP_EDGE_COLOR_ALLOWED,
  TMP_EDGE_COLOR_NOT_ALLOWED,
  SHAPE_OPTIMIZATION_CONFIG
} from '../constants'

import { getCentroid } from '../../../helpers'
import { pixelsToMeters } from '../../LayoutPlanner/helpers'

import { Text } from './'

const TmpEdge = (props) => {
  const { nodes, length, angle, isAllowed } = props

  if (!nodes) {
    return null
  }

  const tmpEdge = useDeepCompareMemo(() => {
    const color = isAllowed
      ? TMP_EDGE_COLOR_ALLOWED
      : TMP_EDGE_COLOR_NOT_ALLOWED
    const [n1, n2] = nodes

    return (
      <Line
        points={[n1.x, n1.y, n2.x, n2.y]}
        strokeWidth={EDGE_WIDTH}
        stroke={color}
        lineCap="round"
        {...SHAPE_OPTIMIZATION_CONFIG}
      />
    )
  }, [nodes])

  const renderText = () => {
    const textPosition = getCentroid(nodes)

    return (
      <Text
        text={`${pixelsToMeters(length)}m`}
        position={textPosition}
        angle={angle}
      />
    )
  }

  return (
    <>
      {tmpEdge}
      {renderText()}
    </>
  )
}

export default TmpEdge
