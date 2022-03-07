import React, { useState } from 'react'
import { ButtonGroup, Tooltip } from '@mui/material'
import { TimelineRounded, PanToolRounded } from '@mui/icons-material'

import { CURSOR_TOOL, METERS_IN_PIXEL } from './constants'

import { useLayoutPlanner } from '../../hooks/useLayoutPlanner'

import Canvas from '../Canvas'

import * as Styles from './styles'

const LayoutPlanner = () => {
  const {
    tmpEdge,
    nodes,
    edges,
    polygons,
    cursor,
    setCursorCoords,
    setCursorTool,
    beginGrabbing,
    endGrabbing,
    beginTmpEdge,
    endTmpEdge
  } = useLayoutPlanner()

  const [container, setContainer] = useState(null)

  const tools = [
    {
      tool: CURSOR_TOOL.DRAW_WALL,
      title: 'Draw wall',
      renderIcon: (color) => <TimelineRounded color={color} />
    },
    {
      tool: CURSOR_TOOL.MOVE,
      title: 'Move objects',
      renderIcon: (color) => <PanToolRounded color={color} />
    }
  ]

  const pixelsToMeters = (value) => {
    const meters = value * METERS_IN_PIXEL

    if (Number.isInteger(meters)) {
      return meters
    }

    return Math.round((meters + Number.EPSILON) * 100) / 100
  }

  return (
    <Styles.Container ref={setContainer}>
      {container && (
        <Canvas
          container={container}
          tmpEdge={tmpEdge}
          nodes={nodes}
          edges={edges}
          polygons={polygons}
          cursor={cursor}
          setCursorCoords={setCursorCoords}
          beginGrabbing={beginGrabbing}
          endGrabbing={endGrabbing}
          beginTmpEdge={beginTmpEdge}
          endTmpEdge={endTmpEdge}
          pixelsToMeters={pixelsToMeters}
        />
      )}
      <Styles.ToolsContainer>
        <ButtonGroup
          orientation="vertical"
          variant="outlined"
          sx={{ backgroundColor: 'white' }}>
          {tools.map(({ tool, title, renderIcon }) => {
            const active = cursor.tool === tool
            const color = active ? 'primary' : 'default'

            const onClick = () => {
              if (active) {
                return
              }

              setCursorTool(tool)
            }

            return (
              <Tooltip key={`tool-${tool}`} title={title} placement="right">
                <Styles.ToolButton
                  size="small"
                  variant="outlined"
                  disableElevation
                  onClick={onClick}>
                  {renderIcon(color)}
                </Styles.ToolButton>
              </Tooltip>
            )
          })}
        </ButtonGroup>
      </Styles.ToolsContainer>
    </Styles.Container>
  )
}

export default LayoutPlanner
