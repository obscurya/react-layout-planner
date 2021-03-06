import * as palette from '@mui/material/colors'

import { PIXELS_IN_METER } from '../LayoutPlanner/constants'

export const GRID_CELL_SIZE = PIXELS_IN_METER
export const GRID_CELL_COLOR = palette.blueGrey[100]
export const GRID_LINE_COLOR = palette.blueGrey[50]
export const GRID_LINES_IN_CELL_NUMBER = GRID_CELL_SIZE / 10
export const GRID_LINE_STEP = GRID_CELL_SIZE / GRID_LINES_IN_CELL_NUMBER

export const STAGE_INITIAL_SCALE = 1.5
export const STAGE_SCALE_STEP = 0.1

export const NODE_RADIUS = GRID_LINE_STEP / 2
export const NODE_COLOR = `${palette.blueGrey[200]}80`
export const HOVERED_NODE_COLOR = `${palette.blue[500]}80`

export const EDGE_WIDTH = GRID_LINE_STEP
export const HALF_EDGE_WIDTH = EDGE_WIDTH / 2
export const EDGE_COLOR = palette.blueGrey[50]
export const EDGE_BORDER_COLOR = palette.blueGrey[500]

export const EDGE_MEASUREMENT_LINE_END_SIZE =
  HALF_EDGE_WIDTH + HALF_EDGE_WIDTH / 2
export const EDGE_MEASUREMENT_LINE_SKEW_SIZE = HALF_EDGE_WIDTH / 2.5
export const EDGE_MEASUREMENT_LINE_COLOR = palette.blueGrey[300]

export const CURSOR_COLOR = `${palette.blueGrey[500]}33`

export const TMP_EDGE_COLOR_ALLOWED = palette.lightGreen[300]
export const TMP_EDGE_COLOR_NOT_ALLOWED = palette.red[200]

export const SHAPE_OPTIMIZATION_CONFIG = {
  perfectDrawEnabled: false,
  listening: false
}

export const FONT_SIZE = EDGE_WIDTH / 1.5
export const FONT_CONFIG = {
  fontSize: FONT_SIZE,
  height: FONT_SIZE / 1.7,
  fontFamily: 'Roboto',
  fill: palette.blueGrey[900],
  align: 'center',
  verticalAlign: 'bottom'
}

export const WALLS_PATTERN = {
  STEP: 5,
  COLOR: palette.blueGrey[100]
}
