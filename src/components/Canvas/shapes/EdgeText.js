import React, { useState } from 'react'
import { Text } from 'react-konva'

import { FONT_CONFIG } from '../constants'

const EdgeText = (props) => {
  const { text = 'Hello!', nodes, angle } = props

  const [instance, setInstance] = useState(null)

  const getRotation = () => {
    if (angle > Math.PI / 2 && angle < 3 * (Math.PI / 2)) {
      return angle + Math.PI
    }

    return angle
  }

  const [n1, n2] = nodes
  const rotation = getRotation()
  const edgeCenter = {
    x: (n1.x + n2.x) / 2,
    y: (n1.y + n2.y) / 2
  }
  const width = instance?.getTextWidth()

  const getCoords = () => {
    if (!width) {
      return edgeCenter
    }

    return {
      x: edgeCenter.x - (width / 2) * Math.cos(rotation),
      y: edgeCenter.y - (width / 2) * Math.sin(rotation)
    }
  }

  return (
    <Text
      ref={setInstance}
      text={text}
      rotation={rotation}
      {...getCoords()}
      {...FONT_CONFIG}
    />
  )
}

export default EdgeText
