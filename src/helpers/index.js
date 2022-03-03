export const ACCURACY = 0.0001

export const getDistanceBetweenPoints = (p1, p2) => {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y)
}

export const getAngleBetweenPoints = (p1, p2) => {
  const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x)

  if (angle < 0) {
    return angle + Math.PI * 2
  }

  return angle
}

export const getLineLength = (l) => {
  return getDistanceBetweenPoints(l.p1, l.p2)
}

export const getRandomColor = () => {
  const h = 360 * Math.random()
  const s = 25 + 70 * Math.random()
  const l = 85 + 10 * Math.random()

  return `hsla(${h}, ${s}%, ${l}%, 0.5)`
}

export const isValuePositive = (value) => {
  if (1 / value === Infinity) {
    return true
  }

  if (1 / value === -Infinity) {
    return false
  }

  return Math.sign(value) > 0
}

export const arePointsEqual = (p1, p2) => {
  return Math.abs(p1.x - p2.x) < ACCURACY && Math.abs(p1.y - p2.y) < ACCURACY
}
