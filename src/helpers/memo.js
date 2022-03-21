import React from 'react'
import { dequal } from 'dequal'

const propsAreEqual = (prevProps, nextProps) => {
  return dequal(prevProps, nextProps)
}

export const memoizeComponent = (component) => {
  return React.memo(component, propsAreEqual)
}
