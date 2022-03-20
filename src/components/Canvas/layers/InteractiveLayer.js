import React from 'react'
import { Layer } from 'react-konva'
import { useDeepCompareCallback } from 'use-deep-compare'

import { CURSOR_TOOL } from '../../LayoutPlanner/constants'
import { NODE_COLOR, HOVERED_NODE_COLOR } from '../constants'

import { Node, Wall } from '../interactive-shapes'

const InteractiveLayer = (props) => {
  const {
    cursor,
    nodes,
    edges,
    bindCursorToNode,
    unbindCursorFromNode,
    bindCursorToEdge,
    unbindCursorFromEdge
  } = props

  const getNodeFill = useDeepCompareCallback(
    (nodeIndex) => {
      if (cursor.tool !== CURSOR_TOOL.MOVE) {
        return 'transparent'
      }

      const isNodeHovered = () => {
        if (cursor.grabbedObject) {
          return (
            cursor.grabbedObject.type === 'node' &&
            cursor.grabbedObject.index === nodeIndex
          )
        }

        if (cursor.hoveredObject) {
          return (
            cursor.hoveredObject.type === 'node' &&
            cursor.hoveredObject.index === nodeIndex
          )
        }

        return false
      }

      const isHovered = isNodeHovered()

      if (isHovered) {
        return HOVERED_NODE_COLOR
      }

      return NODE_COLOR
    },
    [cursor.tool, cursor.grabbedObject, cursor.hoveredObject]
  )

  return (
    <Layer>
      {edges.map(({ points }, edgeIndex) => {
        return (
          <Wall
            key={`wall-${edgeIndex}`}
            index={edgeIndex}
            points={points}
            bindCursorToEdge={bindCursorToEdge}
            unbindCursorFromEdge={unbindCursorFromEdge}
          />
        )
      })}
      {nodes.map((node, nodeIndex) => {
        return (
          <Node
            key={`node-${nodeIndex}`}
            index={nodeIndex}
            node={node}
            fill={getNodeFill(nodeIndex)}
            bindCursorToNode={bindCursorToNode}
            unbindCursorFromNode={unbindCursorFromNode}
          />
        )
      })}
    </Layer>
  )
}

export default InteractiveLayer
