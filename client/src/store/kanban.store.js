import { create } from 'zustand'

export const useKanbanStore = create((set) => ({
  columns: [],

  setColumns: (columns) => set({ columns }),

  addColumn: (column) => set((state) => ({
    columns: [...state.columns, { ...column, cards: [] }],
  })),

  updateColumn: (columnId, data) => set((state) => ({
    columns: state.columns.map((c) =>
      c.id === columnId ? { ...c, ...data } : c
    ),
  })),

  removeColumn: (columnId) => set((state) => ({
    columns: state.columns.filter((c) => c.id !== columnId),
  })),

  addCard: (card) => set((state) => ({
    columns: state.columns.map((c) =>
      c.id === card.columnId
        ? { ...c, cards: [...c.cards, card] }
        : c
    ),
  })),

  updateCard: (card) => set((state) => ({
    columns: state.columns.map((c) => ({
      ...c,
      cards: c.cards.map((k) => k.id === card.id ? { ...k, ...card } : k),
    })),
  })),

  removeCard: (cardId) => set((state) => ({
    columns: state.columns.map((c) => ({
      ...c,
      cards: c.cards.filter((k) => k.id !== cardId),
    })),
  })),

  moveCard: (cardId, fromColumnId, toColumnId, newOrder) => set((state) => {
    const card = state.columns
      .find((c) => c.id === fromColumnId)
      ?.cards.find((k) => k.id === cardId)

    if (!card) return state

    return {
      columns: state.columns.map((c) => {
        if (c.id === fromColumnId && c.id !== toColumnId) {
          return { ...c, cards: c.cards.filter((k) => k.id !== cardId) }
        }
        if (c.id === toColumnId) {
          const filtered = c.cards.filter((k) => k.id !== cardId)
          filtered.splice(newOrder, 0, { ...card, columnId: toColumnId })
          return { ...c, cards: filtered }
        }
        return c
      }),
    }
  }),

  reorderColumns: (columns) => set({ columns }),
}))