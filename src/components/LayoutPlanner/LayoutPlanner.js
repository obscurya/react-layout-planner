import React, { useState } from 'react'
import { ButtonGroup, Tooltip } from '@mui/material'
import { TimelineRounded, PanToolRounded } from '@mui/icons-material'

import { CURSOR_TOOL } from './constants'

import { useLayoutPlanner } from '../../hooks/useLayoutPlanner'

import Canvas from '../Canvas'

import * as Styles from './styles'

const LayoutPlanner = () => {
  const {
    tmpEdge,
    nodes,
    edges,
    polygons,
    setCursorCoords,
    getCursorCoords,
    beginTmpEdge,
    endTmpEdge,
    isCursorBound,
    cursorTool,
    setCursorTool
  } = useLayoutPlanner()

  const [container, setContainer] = useState(null)

  const tools = [
    {
      tool: CURSOR_TOOL.DRAW_WALL,
      title: 'Draw wall',
      renderIcon: (color) => <TimelineRounded color={color} />
    }
    // {
    //   tool: CURSOR_TOOL.MOVE,
    //   title: 'Move objects',
    //   renderIcon: (color) => <PanToolRounded color={color} />
    // }
  ]

  return (
    <Styles.Container ref={setContainer}>
      {container && (
        <Canvas
          container={container}
          tmpEdge={tmpEdge}
          nodes={nodes}
          edges={edges}
          polygons={polygons}
          setCursorCoords={setCursorCoords}
          getCursorCoords={getCursorCoords}
          beginTmpEdge={beginTmpEdge}
          endTmpEdge={endTmpEdge}
          isCursorBound={isCursorBound}
          cursorTool={cursorTool}
        />
      )}
      <Styles.ToolsContainer>
        <ButtonGroup
          orientation="vertical"
          variant="outlined"
          sx={{ backgroundColor: 'white' }}>
          {tools.map(({ tool, title, renderIcon }) => {
            const active = cursorTool === tool
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
