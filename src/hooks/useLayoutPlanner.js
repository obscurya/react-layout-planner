// TODO: подписывать размеры стен
// TODO: подписывать площади помещений
// TODO: привязка вершин при перемещении

import { useState, useEffect, useMemo } from 'react'
import { getAreaTree } from 'planar-face-discovery'

import {
  CURSOR_TOOL,
  MIN_CORNER_ANGLE
} from '../components/LayoutPlanner/constants'
import { CURSOR_RADIUS, HALF_EDGE_WIDTH } from '../components/Canvas/constants'

import {
  isValuePositive,
  getDistanceBetweenPoints,
  arePointsEqual,
  getAngleBetweenPoints
} from '../helpers'

import {
  pointCircleCollision,
  lineCircleCollision,
  linePointCollision,
  lineLineCollision
} from '../helpers/collision'

const initialState = {
  cursor: {
    tool: CURSOR_TOOL.DRAW_WALL,
    x: 0,
    y: 0,
    r: CURSOR_RADIUS,
    nodeIndex: null,
    edgePoint: null
  },
  tmpEdge: { nodes: null, isAllowed: false },
  nodes: [],
  edges: [],
  shapedEdges: [],
  grabbedObject: null,
  polygons: []
}

export const useLayoutPlanner = () => {
  const [cursor, setCursor] = useState(initialState.cursor)
  const [tmpEdge, setTmpEdge] = useState(initialState.tmpEdge)
  const [nodes, setNodes] = useState(initialState.nodes)
  const [edges, setEdges] = useState(initialState.edges)
  const [shapedEdges, setShapedEdges] = useState(initialState.shapedEdges)
  const [grabbedObject, setGrabbedObject] = useState(initialState.grabbedObject)
  const [polygons, setPolygons] = useState(initialState.polygons)

  /* CURSOR FUNCTIONS */

  const getCursorCoords = () => {
    if (cursor.nodeIndex !== null) {
      if (cursor.nodeIndex === 'tmpNode') {
        const { x, y } = tmpEdge.nodes?.[0] || cursor

        return { x, y }
      }

      return nodes[cursor.nodeIndex]
    }

    const { x, y } = cursor.edgePoint || cursor

    return { x, y }
  }

  const setCursorCoords = (x, y) => {
    setCursor({ ...cursor, x, y })
  }

  const setCursorTool = (tool) => {
    setCursor({ ...cursor, tool })
  }

  const getHoveredObject = () => {
    if (cursor.tool !== CURSOR_TOOL.MOVE) {
      return null
    }

    if (cursor.nodeIndex !== null) {
      return {
        type: 'node',
        index: cursor.nodeIndex
      }
    }

    return null
  }

  const hoveredObject = getHoveredObject()

  const beginGrabbing = () => {
    setGrabbedObject(hoveredObject)
  }

  const endGrabbing = () => {
    setGrabbedObject(null)
  }

  /* EDGE FUNCTIONS */

  const getEdgeNodes = (edge) => {
    return edge.map((nodeIndex) => {
      if (typeof nodeIndex === 'number') {
        return nodes[nodeIndex]
      }

      return nodeIndex
    })
  }

  const getEdgeLength = (edge) => {
    const [n1, n2] = getEdgeNodes(edge)

    return getDistanceBetweenPoints(n1, n2)
  }

  const getEdgeAngle = (edge, reverse = false) => {
    const [n1, n2] = getEdgeNodes(edge)

    if (reverse) {
      return getAngleBetweenPoints(n2, n1)
    }

    return getAngleBetweenPoints(n1, n2)
  }

  const beginTmpEdge = () => {
    const node =
      cursor.nodeIndex === null ? getCursorCoords() : cursor.nodeIndex

    setTmpEdge({ ...tmpEdge, nodes: [node, node] })
  }

  // определить, какое новое ребро и новые вершины будут созданы
  // при добавлении временного ребра
  const getTmpEdgeData = () => {
    const [edgeToAdd, nodesToAdd] = tmpEdge.nodes.reduce(
      ([edgeToAdd, nodesToAdd], node) => {
        if (typeof node === 'number') {
          return [[...edgeToAdd, node], nodesToAdd]
        }

        const nodeIndex = nodes.length + nodesToAdd.length

        return [
          [...edgeToAdd, nodeIndex],
          [...nodesToAdd, node]
        ]
      },
      [[], []]
    )

    return { edgeToAdd, nodesToAdd }
  }

  // найти общую вершину у двух ребер
  const getEdgesCommonNodeIndex = (edge1, edge2) => {
    if (edge1.includes(edge2[0])) {
      return edge2[0]
    }

    if (edge1.includes(edge2[1])) {
      return edge2[1]
    }

    return null
  }

  // найти вершины из nodesToCheck, которые пересекаются с указанным ребром
  const getNodesIndexesCollidingWithEdge = (edge, nodesToCheck = nodes) => {
    const [p1, p2] = getEdgeNodes(edge)

    return nodesToCheck.reduce((collidingNodes, node, nodeIndex) => {
      if (linePointCollision({ p1, p2 }, node)) {
        return [...collidingNodes, nodeIndex]
      }

      return collidingNodes
    }, [])
  }

  const endTmpEdge = () => {
    if (!tmpEdge.isAllowed) {
      setTmpEdge(initialState.tmpEdge)
      return
    }

    const { edgeToAdd, nodesToAdd } = getTmpEdgeData()

    setTmpEdge(initialState.tmpEdge)

    if (!nodesToAdd.length) {
      setEdges([...edges, edgeToAdd])
      return
    }

    const newNodes = [...nodes, ...nodesToAdd]

    setNodes(newNodes)
    setEdges([
      ...edges.reduce((newEdges, edge) => {
        const [p1, p2] = getEdgeNodes(edge)
        const commonNodeIndex = getEdgesCommonNodeIndex(edge, edgeToAdd)

        if (commonNodeIndex !== null) {
          // у нового ребра есть общая вершина с текущим ребром
          const edgeToAddNodeIndex =
            edgeToAdd[0] === commonNodeIndex ? edgeToAdd[1] : edgeToAdd[0]
          const edgeToAddNode = newNodes[edgeToAddNodeIndex]

          if (linePointCollision({ p1, p2 }, edgeToAddNode)) {
            // другая вершина нового ребра лежит на текущем ребре
            const edgeNodeIndex =
              edge[0] === commonNodeIndex ? edge[1] : edge[0]

            return [...newEdges, [edgeNodeIndex, edgeToAddNodeIndex]]
          } else {
            return [...newEdges, edge]
          }
        }

        // общей вершины нет
        // проверяем, лежат ли новые вершины на текущем ребре,
        // для дальнейшего разбиения текущего ребра на несколько частей -
        // пополам или на две отдельные части

        const collidingNodesIndexes = getNodesIndexesCollidingWithEdge(
          edge,
          nodesToAdd
        )

        if (!collidingNodesIndexes.length) {
          // ни одна новая вершина не лежит на текущем ребре
          return [...newEdges, edge]
        }

        if (collidingNodesIndexes.length === 1) {
          // одна вершина нового ребра внутри существующего ребра
          const nodeIndex = nodes.length + collidingNodesIndexes[0]

          return [...newEdges, [edge[0], nodeIndex], [nodeIndex, edge[1]]]
        }

        // новое ребро полностью внутри существующего ребра
        const [d1, d2] = nodesToAdd.map((node) => {
          return getDistanceBetweenPoints(p1, node)
        })

        if (d1 < d2) {
          return [...newEdges, [edge[0], edgeToAdd[0]], [edge[1], edgeToAdd[1]]]
        }

        return [...newEdges, [edge[0], edgeToAdd[1]], [edge[1], edgeToAdd[0]]]
      }, []),
      edgeToAdd
    ])
  }

  const getPolygonNodes = (polygon) => {
    return polygon.reduce((nodes, edgeIndex) => {
      const edgeNodes = getEdgeNodes(edges[Math.abs(edgeIndex)])

      return [
        ...nodes,
        isValuePositive(edgeIndex) ? edgeNodes[0] : edgeNodes[1]
      ]
    }, [])
  }

  const getEdgeIndexByNodes = ([n1, n2]) => {
    let reversed = false

    const edgeIndex = edges.findIndex((edge) => {
      if (edge[0] === n1 && edge[1] === n2) {
        return true
      }

      if (edge[0] === n2 && edge[1] === n1) {
        reversed = true
        return true
      }

      return false
    })

    if (edgeIndex === -1) {
      return null
    }

    return reversed ? -edgeIndex : edgeIndex
  }

  const createPolygonsEffect = () => {
    if (!edges.length) {
      return
    }

    const minX = Math.min(...nodes.map(({ x }) => x))
    const minY = Math.min(...nodes.map(({ y }) => y))

    const addX = minX < 0 ? -minX : 0
    const addY = minY < 0 ? -minY : 0

    const polygonsTree = getAreaTree(
      nodes.map(({ x, y }) => [x + addX, y + addY]),
      edges
    )

    const getPolygon = (node) => {
      return node.children.reduce(
        (polygons, child) => {
          return [...polygons, ...getPolygon(child)]
        },
        node.polygon ? [node.polygon] : []
      )
    }

    const newPolygons = getPolygon(polygonsTree).map((polygon) => {
      return polygon.reduce((polygonEdges, nodeIndex, index) => {
        if (index === polygon.length - 1) {
          return polygonEdges
        }

        return [
          ...polygonEdges,
          getEdgeIndexByNodes([nodeIndex, polygon[index + 1]])
        ]
      }, [])
    })

    setPolygons(newPolygons)
  }

  useEffect(createPolygonsEffect, [nodes, edges])

  // привязка курсора к одной из вершин или к одному из ребер
  // P.S. события мышки на фигурах из konva - кусок говна
  const cursorBindingEffect = () => {
    const newCursor = {
      ...cursor,
      nodeIndex: null,
      edgePoint: null
    }
    const allNodes = tmpEdge.nodes ? [...nodes, tmpEdge.nodes[0]] : nodes
    const collidingNodeIndex = allNodes.findIndex((node, nodeIndex) => {
      if (
        grabbedObject?.type === 'node' &&
        grabbedObject?.index === nodeIndex
      ) {
        return false
      }

      return pointCircleCollision(node, newCursor)
    })

    if (collidingNodeIndex !== -1) {
      newCursor.nodeIndex =
        collidingNodeIndex === nodes.length ? 'tmpNode' : collidingNodeIndex
    } else {
      for (const edge of edges) {
        const [p1, p2] = getEdgeNodes(edge)
        const intersectionPoint = lineCircleCollision({ p1, p2 }, newCursor)

        if (intersectionPoint) {
          newCursor.edgePoint = intersectionPoint
          break
        }
      }
    }

    // TODO: облегчить сравнение
    if (JSON.stringify(cursor) !== JSON.stringify(newCursor)) {
      setCursor(newCursor)
    }
  }

  useEffect(cursorBindingEffect, [cursor, nodes, edges])

  // совпадают ли вершины ребра (находятся в одной точке)
  const areEdgeNodesEqual = (edge) => {
    const [n1, n2] = getEdgeNodes(edge)

    return n1.x === n2.x && n1.y === n2.y
  }

  // существует ли ребро с таким набором вершин
  const doesEdgeExist = (nodes) => {
    return !!edges.find(([n1, n2]) => {
      return nodes.includes(n1) && nodes.includes(n2)
    })
  }

  // найти точки ребер (и индексы ребер), которые пересекаются с заданным ребром
  const getEdgesPointsIntersectingWithEdge = (edge) => {
    const [p1, p2] = getEdgeNodes(edge)

    return edges.reduce((intersectionPoints, currentEdge, currentEdgeIndex) => {
      const [_p1, _p2] = getEdgeNodes(currentEdge)
      const intersectionPoint = lineLineCollision(
        { p1, p2 },
        { p1: _p1, p2: _p2 }
      )

      if (intersectionPoint) {
        return [
          ...intersectionPoints,
          { intersectionPoint, edgeIndex: currentEdgeIndex }
        ]
      }

      return intersectionPoints
    }, [])
  }

  // устанавливается вторая вершина для временного ребра
  // и определяется, может ли оно быть добавлено
  const setTmpEdgeEffect = () => {
    if (!tmpEdge.nodes) {
      return
    }

    const node =
      cursor.nodeIndex === null || cursor.nodeIndex === 'tmpNode'
        ? getCursorCoords()
        : cursor.nodeIndex
    const tmpEdgeNodes = [tmpEdge.nodes[0], node]

    if (tmpEdge.nodes[0] === 'tmpNode') {
      setTmpEdge({ nodes: null, isAllowed: false })
      return
    }

    let isAllowed = true

    if (areEdgeNodesEqual(tmpEdgeNodes)) {
      // у ребра одинаковые вершины
      isAllowed = false
    } else {
      const collidingNodesIndexes =
        getNodesIndexesCollidingWithEdge(tmpEdgeNodes)

      if (collidingNodesIndexes.length) {
        // проверяем пересечение нового ребра с существующими вершинами
        if (collidingNodesIndexes.length > 1) {
          if (doesEdgeExist(collidingNodesIndexes)) {
            // такое ребро уже существует
            // или новое ребро содержит в себе существующее
            isAllowed = false
          }
        } else {
          const [nodeIndex] = collidingNodesIndexes

          if (nodeIndex !== tmpEdgeNodes[0] && nodeIndex !== tmpEdgeNodes[1]) {
            // вершина не является одной из вершин нового ребра
            isAllowed = false
          }
        }
      }

      if (isAllowed) {
        // проверяем пересечение нового ребра с существующими ребрами
        const intersectionPoints =
          getEdgesPointsIntersectingWithEdge(tmpEdgeNodes)

        if (intersectionPoints.length) {
          const [n1, n2] = getEdgeNodes(tmpEdgeNodes)
          const notAllowedIntersection = !!intersectionPoints.filter(
            ({ intersectionPoint, edgeIndex }) => {
              const edge = edges[edgeIndex]
              const collidingNodesIndexes = getNodesIndexesCollidingWithEdge(
                edge,
                [n1, n2]
              )

              if (collidingNodesIndexes.length === 2) {
                // новое ребро лежит в существующем ребре
                return false
              }

              // равна ли точка пересечения одной из вершин нового ребра
              return (
                !arePointsEqual(intersectionPoint, n1) &&
                !arePointsEqual(intersectionPoint, n2)
              )
            }
          ).length

          if (notAllowedIntersection) {
            isAllowed = false
          }
        }
      }
    }

    setTmpEdge({ nodes: tmpEdgeNodes, isAllowed })
  }

  useEffect(setTmpEdgeEffect, [cursor])

  // найти соседние вершины для вершин указанного ребра
  const getEdgeNodesNeighborNodes = (edge) => {
    const [n1, n2] = edge

    return {
      [edge[0]]: edges
        .filter((edge) => {
          return edge.includes(n1) && !edge.includes(n2)
        })
        .map((edge) => {
          if (edge[0] === n1) {
            return edge[1]
          }

          return edge[0]
        }),
      [edge[1]]: edges
        .filter((edge) => {
          return edge.includes(n2) && !edge.includes(n1)
        })
        .map((edge) => {
          if (edge[0] === n2) {
            return edge[1]
          }

          return edge[0]
        })
    }
  }

  const createShapedEdgesEffect = () => {
    const shapedEdges = edges.map((edge) => {
      return Object.entries(getEdgeNodesNeighborNodes(edge)).reduce(
        (points, [nodeIndexStr, neighborNodes]) => {
          // TODO: добавить комментарии...

          const nodeIndex = Number(nodeIndexStr)
          const node = nodes[nodeIndex]
          const edgeAngle = getEdgeAngle(edge, nodeIndex !== edge[0])

          const cutCorner = () => {
            const angle1 = edgeAngle + Math.PI / 2
            const angle2 = edgeAngle - Math.PI / 2

            return [
              [
                {
                  x: node.x + HALF_EDGE_WIDTH * Math.cos(angle1),
                  y: node.y + HALF_EDGE_WIDTH * Math.sin(angle1)
                }
              ],
              [
                {
                  x: node.x + HALF_EDGE_WIDTH * Math.cos(angle2),
                  y: node.y + HALF_EDGE_WIDTH * Math.sin(angle2)
                }
              ]
            ]
          }

          if (!neighborNodes.length) {
            // у вершины нет соседних вершин, рубим край ребра
            return [...points, ...cutCorner()]
          }

          const getCornerPoints = (angleBetweenEdges, absolute = false) => {
            if (Math.abs(angleBetweenEdges) < MIN_CORNER_ANGLE) {
              return cutCorner()
            }

            const halfAngleBetweenEdges = angleBetweenEdges / 2
            const sinAngle = Math.sin(
              absolute ? Math.abs(halfAngleBetweenEdges) : halfAngleBetweenEdges
            )
            const distance = HALF_EDGE_WIDTH / sinAngle
            const pointAngle = edgeAngle - halfAngleBetweenEdges
            const oppositePointAngle = pointAngle + Math.PI

            return [
              {
                x: node.x + distance * Math.cos(oppositePointAngle),
                y: node.y + distance * Math.sin(oppositePointAngle)
              },
              {
                x: node.x + distance * Math.cos(pointAngle),
                y: node.y + distance * Math.sin(pointAngle)
              }
            ]
          }

          if (neighborNodes.length === 1) {
            const neighborEdgeAngle = getEdgeAngle([
              nodeIndex,
              neighborNodes[0]
            ])
            const cornerPoints = getCornerPoints(edgeAngle - neighborEdgeAngle)

            if (cornerPoints[0][0]) {
              return [...points, ...cornerPoints]
            }

            return [...points, cornerPoints]
          }

          const allAngles = neighborNodes.map((neighborNodeIndex) => {
            const neighborEdgeAngle = getEdgeAngle([
              nodeIndex,
              neighborNodeIndex
            ])

            return edgeAngle - neighborEdgeAngle
          })

          const positiveAngles = allAngles
            .filter((angle) => {
              return angle >= 0
            })
            .sort((a, b) => a - b)
          const [fpa] = positiveAngles
          const [lpa] =
            positiveAngles.length > 1 ? positiveAngles.slice(-1) : [null]

          const negativeAngles = allAngles
            .filter((angle) => {
              return angle < 0
            })
            .sort((a, b) => b - a)
          const [fna] = negativeAngles
          const [lna] =
            negativeAngles.length > 1 ? negativeAngles.slice(-1) : [null]

          const angles = [fpa || fna]

          if (angles[0] === fpa) {
            angles.unshift(fna || -(Math.PI * 2 - lpa))
          } else {
            angles.push(Math.PI * 2 + lna)
          }

          if (
            angles.filter((angle) => {
              return Math.abs(angle) < MIN_CORNER_ANGLE
            }).length
          ) {
            return [...points, ...cutCorner()]
          }

          const [p1, p2] = angles.map((angle) => {
            const cornerPoints = getCornerPoints(angle, true)

            return cornerPoints[1]
          })

          return [...points, [p1, node, p2]]
        },
        []
      )
    })

    setShapedEdges(shapedEdges)
  }

  useEffect(createShapedEdgesEffect, [nodes, edges])

  const moveGrabbedObjectEffect = () => {
    if (!grabbedObject) {
      return
    }

    if (grabbedObject.type === 'node') {
      if (
        hoveredObject?.type === 'node' &&
        hoveredObject?.index !== grabbedObject.index
      ) {
        return
      }

      const newNode = { x: cursor.x, y: cursor.y }

      if (arePointsEqual(nodes[grabbedObject.index], newNode)) {
        return
      }

      setNodes(
        nodes.map((node, nodeIndex) => {
          if (nodeIndex === grabbedObject.index) {
            return newNode
          }

          return node
        })
      )
    }
  }

  useEffect(moveGrabbedObjectEffect, [cursor, nodes, grabbedObject])

  const getEdgeData = (edge) => {
    return {
      nodes: getEdgeNodes(edge),
      length: getEdgeLength(edge),
      angle: getEdgeAngle(edge)
    }
  }

  const returnedTmpEdge = tmpEdge.nodes
    ? {
        ...getEdgeData(tmpEdge.nodes),
        isAllowed: tmpEdge.isAllowed
      }
    : null
  const returnedEdges = useMemo(() => {
    return edges.map((edge, edgeIndex) => {
      return {
        ...getEdgeData(edge),
        shape: shapedEdges[edgeIndex]
      }
    })
  }, [edges, shapedEdges])
  const returnedPolygons = useMemo(() => {
    return polygons.map((polygon) => {
      return getPolygonNodes(polygon)
    })
  }, [polygons])
  const returnedCursor = {
    coords: getCursorCoords(),
    tool: cursor.tool,
    hoveredObject,
    grabbedObject
  }

  return {
    tmpEdge: returnedTmpEdge,
    nodes,
    edges: returnedEdges,
    polygons: returnedPolygons,
    cursor: returnedCursor,
    setCursorCoords,
    setCursorTool,
    beginGrabbing,
    endGrabbing,
    beginTmpEdge,
    endTmpEdge
  }
}
