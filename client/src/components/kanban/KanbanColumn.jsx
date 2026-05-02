import { useState } from "react";
import toast from "react-hot-toast";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { useAuthStore } from "../../store/auth.store.js";
import { useKanbanStore } from "../../store/kanban.store.js";
import { ensureSocket } from "../../socket/socket.js";
import KanbanCard from "./KanbanCard.jsx";
import EmptyState from "../ui/EmptyState.jsx";

const createTempId = () =>
  `temp-card-${crypto.randomUUID?.() ?? Date.now().toString(36)}`;

const toDateInputValue = (date) => date.toISOString().slice(0, 10);

const buildDueDate = (date, time) => {
  if (!date) return null;
  if (!time) return date;
  return new Date(`${date}T${time}:00`).toISOString();
};

export default function KanbanColumn({ column, index, projectId }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const addCard = useKanbanStore((s) => s.addCard);
  const confirmCard = useKanbanStore((s) => s.confirmCard);
  const removeCard = useKanbanStore((s) => s.removeCard);
  const removeColumn = useKanbanStore((s) => s.removeColumn);
  const [addingCard, setAddingCard] = useState(false);
  const [cardTitle, setCardTitle] = useState("");
  const [cardDueDate, setCardDueDate] = useState("");
  const [cardDueTime, setCardDueTime] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [columnName, setColumnName] = useState(column.name);

  const resetCardForm = () => {
    setCardTitle("");
    setCardDueDate("");
    setCardDueTime("");
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    if (!cardTitle.trim()) return;

    const socket = ensureSocket(accessToken);
    if (!socket) return;
    const trimmedTitle = cardTitle.trim();
    const clientId = createTempId();
    const dueDate = buildDueDate(cardDueDate, cardDueTime);

    const cleanup = () => {
      socket.off("card:create:ack", handleAck);
      socket.off("card:create:error", handleError);
    };

    const handleAck = ({ card, clientId: ackClientId }) => {
      if (ackClientId !== clientId) return;
      cleanup();
      confirmCard(clientId, card);
    };

    const handleError = ({ clientId: errorClientId, message }) => {
      if (errorClientId !== clientId) return;
      cleanup();
      removeCard(clientId);
      toast.error(message ?? "Failed to create card");
    };

    addCard({
      id: clientId,
      columnId: column.id,
      title: trimmedTitle,
      description: null,
      dueDate,
      order: column.cards?.length ?? 0,
      assignees: [],
      pending: true,
      createdAt: new Date().toISOString(),
    });

    socket.on("card:create:ack", handleAck);
    socket.on("card:create:error", handleError);

    socket.emit("card:create", {
      columnId: column.id,
      title: trimmedTitle,
      dueDate,
      projectId,
      clientId,
    });

    resetCardForm();
    setAddingCard(false);
  };

  const handleDeleteColumn = () => {
    if (!window.confirm(`Delete column "${column.name}" and all its cards?`))
      return;
    const socket = ensureSocket(accessToken);
    if (!socket) return;
    socket.emit("column:delete", { columnId: column.id, projectId });
    removeColumn(column.id);
  };

  const handleRenameColumn = (e) => {
    e.preventDefault();
    if (!columnName.trim() || columnName === column.name) {
      setEditingName(false);
      return;
    }
    const socket = ensureSocket(accessToken);
    if (!socket) return;

    socket.emit("column:update", {
      columnId: column.id,
      name: columnName.trim(),
      projectId,
    });
    setEditingName(false);
  };

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`w-72 shrink-0 flex flex-col rounded-premium border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900/50 max-h-full transition-all duration-150 ${
            snapshot.isDragging
              ? "shadow-xl rotate-1 ring-1 ring-neutral-300 dark:ring-neutral-700 bg-white dark:bg-neutral-800"
              : "shadow-sm"
          } ${column.pending ? "opacity-70" : ""}`}
        >
          {/* Column header */}
          <div
            {...provided.dragHandleProps}
            className="sticky top-0 z-10 flex items-center justify-between bg-neutral-100 dark:bg-neutral-900 px-3 py-2 rounded-t-premium group"
          >
            {editingName ? (
              <form onSubmit={handleRenameColumn} className="flex-1 mr-2">
                <input
                  autoFocus
                  value={columnName}
                  onChange={(e) => setColumnName(e.target.value)}
                  onBlur={handleRenameColumn}
                  className="input py-1 text-sm font-medium"
                />
              </form>
            ) : (
              <button
                onClick={() => setEditingName(true)}
                className="flex items-baseline gap-2 overflow-hidden cursor-default group/title text-left focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600 rounded-sm outline-none"
              >
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {column.name}
                </h2>
                <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase">
                  {column.cards?.length ?? 0}
                </span>
                {column.pending && (
                  <span className="inline-flex h-3 w-3 animate-spin rounded-full border border-neutral-300 border-t-neutral-600 dark:border-neutral-700 dark:border-t-neutral-200" />
                )}
              </button>
            )}

            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => setAddingCard(true)}
                className="btn-ghost p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                title="Add card"
              >
                <PlusIcon />
              </button>
              <button
                onClick={handleDeleteColumn}
                className="btn-ghost p-1 text-neutral-400 hover:text-red-500"
                title="Delete column"
              >
                <TrashIcon />
              </button>
            </div>
          </div>

          {/* Cards */}
          <Droppable droppableId={column.id} type="CARD">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-1 overflow-y-auto p-1.5 space-y-1.5 min-h-[100px] rounded-b-premium transition-colors duration-150 ${
                  snapshot.isDraggingOver
                    ? "bg-neutral-200/40 dark:bg-neutral-800/40"
                    : ""
                }`}
              >
                {column.cards?.map((card, cardIndex) => (
                  <KanbanCard
                    key={card.id}
                    card={card}
                    index={cardIndex}
                    projectId={projectId}
                  />
                ))}
                {provided.placeholder}
                {column.cards?.length === 0 && !addingCard && (
                  <div className="rounded-premium border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/30">
                    <EmptyState
                      compact
                      icon={<EmptyColumnIcon />}
                      title="No tasks"
                      description="Add a card to start"
                      action={
                        <button
                          onClick={() => setAddingCard(true)}
                          className="btn-secondary py-1 px-2 text-[10px]"
                        >
                          Add task
                        </button>
                      }
                    />
                  </div>
                )}

                {/* Add card inline form */}
                {addingCard && (
                  <form onSubmit={handleAddCard} className="space-y-2">
                    <textarea
                      autoFocus
                      value={cardTitle}
                      onChange={(e) => setCardTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleAddCard(e);
                        }
                        if (e.key === "Escape") {
                          setAddingCard(false);
                          setCardTitle("");
                        }
                      }}
                      placeholder="Card title..."
                      rows={2}
                      className="input text-sm resize-none"
                    />
                    <div className="space-y-2">
                      <div className="grid grid-cols-[1fr_auto] gap-2">
                        <input
                          type="date"
                          value={cardDueDate}
                          onChange={(e) => setCardDueDate(e.target.value)}
                          className="input text-xs"
                        />
                        <input
                          type="time"
                          value={cardDueTime}
                          onChange={(e) => setCardDueTime(e.target.value)}
                          className="input w-28 text-xs"
                          disabled={!cardDueDate}
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setCardDueDate(toDateInputValue(new Date()))}
                          className="btn-ghost px-2 py-1 text-xs"
                        >
                          Today
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const date = new Date();
                            date.setDate(date.getDate() + 1);
                            setCardDueDate(toDateInputValue(date));
                          }}
                          className="btn-ghost px-2 py-1 text-xs"
                        >
                          Tomorrow
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const date = new Date();
                            date.setDate(date.getDate() + 7);
                            setCardDueDate(toDateInputValue(date));
                          }}
                          className="btn-ghost px-2 py-1 text-xs"
                        >
                          Next week
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        className="btn-primary py-1 px-3 text-xs"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAddingCard(false);
                          resetCardForm();
                        }}
                        className="btn-ghost py-1 px-2 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
}

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M7 2v10M2 7h10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.5 7.5h7L11 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EmptyColumnIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M4 5h10M4 9h7M4 13h5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
