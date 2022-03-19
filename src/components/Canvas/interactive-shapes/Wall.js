import React from 'react'
import { Line } from 'react-konva'

const Wall = (props) => {
  const { index, points, bindCursorToEdge, unbindCursorFromEdge } = props

  const handleMouseMove = () => {
    bindCursorToEdge(index)
  }

  const handleMouseLeave = () => {
    unbindCursorFromEdge()
  }

  return (
    <Line
      points={points.reduce((points, { x, y }) => {
        return [...points, x, y]
      }, [])}
      closed
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    />
  )
}

export default Wall
