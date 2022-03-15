import React, { useState } from 'react'
import { Group, Rect, Text } from 'react-konva'

import { FONT_CONFIG, SHAPE_OPTIMIZATION_CONFIG } from '../constants'

const RECT_PADDING = 2

const CustomText = (props) => {
  const { text = 'Hello!', position, angle = 0 } = props

  const [instance, setInstance] = useState(null)

  const getRotation = () => {
    if (angle > Math.PI / 2 && angle < 3 * (Math.PI / 2)) {
      return angle + Math.PI
    }

    return angle
  }

  const rotation = getRotation()
  const width = instance?.width()

  const getCoords = () => {
    if (!width) {
      return position
    }

    return {
      x: position.x - (width / 2) * Math.cos(rotation),
      y: position.y - (width / 2) * Math.sin(rotation)
    }
  }

  const coords = getCoords()

  const rectWidth = width ? width + RECT_PADDING : undefined
  const rectHeight = FONT_CONFIG.fontSize
  const rectHalfHeight = rectHeight / 2
  const rectCoords = {
    x:
      coords.x +
      (RECT_PADDING / 2) * Math.cos(rotation + Math.PI) +
      rectHalfHeight * Math.cos(rotation - Math.PI / 2),
    y:
      coords.y +
      (RECT_PADDING / 2) * Math.sin(rotation + Math.PI) +
      rectHalfHeight * Math.sin(rotation - Math.PI / 2)
  }

  return (
    <Group>
      <Rect
        {...rectCoords}
        width={rectWidth}
        height={rectHeight}
        rotation={rotation}
        fill="rgba(255, 255, 255, 0.5)"
        cornerRadius={2}
        {...SHAPE_OPTIMIZATION_CONFIG}
      />
      <Text
        ref={setInstance}
        text={text}
        {...coords}
        rotation={rotation}
        {...FONT_CONFIG}
        {...SHAPE_OPTIMIZATION_CONFIG}
      />
    </Group>
  )
}

export default CustomText
