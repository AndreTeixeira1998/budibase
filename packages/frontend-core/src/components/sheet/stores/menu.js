import { writable, get } from "svelte/store"

export const createMenuStores = context => {
  const { bounds, selectedCellId, stickyColumn, cellHeight } = context
  const menu = writable({
    x: 0,
    y: 0,
    visible: false,
    selectedRow: null,
  })

  const open = (cellId, e) => {
    const $bounds = get(bounds)
    const $stickyColumn = get(stickyColumn)
    e.preventDefault()
    selectedCellId.set(cellId)
    menu.set({
      left: e.clientX - $bounds.left + 44 + ($stickyColumn?.width || 0),
      top: e.clientY - $bounds.top + cellHeight + 4,
      visible: true,
    })
  }

  const close = () => {
    menu.update(state => ({
      ...state,
      visible: false,
    }))
  }

  return {
    menu: {
      ...menu,
      actions: {
        open,
        close,
      },
    },
  }
}