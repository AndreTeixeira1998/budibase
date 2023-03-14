import { derived, get } from "svelte/store"

export const createMaxScrollStores = context => {
  const {
    rows,
    visibleColumns,
    stickyColumn,
    bounds,
    cellHeight,
    scroll,
    selectedCellRow,
    selectedCellId,
  } = context
  const padding = 255

  // Memoize store primitives
  const scrollTop = derived(scroll, $scroll => $scroll.top, 0)
  const scrollLeft = derived(scroll, $scroll => $scroll.left, 0)

  // Derive vertical limits
  const height = derived(bounds, $bounds => $bounds.height, 0)
  const width = derived(bounds, $bounds => $bounds.width, 0)
  const contentHeight = derived(
    rows,
    $rows => $rows.length * cellHeight + padding,
    0
  )
  const maxScrollTop = derived(
    [height, contentHeight],
    ([$height, $contentHeight]) => Math.max($contentHeight - $height, 0),
    0
  )

  // Derive horizontal limits
  const contentWidth = derived(
    [visibleColumns, stickyColumn],
    ([$visibleColumns, $stickyColumn]) => {
      let width = 40 + padding + ($stickyColumn?.width || 0)
      $visibleColumns.forEach(col => {
        width += col.width
      })
      return width
    },
    0
  )
  const screenWidth = derived(
    [width, stickyColumn],
    ([$width, $stickyColumn]) => $width + 40 + ($stickyColumn?.width || 0),
    0
  )
  const maxScrollLeft = derived(
    [contentWidth, screenWidth],
    ([$contentWidth, $screenWidth]) => {
      return Math.max($contentWidth - $screenWidth, 0)
    },
    0
  )

  // Ensure scroll state never goes invalid, which can happen when changing
  // rows or tables
  const overscrollTop = derived(
    [scrollTop, maxScrollTop],
    ([$scrollTop, $maxScrollTop]) => $scrollTop > $maxScrollTop,
    false
  )
  const overscrollLeft = derived(
    [scrollLeft, maxScrollLeft],
    ([$scrollLeft, $maxScrollLeft]) => $scrollLeft > $maxScrollLeft,
    false
  )
  overscrollTop.subscribe(overscroll => {
    if (overscroll) {
      scroll.update(state => ({
        ...state,
        top: get(maxScrollTop),
      }))
    }
  })
  overscrollLeft.subscribe(overscroll => {
    if (overscroll) {
      scroll.update(state => ({
        ...state,
        left: get(maxScrollLeft),
      }))
    }
  })

  // Ensure the selected cell is visible
  selectedCellRow.subscribe(row => {
    if (!row) {
      return
    }
    const $scroll = get(scroll)
    const $bounds = get(bounds)
    const scrollBarOffset = 16

    // Ensure row is not below bottom of screen
    const rowYPos = row.__idx * cellHeight
    const bottomCutoff =
      $scroll.top + $bounds.height - cellHeight - scrollBarOffset
    let delta = rowYPos - bottomCutoff
    if (delta > 0) {
      scroll.update(state => ({
        ...state,
        top: state.top + delta,
      }))
    }

    // Ensure row is not above top of screen
    else {
      delta = $scroll.top - rowYPos
      if (delta > 0) {
        scroll.update(state => ({
          ...state,
          top: Math.max(0, state.top - delta),
        }))
      }
    }

    // Check horizontal position of columns next
    const $selectedCellId = get(selectedCellId)
    const $visibleColumns = get(visibleColumns)
    const columnName = $selectedCellId?.split("-")[1]
    const column = $visibleColumns.find(col => col.name === columnName)
    if (!column) {
      return
    }

    // Ensure column is not cutoff on left edge
    delta = $scroll.left - column.left
    if (delta > 0) {
      scroll.update(state => ({
        ...state,
        left: state.left - delta,
      }))
    }

    // Ensure column is not cutoff on right edge
    else {
      const rightEdge = column.left + column.width
      const rightBound = $bounds.width + $scroll.left
      delta = rightEdge - rightBound
      if (delta > 0) {
        scroll.update(state => ({
          ...state,
          left: state.left + delta + scrollBarOffset,
        }))
      }
    }
  })

  return {
    contentHeight,
    contentWidth,
    maxScrollTop,
    maxScrollLeft,
  }
}