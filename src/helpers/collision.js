import pointInPolygon from 'robust-point-in-polygon'

import { ACCURACY, getDistanceBetweenPoints, getLineLength } from './'

export const circleCircleCollision = (c1, c2) => {
  const distance = getDistanceBetweenPoints(c1, c2)

  return distance < c1.r + c2.r
}

export const pointCircleCollision = (p, c) => {
  return circleCircleCollision({ ...p, r: 0 }, c)
}

export const linePointCollision = (l, p) => {
  const d1 = getDistanceBetweenPoints(p, l.p1)
  const d2 = getDistanceBetweenPoints(p, l.p2)
  const lineLen = getLineLength(l)

  return d1 + d2 >= lineLen - ACCURACY && d1 + d2 <= lineLen + ACCURACY
}

export const linePointProjectionPoint = (l, p) => {
  const x1 = l.p1.x
  const y1 = l.p1.y
  const x2 = l.p2.x
  const y2 = l.p2.y
  const cx = p.x
  const cy = p.y

  const len = getLineLength(l)
  const dot = ((cx - x1) * (x2 - x1) + (cy - y1) * (y2 - y1)) / (len * len)
  const projectionPoint = {
    x: x1 + dot * (x2 - x1),
    y: y1 + dot * (y2 - y1)
  }

  return projectionPoint
}

export const lineCircleCollision = (l, c) => {
  const r = c.r

  const inside1 = pointCircleCollision(l.p1, c)
  const inside2 = pointCircleCollision(l.p2, c)

  if (inside1 || inside2) {
    return true
  }

  const projectionPoint = linePointProjectionPoint(l, c)

  if (!linePointCollision(l, projectionPoint)) {
    return false
  }

  if (getDistanceBetweenPoints(projectionPoint, c) <= r) {
    return projectionPoint
  }

  return false
}

export const lineLineCollision = (l1, l2) => {
  const x1 = l1.p1.x
  const y1 = l1.p1.y
  const x2 = l1.p2.x
  const y2 = l1.p2.y

  const x3 = l2.p1.x
  const y3 = l2.p1.y
  const x4 = l2.p2.x
  const y4 = l2.p2.y

  const uA =
    ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) /
    ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
  const uB =
    ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) /
    ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))

  if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
    return {
      x: x1 + uA * (x2 - x1),
      y: y1 + uA * (y2 - y1)
    }
  }

  return false
}

const objPointToArray = (point) => {
  return [point.x, point.y]
}

export const isPointInsidePolygon = (point, polygonPoints) => {
  const polygonPointsArray = polygonPoints.map(objPointToArray)
  const result = pointInPolygon(polygonPointsArray, objPointToArray(point))

  return result === -1
}

export const isPolygonInsidePolygon = (polygonPoints1, polygonPoints2) => {
  return polygonPoints1.every((point) => {
    return isPointInsidePolygon(point, polygonPoints2)
  })
}
