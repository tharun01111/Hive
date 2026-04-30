import { useState } from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { useKanbanStore } from "../../store/kanban.store.js";
import { getSocket } from "../../socket/socket.js";
import KanbanCard from "./KanbanCard.jsx";
import EmptyState from "../ui/EmptyState.jsx";

export default function KanbanColumn({ column, index, projectId }) {
  const removeColumn = useKanbanStore((s) => s.removeColumn);
  const [addingCard, setAddingCard] = useState(false);
  const [cardTitle, setCardTitle] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [columnName, setColumnName] = useState(column.name);
  const socket = getSocket();

  const handleAddCard = (e) => {
    e.preventDefault();
    if (!cardTitle.trim()) return;

    socket?.emit("card:create", {
      columnId: column.id,
      title: cardTitle.trim(),
      projectId,
    });

    setCardTitle("");
    setAddingCard(false);
  };

  const handleDeleteColumn = () => {
    if (!window.confirm(`Delete column "${column.name}" and all its cards?`))
      return;
    socket?.emit("column:delete", { columnId: column.id, projectId });
    removeColumn(column.id);
  };

  const handleRenameColumn = (e) => {
    e.preventDefault();
    if (!columnName.trim() || columnName === column.name) {
      setEditingName(false);
      return;
    }
    socket?.emit("column:update", {
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
          className={`w-72 shrink-0 flex flex-col rounded-notion bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 border-t-2 border-t-neutral-300 dark:border-t-neutral-700 max-h-full ${
            snapshot.isDragging ? "shadow-notion-lg rotate-1" : ""
          }`}
        >
          {/* Column header */}
          <div
            {...provided.dragHandleProps}
            className="flex items-center justify-between px-3 py-2.5 border-b border-neutral-200 dark:border-neutral-800"
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
                onDoubleClick={() => setEditingName(true)}
                className="flex-1 text-left text-sm font-medium text-neutral-900 dark:text-neutral-100"
              >
                {column.name}
                <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 font-normal">
                  {column.cards?.length ?? 0}
                </span>
              </button>
            )}

            <div className="flex items-center gap-1">
              <button
                onClick={() => setAddingCard(true)}
                className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                title="Add card"
              >
                <PlusIcon />
              </button>
              <button
                onClick={handleDeleteColumn}
                className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-red-500 transition-colors"
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
                className={`flex-1 overflow-y-auto p-2 space-y-2 min-h-16 transition-colors ${
                  snapshot.isDraggingOver
                    ? "bg-neutral-100 dark:bg-neutral-800/50"
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
                  <div className="rounded-notion border border-dashed border-neutral-200 bg-white/60 dark:border-neutral-800 dark:bg-neutral-950/30">
                    <EmptyState
                      compact
                      icon={<EmptyColumnIcon />}
                      title="No tasks here yet"
                      description="Add a card or drag work into this stage."
                      action={
                        <button
                          onClick={() => setAddingCard(true)}
                          className="btn-secondary py-1.5 px-3 text-xs"
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
                          setCardTitle("");
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
