import React from 'react'

import { EdgeText } from './'

const EdgeMeasurement = (props) => {
  const { nodes, angle, length, pixelsToMeters, borders } = props

  // add borders sizes

  return (
    <EdgeText text={`${pixelsToMeters(length)}m`} nodes={nodes} angle={angle} />
  )
}

export default EdgeMeasurement
