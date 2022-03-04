import { getRandomColor } from '../../helpers'

export const STAGE_SCALE_STEP = 0.1

export const NODE_RADIUS = 8
export const NODE_COLOR = '#2196f3'
// export const NODE_COLOR = '#607d8b33'

export const EDGE_WIDTH = NODE_RADIUS * 2
export const HALF_EDGE_WIDTH = EDGE_WIDTH / 2
export const EDGE_COLOR = '#eceff1'
export const EDGE_BORDER_COLOR = '#b0bec5'

export const CURSOR_RADIUS = NODE_RADIUS * 2
export const CURSOR_COLOR = '#607d8b33'

export const POLYGON_COLORS = [...new Array(100)].map(() => {
  return getRandomColor()
})

export const FONT_CONFIG = {
  height: 3,
  fontSize: EDGE_WIDTH - 2,
  fontFamily: 'monospace',
  fill: '#000',
  align: 'center',
  verticalAlign: 'middle'
}

export const TMP_EDGE_COLOR_ALLOWED = '#aed581'
export const TMP_EDGE_COLOR_NOT_ALLOWED = '#ef9a9a'
