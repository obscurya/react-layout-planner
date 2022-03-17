import { METERS_IN_PIXEL } from './constants'

export const pixelsToMeters = (value) => {
  const meters = value * METERS_IN_PIXEL

  if (Number.isInteger(meters)) {
    return meters
  }

  return Math.round((meters + Number.EPSILON) * 100) / 100
}

export const pixelsToSquareMeters = (value) => {
  const meters = value * METERS_IN_PIXEL ** 2

  if (Number.isInteger(meters)) {
    return meters
  }

  return Math.round((meters + Number.EPSILON) * 100) / 100
}
