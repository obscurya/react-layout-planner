import React, { useState } from 'react'
import { Group, Rect, Text } from 'react-konva'

import { FONT_CONFIG } from '../constants'

const RECT_PADDING = 2

const EdgeText = (props) => {
  const { text = 'Hello!', nodes, angle, maxWidth } = props

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
  // const isMaxWidthLessThanWidth = width && maxWidth && maxWidth < width
  const isMaxWidthLessThanWidth = false

  const getCoords = () => {
    if (!width) {
      return edgeCenter
    }

    const textWidth = isMaxWidthLessThanWidth ? maxWidth : width

    return {
      x: edgeCenter.x - (textWidth / 2) * Math.cos(rotation),
      y: edgeCenter.y - (textWidth / 2) * Math.sin(rotation)
    }
  }

  const getScale = () => {
    const scale = isMaxWidthLessThanWidth ? maxWidth / width : 1

    return { x: scale, y: scale }
  }

  const coords = getCoords()
  const scale = getScale()

  const rectWidth = width + RECT_PADDING
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
      />
      <Text
        ref={setInstance}
        text={text}
        {...coords}
        rotation={rotation}
        scale={scale}
        {...FONT_CONFIG}
      />
    </Group>
  )
}

export default EdgeText
