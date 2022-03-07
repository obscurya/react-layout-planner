// TODO: привязка курсора к сетке

import React, { useMemo } from 'react'
import { Layer, Line } from 'react-konva'

import {
  GRID_CELL_SIZE,
  GRID_LINES_IN_CELL_NUMBER,
  GRID_LINE_STEP,
  GRID_CELL_COLOR,
  GRID_LINE_COLOR
} from '../constants'

const Grid = (props) => {
  const {
    sizes: { width, height },
    coords,
    scale
  } = props

  const relativeCellSize = GRID_CELL_SIZE * scale

  const getCellPart = (axis) => {
    const cellPartX = (Math.abs(axis) / relativeCellSize) % 1

    if (axis > 0) {
      return 1 - cellPartX
    }

    return cellPartX
  }

  const offsetX = -getCellPart(coords.x) * GRID_CELL_SIZE
  const offsetY = -getCellPart(coords.y) * GRID_CELL_SIZE

  const startX = -coords.x / scale + offsetX
  const startY = -coords.y / scale + offsetY

  const createLines = () => {
    const rowsNumber =
      Math.floor((width / scale - offsetX) / GRID_CELL_SIZE) + 1
    const verticalLinesNumber = rowsNumber * GRID_LINES_IN_CELL_NUMBER + 1

    const columnsNumber =
      Math.floor((height / scale - offsetY) / GRID_CELL_SIZE) + 1
    const horizontalLinesNumber = columnsNumber * GRID_LINES_IN_CELL_NUMBER + 1

    const endX = startX + GRID_LINE_STEP * verticalLinesNumber
    const endY = startY + GRID_LINE_STEP * horizontalLinesNumber

    const isDarker = (li) => {
      return li % GRID_LINES_IN_CELL_NUMBER === 0
    }

    const getPoints = (direction, li) => {
      if (direction === 0) {
        const x = startX + GRID_LINE_STEP * li

        return [x, startY, x, endY]
      }

      const y = startY + GRID_LINE_STEP * li

      return [startX, y, endX, y]
    }

    const [lines, darkerLines] = [
      verticalLinesNumber,
      horizontalLinesNumber
    ].reduce(
      ([lines, darkerLines], linesNumber, direction) => {
        return [...new Array(linesNumber)].reduce(
          ([lines, darkerLines], _, li) => {
            const key = `grid-line-${direction}-${li}`
            const points = getPoints(direction, li)

            if (isDarker(li)) {
              return [
                lines,
                [
                  ...darkerLines,
                  <Line
                    key={key}
                    points={points}
                    stroke={GRID_CELL_COLOR}
                    strokeWidth={1}
                  />
                ]
              ]
            }

            return [
              [
                ...lines,
                <Line
                  key={key}
                  points={points}
                  stroke={GRID_LINE_COLOR}
                  strokeWidth={1}
                />
              ],
              darkerLines
            ]
          },
          [lines, darkerLines]
        )
      },
      [[], []]
    )

    return [...lines, ...darkerLines]
  }

  const lines = useMemo(() => {
    return createLines()
  }, [width, height, coords, scale])

  return <Layer>{lines}</Layer>
}

export default Grid
