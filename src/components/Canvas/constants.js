import * as palette from '@mui/material/colors'

import { PIXELS_IN_METER } from '../LayoutPlanner/constants'

import { getRandomColor } from '../../helpers'

export const GRID_CELL_SIZE = PIXELS_IN_METER
export const GRID_CELL_COLOR = palette.blueGrey[100]
export const GRID_LINE_COLOR = palette.blueGrey[50]
export const GRID_LINES_IN_CELL_NUMBER = GRID_CELL_SIZE / 10
export const GRID_LINE_STEP = GRID_CELL_SIZE / GRID_LINES_IN_CELL_NUMBER

export const STAGE_SCALE_STEP = 0.1

export const NODE_RADIUS = GRID_LINES_IN_CELL_NUMBER
export const NODE_COLOR = palette.blueGrey[200]
export const HOVERED_NODE_COLOR = palette.blue[500]

export const EDGE_WIDTH = NODE_RADIUS * 2
export const HALF_EDGE_WIDTH = EDGE_WIDTH / 2
export const EDGE_COLOR = palette.blueGrey[50]
export const EDGE_BORDER_COLOR = palette.blueGrey[200]

export const CURSOR_RADIUS = NODE_RADIUS * 2
export const CURSOR_COLOR = `${palette.blueGrey[500]}33`

export const POLYGON_COLORS = [...new Array(100)].map(() => {
  return getRandomColor()
})

export const FONT_CONFIG = {
  height: 3,
  fontSize: EDGE_WIDTH - 2,
  fontFamily: 'monospace',
  fill: palette.grey[900],
  align: 'center',
  verticalAlign: 'middle'
}

export const TMP_EDGE_COLOR_ALLOWED = palette.lightGreen[300]
export const TMP_EDGE_COLOR_NOT_ALLOWED = palette.red[200]
