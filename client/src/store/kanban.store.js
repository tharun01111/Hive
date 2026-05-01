import { create } from "zustand";

export const useKanbanStore = create((set) => ({
  columns: [],

  setColumns: (columns) => set({ columns }),

  addColumn: (column) =>
    set((state) => ({
      columns: state.columns.some((c) => c.id === column.id)
        ? state.columns.map((c) =>
            c.id === column.id ? { ...c, ...column, cards: c.cards ?? [] } : c,
          )
        : [...state.columns, { ...column, cards: column.cards ?? [] }],
    })),

  confirmColumn: (clientId, column) =>
    set((state) => ({
      columns: state.columns
        .map((c) =>
          c.id === clientId
            ? { ...column, cards: column.cards ?? c.cards ?? [] }
            : c.id === column.id
              ? { ...c, ...column, cards: c.cards ?? column.cards ?? [] }
              : c,
        )
        .filter(
          (c, index, columns) =>
            columns.findIndex((candidate) => candidate.id === c.id) === index,
        ),
    })),

  updateColumn: (columnId, data) =>
    set((state) => ({
      columns: state.columns.map((c) =>
        c.id === columnId ? { ...c, ...data } : c,
      ),
    })),

  removeColumn: (columnId) =>
    set((state) => ({
      columns: state.columns.filter((c) => c.id !== columnId),
    })),

  addCard: (card) =>
    set((state) => ({
      columns: state.columns.map((c) =>
        c.id === card.columnId
          ? {
              ...c,
              cards: c.cards.some((k) => k.id === card.id)
                ? c.cards.map((k) => (k.id === card.id ? { ...k, ...card } : k))
                : [...c.cards, card],
            }
          : c,
      ),
    })),

  confirmCard: (clientId, card) =>
    set((state) => ({
      columns: state.columns.map((c) => {
        const cards = c.cards
          .map((k) => (k.id === clientId ? { ...card } : k))
          .filter((k) => k.id !== card.id || k.id === clientId);

        if (c.id !== card.columnId) {
          return { ...c, cards: cards.filter((k) => k.id !== card.id) };
        }

        if (cards.some((k) => k.id === card.id)) {
          return {
            ...c,
            cards: cards.map((k) => (k.id === card.id ? { ...k, ...card } : k)),
          };
        }

        return { ...c, cards: [...cards, card] };
      }),
    })),

  updateCard: (card) =>
    set((state) => {
      const existing = state.columns
        .flatMap((c) => c.cards)
        .find((k) => k.id === card.id);
      const merged = existing ? { ...existing, ...card } : card;

      return {
        columns: state.columns.map((c) => {
          const cards = c.cards.filter((k) => k.id !== card.id);

          if (c.id !== merged.columnId) {
            return { ...c, cards };
          }

          const insertAt = Number.isInteger(merged.order)
            ? Math.min(Math.max(merged.order, 0), cards.length)
            : cards.length;
          const nextCards = [...cards];
          nextCards.splice(insertAt, 0, merged);

          return { ...c, cards: nextCards };
        }),
      };
    }),

  removeCard: (cardId) =>
    set((state) => ({
      columns: state.columns.map((c) => ({
        ...c,
        cards: c.cards.filter((k) => k.id !== cardId),
      })),
    })),

  moveCard: (cardId, fromColumnId, toColumnId, newOrder) =>
    set((state) => {
      const card = state.columns
        .find((c) => c.id === fromColumnId)
        ?.cards.find((k) => k.id === cardId);

      if (!card) return state;

      return {
        columns: state.columns.map((c) => {
          if (c.id === fromColumnId && c.id !== toColumnId) {
            return { ...c, cards: c.cards.filter((k) => k.id !== cardId) };
          }
          if (c.id === toColumnId) {
            const filtered = c.cards.filter((k) => k.id !== cardId);
            filtered.splice(newOrder, 0, { ...card, columnId: toColumnId });
            return { ...c, cards: filtered };
          }
          return c;
        }),
      };
    }),

  reorderColumns: (columns) => set({ columns }),
}));
