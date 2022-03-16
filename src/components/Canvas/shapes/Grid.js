import React, { useMemo, useEffect } from 'react'
import { Layer, Line } from 'react-konva'

import {
  GRID_CELL_SIZE,
  GRID_LINES_IN_CELL_NUMBER,
  GRID_LINE_STEP,
  GRID_CELL_COLOR,
  GRID_LINE_COLOR,
  SHAPE_OPTIMIZATION_CONFIG
} from '../constants'

const Grid = (props) => {
  const {
    sizes: { width, height },
    coords,
    scale,
    bindCursorToGrid
  } = props

  const relativeCellSize = GRID_CELL_SIZE * scale

  const getCellPart = (axis) => {
    const cellPartX = (Math.abs(axis) / relativeCellSize) % 1

    if (axis > 0) {
      return 1 - cellPartX
    }

    return cellPartX
  }

  const offset = {
    x: -getCellPart(coords.x) * GRID_CELL_SIZE,
    y: -getCellPart(coords.y) * GRID_CELL_SIZE
  }

  const start = useMemo(() => {
    return {
      x: -coords.x / scale + offset.x,
      y: -coords.y / scale + offset.y
    }
  }, [coords, scale, offset])

  const lines = useMemo(() => {
    const rowsNumber =
      Math.floor((width / scale - offset.x) / GRID_CELL_SIZE) + 1
    const verticalLinesNumber = rowsNumber * GRID_LINES_IN_CELL_NUMBER + 1

    const columnsNumber =
      Math.floor((height / scale - offset.y) / GRID_CELL_SIZE) + 1
    const horizontalLinesNumber = columnsNumber * GRID_LINES_IN_CELL_NUMBER + 1

    const endX = start.x + GRID_LINE_STEP * verticalLinesNumber
    const endY = start.y + GRID_LINE_STEP * horizontalLinesNumber

    const isDarker = (li) => {
      return li % GRID_LINES_IN_CELL_NUMBER === 0
    }

    const getPoints = (direction, li) => {
      if (direction === 0) {
        const x = start.x + GRID_LINE_STEP * li

        return [x, start.y, x, endY]
      }

      const y = start.y + GRID_LINE_STEP * li

      return [start.x, y, endX, y]
    }

    const [lines, darkerLines] = [
      verticalLinesNumber,
      horizontalLinesNumber
    ].reduce(
      (allLines, linesNumber, direction) => {
        return [...new Array(linesNumber)].reduce(
          ([lines, darkerLines], _, li) => {
            const isLineDarker = isDarker(li)
            const stroke = isLineDarker ? GRID_CELL_COLOR : GRID_LINE_COLOR
            const line = (
              <Line
                key={`grid-line-${direction}-${li}`}
                points={getPoints(direction, li)}
                stroke={stroke}
                strokeWidth={1}
                {...SHAPE_OPTIMIZATION_CONFIG}
              />
            )

            if (isLineDarker) {
              return [lines, [...darkerLines, line]]
            }

            return [[...lines, line], darkerLines]
          },
          allLines
        )
      },
      [[], []]
    )

    return [...lines, ...darkerLines]
  }, [width, height, coords, scale])

  const bindCursorToGridEffect = () => {
    bindCursorToGrid(({ x, y }) => {
      return {
        x:
          start.x +
          Math.round(Math.abs(x - start.x) / GRID_LINE_STEP) * GRID_LINE_STEP,
        y:
          start.y +
          Math.round(Math.abs(y - start.y) / GRID_LINE_STEP) * GRID_LINE_STEP
      }
    })
  }

  useEffect(bindCursorToGridEffect, [coords, scale, offset])

  return <Layer listening={false}>{lines}</Layer>
}

export default Grid
