// TODO: привязка вершин при перемещении
// TODO: разобраться с deps при мемоизации
// TODO: проверить, что все мемоизируется правильно
// TODO: возвращать edges -> walls, polygons -> rooms
// TODO: вычислять все, что нужно для рисования в хуке (вынести логику из shapes)
// TODO: метаданные о помещениях (учесть добавление стен)
// TODO: попробовать прогонять точки из shapedEdges через getAreaTree для вычисления площадей помещений

import { useState, useEffect, useMemo } from 'react'
import { getAreaTree } from 'planar-face-discovery'
import { useDeepCompareMemo } from 'use-deep-compare'

import { CURSOR_TOOL } from '../components/LayoutPlanner/constants'
import { EDGE_WIDTH, HALF_EDGE_WIDTH } from '../components/Canvas/constants'

import {
  isValuePositive,
  getDistanceBetweenPoints,
  arePointsEqual,
  getAngleBetweenPoints,
  areValuesEqual,
  movePointDistanceAngle,
  compareArrays,
  getPolygonCenter,
  getPolygonArea,
  getRandomColor
} from '../helpers'

import {
  linePointCollision,
  lineLineCollision,
  linePointProjectionPoint
} from '../helpers/collision'

const getRandomWallWidth = () => {
  // const widths = [...new Array(5)].map((_, i) => {
  //   return HALF_EDGE_WIDTH * (i + 1)
  // })
  const widths = [EDGE_WIDTH]

  return widths[Math.floor(Math.random() * widths.length)]
}

const RIGHT_ANGLES = [Math.PI / 2, -Math.PI / 2] // прямые углы

const initialState = {
  cursor: {
    tool: CURSOR_TOOL.DRAW_WALL,
    x: 0,
    y: 0
  },
  cursorBinding: {
    nodeIndex: null,
    edgePoint: null
  },
  tmpEdge: { nodes: null, isAllowed: false },
  nodes: [],
  edges: [],
  shapedEdges: [],
  grabbedObject: null,
  polygons: [],
  walls: [],
  rooms: []
}

export const useLayoutPlanner = () => {
  const [cursor, setCursor] = useState(initialState.cursor)
  const [cursorBinding, setCursorBinding] = useState(initialState.cursorBinding)
  const [tmpEdge, setTmpEdge] = useState(initialState.tmpEdge)
  const [nodes, setNodes] = useState(initialState.nodes)
  const [edges, setEdges] = useState(initialState.edges)
  const [shapedEdges, setShapedEdges] = useState(initialState.shapedEdges)
  const [grabbedObject, setGrabbedObject] = useState(initialState.grabbedObject)
  const [polygons, setPolygons] = useState(initialState.polygons)
  const [walls, setWalls] = useState(initialState.walls)
  const [rooms, setRooms] = useState(initialState.rooms)

  /* CURSOR FUNCTIONS */

  const getCursorCoords = () => {
    if (cursorBinding.nodeIndex !== null) {
      if (cursorBinding.nodeIndex === 'tmpNode') {
        const { x, y } = tmpEdge.nodes?.[0] || cursor

        return { x, y }
      }

      return nodes[cursorBinding.nodeIndex]
    }

    const { x, y } = cursorBinding.edgePoint || cursor

    return { x, y }
  }

  const cursorCoords = getCursorCoords()

  const setCursorCoords = (x, y) => {
    setCursor({ ...cursor, x, y })
  }

  const setCursorTool = (tool) => {
    setCursor({ ...cursor, tool })
  }

  const bindCursorToNode = (nodeIndex) => {
    if (nodeIndex === cursorBinding.nodeIndex) {
      return
    }

    setCursorBinding({ nodeIndex, edgePoint: null })
  }

  const unbindCursorFromNode = () => {
    setCursorBinding({ nodeIndex: null, edgePoint: null })
  }

  const getHoveredObject = () => {
    if (cursor.tool !== CURSOR_TOOL.MOVE) {
      return null
    }

    if (cursorBinding.nodeIndex !== null) {
      return {
        type: 'node',
        index: cursorBinding.nodeIndex
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

  const bindCursorToEdge = (edgeIndex) => {
    const [p1, p2] = getEdgeNodes(edges[edgeIndex])
    const projectionPoint = linePointProjectionPoint({ p1, p2 }, cursor)
    const nodeIndex = nodes.findIndex((node) => {
      return arePointsEqual(node, projectionPoint)
    })

    if (nodeIndex !== -1) {
      bindCursorToNode(nodeIndex)
      return
    }

    if (
      cursorBinding.edgePoint &&
      arePointsEqual(cursorBinding.edgePoint, projectionPoint)
    ) {
      return
    }

    setCursorBinding({
      nodeIndex: null,
      edgePoint: projectionPoint
    })
  }

  const unbindCursorFromEdge = () => {
    setCursorBinding({ nodeIndex: null, edgePoint: null })
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
      cursorBinding.nodeIndex === null ? cursorCoords : cursorBinding.nodeIndex

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

      if (cursorBinding.nodeIndex === 'tmpNode') {
        unbindCursorFromNode()
      }

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

    const polygons = getPolygon(polygonsTree).map((polygon) => {
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

    setPolygons(polygons)
  }

  useEffect(createPolygonsEffect, [nodes, edges])

  const getRoomByPolygon = (polygon) => {
    const polygonEdges = polygon.map((edgeIndex) => {
      return Math.abs(edgeIndex)
    })

    return rooms.find((room) => {
      const roomEdges = room.edges.map((edgeIndex) => {
        return Math.abs(edgeIndex)
      })

      return compareArrays(polygonEdges, roomEdges)
    })
  }

  const setRoomsEffect = () => {
    const rooms = polygons.map((polygon) => {
      const nodes = getPolygonNodes(polygon)
      const center = getPolygonCenter(nodes)
      const area = getPolygonArea(nodes)
      const room = getRoomByPolygon(polygon)

      if (room) {
        return { ...room, nodes, center, area }
      }

      const color = getRandomColor()

      return { edges: polygon, nodes, center, area, color }
    })

    setRooms(rooms)
  }

  useEffect(setRoomsEffect, [polygons])

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
      cursorBinding.nodeIndex === null || cursorBinding.nodeIndex === 'tmpNode'
        ? cursorCoords
        : cursorBinding.nodeIndex
    const tmpEdgeNodes = [tmpEdge.nodes[0], node]

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

  const createShapedEdge = (edge) => {
    const wall = getWallByEdge(edge)
    const halfEdgeWidth = wall ? wall.width / 2 : HALF_EDGE_WIDTH

    return Object.entries(getEdgeNodesNeighborNodes(edge)).reduce(
      (points, [nodeIndexStr, neighborNodes]) => {
        const nodeIndex = Number(nodeIndexStr)
        const node = nodes[nodeIndex]
        const edgeAngle = getEdgeAngle(edge, nodeIndex !== edge[0]) // угол самого ребра

        const getRightAnglePoint = (rightAngle) => {
          return movePointDistanceAngle(
            node,
            halfEdgeWidth,
            edgeAngle + rightAngle
          )
        }

        // добавляет точки под прямыми углами по часовой и против часовой
        // (+Math.PI / 2, -Math.PI / 2)
        // если вершина не связана с другими ребрами
        // или не выполняются условия (маленький угол)
        const cutCorner = () => {
          return [
            ...points,
            ...RIGHT_ANGLES.map((rightAngle) => {
              return [getRightAnglePoint(rightAngle)]
            })
          ]
        }

        if (!neighborNodes.length) {
          // у вершины нет соседних вершин, рубим край ребра
          return cutCorner()
        }

        // соседние ребра
        const neighborEdges = neighborNodes.map((neighborNodeIndex) => {
          return [nodeIndex, neighborNodeIndex]
        })

        // углы соседних ребер (или направления соседних ребер)
        const neighborAngles = neighborEdges.map((neighborEdge) => {
          return getEdgeAngle(neighborEdge)
        })

        // углы между текущим ребром и соседними ребрами
        const edgeAnglesBetweenNeighbors = neighborAngles.map(
          (neighborAngle, neighborIndex) => {
            return { neighborIndex, angle: edgeAngle - neighborAngle }
          }
        )

        // определяем два угла между ребром
        // и ближайшими соседними ребрами
        // (по часовой и против часовой)
        const getCornerAngles = () => {
          // углы по часовой стрелке
          const clockwiseAngles = edgeAnglesBetweenNeighbors
            .filter(({ angle }) => {
              return angle >= 0
            })
            .sort((a, b) => a.angle - b.angle)
          // углы против часовой стрелки
          const counterClockwiseAngles = edgeAnglesBetweenNeighbors
            .filter(({ angle }) => {
              return angle < 0
            })
            .sort((a, b) => b.angle - a.angle)
          const [lastClockwiseAngle] = clockwiseAngles.slice(-1)
          const [lastCounterClockwiseAngle] = counterClockwiseAngles.slice(-1)
          const minClockwiseAngle = clockwiseAngles[0] || {
            ...lastCounterClockwiseAngle,
            angle: lastCounterClockwiseAngle.angle + Math.PI * 2
          }
          const maxCounterClockwiseAngle = counterClockwiseAngles[0] || {
            ...lastClockwiseAngle,
            angle: lastClockwiseAngle.angle - Math.PI * 2
          }
          const angles = [minClockwiseAngle, maxCounterClockwiseAngle]

          return angles.sort((a, b) => a.angle - b.angle)
        }

        const cornerAngles = getCornerAngles()

        // определяем угловую точку для построения границы
        const getCornerPoint = ({ neighborIndex, angle }, cornerIndex) => {
          const _angle = angle >= 0 ? Math.PI - angle : angle - Math.PI
          const sinAngle = Math.sin(_angle)

          if (areValuesEqual(Math.abs(sinAngle), 0)) {
            const rightAngle = RIGHT_ANGLES[cornerIndex]

            return getRightAnglePoint(rightAngle)
          }

          const neighborWall = getWallByEdge(neighborEdges[neighborIndex])
          const neighborHalfEdgeWidth = neighborWall
            ? neighborWall.width / 2
            : HALF_EDGE_WIDTH

          return [
            [neighborHalfEdgeWidth, edgeAngle],
            [halfEdgeWidth, neighborAngles[neighborIndex]]
          ].reduce((point, [halfEdgeWidth, angle]) => {
            const distance = halfEdgeWidth / sinAngle

            return movePointDistanceAngle(point, distance, angle)
          }, node)
        }

        // формируем угловые точки, описывающие границу
        const cornerPoints = cornerAngles.map((cornerAngle, cornerIndex) => {
          return getCornerPoint(cornerAngle, cornerIndex)
        })

        const doesBigCornerExist =
          cornerPoints.filter((cornerPoint) => {
            const edgesLengths = [edge, ...neighborEdges].map((edge) => {
              return getEdgeLength(edge)
            })
            const cornerLength = getDistanceBetweenPoints(node, cornerPoint)
            const isCornerBiggerThanAnyEdge =
              edgesLengths.filter((edgeLength) => {
                return cornerLength > edgeLength
              }).length > 0

            return isCornerBiggerThanAnyEdge
          }).length > 0

        if (doesBigCornerExist) {
          return cutCorner()
        }

        const [p1, p2] = cornerPoints

        return [...points, [p1, node, p2]]
      },
      []
    )
  }

  const createShapedEdgesEffect = () => {
    const shapedEdges = edges.map((edge) => {
      return createShapedEdge(edge)
    })

    setShapedEdges(shapedEdges)
  }

  useEffect(createShapedEdgesEffect, [nodes, walls])

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

      const newNodes = nodes.map((node, nodeIndex) => {
        if (nodeIndex === grabbedObject.index) {
          return newNode
        }

        return node
      })

      setNodes(newNodes)
    }
  }

  useEffect(moveGrabbedObjectEffect, [cursor, nodes, grabbedObject])

  const getWallByEdge = (edge) => {
    return walls.find((wall) => {
      return compareArrays(edge, wall.nodes)
    })
  }

  const setWallsEffect = () => {
    const walls = edges.map((edge) => {
      const wall = getWallByEdge(edge)

      return (
        wall || {
          nodes: edge,
          width: getRandomWallWidth()
        }
      )
    })

    setWalls(walls)
  }

  useEffect(setWallsEffect, [edges])

  const getEdgeData = (edge) => {
    const wall = getWallByEdge(edge)

    return {
      nodes: getEdgeNodes(edge),
      length: getEdgeLength(edge),
      angle: getEdgeAngle(edge),
      width: wall?.width || EDGE_WIDTH
    }
  }

  /* RETURNED VALUES */

  const returnedTmpEdge = tmpEdge.nodes
    ? {
        ...getEdgeData(tmpEdge.nodes),
        isAllowed: tmpEdge.isAllowed
      }
    : null
  const returnedEdges = useMemo(() => {
    return edges
      .map((edge, edgeIndex) => {
        const shape = shapedEdges[edgeIndex]

        if (!shape) {
          return null
        }

        const getPoints = () => {
          return shape.reduce((points, pointsGroup) => {
            return [...points, ...pointsGroup]
          }, [])
        }

        const getBorders = () => {
          return shape.map((pointsGroup, groupIndex) => {
            return [
              pointsGroup.slice(-1)[0],
              (shape[groupIndex + 1] || shape[0])[0]
            ]
          })
        }

        return {
          points: getPoints(),
          borders: getBorders()
        }
      })
      .filter(Boolean)
  }, [shapedEdges])
  const returnedPolygons = useMemo(() => {
    return polygons.map((polygon) => {
      const room = getRoomByPolygon(polygon) || {}

      return room
    })
  }, [rooms])
  const returnedCursor = useDeepCompareMemo(() => {
    return {
      coords: cursorCoords,
      tool: cursor.tool,
      hoveredObject,
      grabbedObject
    }
  }, [cursorCoords, cursor.tool, hoveredObject, grabbedObject])

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
    endTmpEdge,
    bindCursorToNode,
    unbindCursorFromNode,
    bindCursorToEdge,
    unbindCursorFromEdge
  }
}
