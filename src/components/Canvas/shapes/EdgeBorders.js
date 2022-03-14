import React, { useMemo } from 'react'
import { Group, Line } from 'react-konva'

import { EDGE_BORDER_COLOR, SHAPE_OPTIMIZATION_CONFIG } from '../constants'

const EdgeBorders = (props) => {
  const { borders } = props

  if (!borders) {
    return null
  }

  const borderLines = useMemo(() => {
    return borders.map(([p1, p2], borderIndex) => {
      return (
        <Line
          key={`edge-border-${borderIndex}`}
          points={[p1.x, p1.y, p2.x, p2.y]}
          strokeWidth={1}
          stroke={EDGE_BORDER_COLOR}
          lineCap="round"
          {...SHAPE_OPTIMIZATION_CONFIG}
        />
      )
    })
  }, [borders])

  return <Group>{borderLines}</Group>
}

export default EdgeBorders
