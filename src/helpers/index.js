import polylabel from 'polylabel'

export const ACCURACY = 0.0001

export const getDistanceBetweenPoints = (p1, p2) => {
  const dx = p1.x - p2.x
  const dy = p1.y - p2.y

  return Math.sqrt(dx ** 2 + dy ** 2)
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
  const [h, s, l] = [
    360 * Math.random(),
    25 + 70 * Math.random(),
    85 + 10 * Math.random()
  ].map((value) => {
    return Math.floor(value)
  })

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

export const areValuesEqual = (value1, value2) => {
  return Math.abs(value1 - value2) < ACCURACY
}

export const arePointsEqual = (p1, p2) => {
  return areValuesEqual(p1.x, p2.x) && areValuesEqual(p1.y, p2.y)
}

export const movePointDistanceAngle = (point, distance, angle) => {
  return {
    x: point.x + distance * Math.cos(angle),
    y: point.y + distance * Math.sin(angle)
  }
}

export const getPolygonArea = (polygonPoints) => {
  const [sums, diffs] = polygonPoints.reduce(
    ([sums, diffs], p1, i) => {
      const p2 = polygonPoints[i + 1] || polygonPoints[0]

      return [sums + p1.x * p2.y, diffs - p1.y * p2.x]
    },
    [0, 0]
  )

  return Math.abs(sums + diffs) / 2
}

export const objPointsToArray = (points) => {
  return points.map(({ x, y }) => [x, y])
}

export const transformPointsToGeoJSON = (
  polygonPoints,
  innerPolygonsPoints
) => {
  return [
    objPointsToArray(polygonPoints),
    ...innerPolygonsPoints.map((polygonPoints) =>
      objPointsToArray(polygonPoints)
    )
  ]
}

export const getPolygonCenter = (polygonPoints, innerPolygonsPoints = []) => {
  const [x, y] = polylabel(
    transformPointsToGeoJSON(polygonPoints, innerPolygonsPoints)
  )

  return { x, y }
}

export const compareArrays = (arr1, arr2) => {
  const [arrString1, arrString2] = [arr1, arr2].map((arr) => {
    return [...arr].sort((a, b) => a - b).join('_')
  })

  return arrString1 === arrString2
}

export const getCentroid = (points) => {
  const [sumX, sumY] = points.reduce(
    ([sumX, sumY], point) => {
      return [sumX + point.x, sumY + point.y]
    },
    [0, 0]
  )

  return {
    x: sumX / points.length,
    y: sumY / points.length
  }
}
