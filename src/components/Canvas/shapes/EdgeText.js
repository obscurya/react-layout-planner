import React from 'react'

import { CustomText } from './'

const EdgeText = (props) => {
  const { text, nodes, angle, maxWidth } = props

  const [n1, n2] = nodes
  const position = {
    x: (n1.x + n2.x) / 2,
    y: (n1.y + n2.y) / 2
  }

  return (
    <CustomText
      text={text}
      position={position}
      angle={angle}
      maxWidth={maxWidth}
    />
  )
}

export default EdgeText
