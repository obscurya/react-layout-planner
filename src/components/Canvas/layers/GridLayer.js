import React, { useMemo, useEffect } from 'react'
import { Layer, Shape } from 'react-konva'

import {
  GRID_CELL_SIZE,
  GRID_LINES_IN_CELL_NUMBER,
  GRID_LINE_STEP,
  GRID_CELL_COLOR,
  GRID_LINE_COLOR,
  SHAPE_OPTIMIZATION_CONFIG
} from '../constants'

import { arePointsEqual } from '../../../helpers'

const GridLayer = (props) => {
  const {
    sizes: { width, height },
    coords,
    scale,
    stageCursorCoords,
    gridCursorCoords,
    setGridCursorCoords
  } = props

  const { start, verticalLinesNumber, horizontalLinesNumber } = useMemo(() => {
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

    const rowsNumber =
      Math.floor((width / scale - offset.x) / GRID_CELL_SIZE) + 1
    const verticalLinesNumber = rowsNumber * GRID_LINES_IN_CELL_NUMBER + 1

    const columnsNumber =
      Math.floor((height / scale - offset.y) / GRID_CELL_SIZE) + 1
    const horizontalLinesNumber = columnsNumber * GRID_LINES_IN_CELL_NUMBER + 1

    const start = {
      x: -coords.x / scale + offset.x,
      y: -coords.y / scale + offset.y
    }

    return { start, verticalLinesNumber, horizontalLinesNumber }
  }, [width, height, coords, scale])

  const grid = useMemo(() => {
    const endX = start.x + GRID_LINE_STEP * verticalLinesNumber
    const endY = start.y + GRID_LINE_STEP * horizontalLinesNumber

    const isDarkLine = (li) => {
      return li % GRID_LINES_IN_CELL_NUMBER === 0
    }

    const getPoints = (direction, li) => {
      if (direction === 0) {
        const x = start.x + GRID_LINE_STEP * li

        return [
          { x, y: start.y },
          { x, y: endY }
        ]
      }

      const y = start.y + GRID_LINE_STEP * li

      return [
        { x: start.x, y },
        { x: endX, y }
      ]
    }

    const linesGroups = [verticalLinesNumber, horizontalLinesNumber].reduce(
      (lines, linesNumber, direction) => {
        const newLines = [...new Array(linesNumber)].reduce(
          ([lightLines, darkLines], _, li) => {
            const linePoints = getPoints(direction, li)

            if (isDarkLine(li)) {
              return [lightLines, [...darkLines, linePoints]]
            }

            return [[...lightLines, linePoints], darkLines]
          },
          lines
        )

        return newLines
      },
      [[], []]
    )

    return linesGroups.map((linesGroup, i) => {
      const stroke = i ? GRID_CELL_COLOR : GRID_LINE_COLOR
      const key = i ? 'grid-dark-lines' : 'grid-light-lines'

      return (
        <Shape
          key={key}
          stroke={stroke}
          strokeWidth={1}
          sceneFunc={(c, shape) => {
            c.beginPath()

            linesGroup.forEach(([start, end]) => {
              c.moveTo(start.x, start.y)
              c.lineTo(end.x, end.y)
            })

            c.strokeShape(shape)
            c.closePath()
          }}
        />
      )
    })
  }, [start, verticalLinesNumber, horizontalLinesNumber])

  const bindCursorToGridEffect = () => {
    const coords = {
      x:
        start.x +
        Math.round(Math.abs(stageCursorCoords.x - start.x) / GRID_LINE_STEP) *
          GRID_LINE_STEP,
      y:
        start.y +
        Math.round(Math.abs(stageCursorCoords.y - start.y) / GRID_LINE_STEP) *
          GRID_LINE_STEP
    }

    if (arePointsEqual(coords, gridCursorCoords)) {
      return
    }

    setGridCursorCoords(coords)
  }

  useEffect(bindCursorToGridEffect, [
    stageCursorCoords,
    gridCursorCoords,
    start
  ])

  return <Layer {...SHAPE_OPTIMIZATION_CONFIG}>{grid}</Layer>
}

export default GridLayer
