import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { useAuthStore } from "../../store/auth.store.js";
import { useKanbanStore } from "../../store/kanban.store.js";
import { ensureSocket } from "../../socket/socket.js";
import KanbanColumn from "./KanbanColumn.jsx";
import AddColumnButton from "./AddColumnButton.jsx";
import EmptyState from "../ui/EmptyState.jsx";

export default function KanbanBoard({ projectId }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const columns = useKanbanStore((s) => s.columns);
  const moveCard = useKanbanStore((s) => s.moveCard);
  const reorderColumns = useKanbanStore((s) => s.reorderColumns);

  const handleDragEnd = (result) => {
    const { destination, source, type } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const socket = ensureSocket(accessToken);

    if (type === "COLUMN") {
      const reordered = Array.from(columns);
      const [removed] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, removed);

      const updated = reordered.map((col, idx) => ({ ...col, order: idx }));
      reorderColumns(updated);

      socket?.emit("columns:reorder", {
        columns: updated.map((c) => ({ id: c.id, order: c.order })),
        projectId,
      });
      return;
    }

    // Card drag
    const sourceColumn = columns.find((c) => c.id === source.droppableId);
    const destColumn = columns.find((c) => c.id === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    const cardId = sourceColumn.cards[source.index]?.id;
    if (!cardId) return;

    moveCard(
      cardId,
      source.droppableId,
      destination.droppableId,
      destination.index,
    );

    socket?.emit("card:move", {
      cardId,
      columnId: destination.droppableId,
      order: destination.index,
      projectId,
    });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="board" type="COLUMN" direction="horizontal">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex h-full items-start gap-3 overflow-x-auto bg-neutral-50 dark:bg-black p-6"
          >
            {columns.length === 0 ? (
              <div className="flex h-full min-w-full items-center justify-center">
                <EmptyState
                  icon={<BoardIcon />}
                  title="This project is quiet right now"
                  description="Create columns and start organizing the work."
                  action={<AddColumnButton projectId={projectId} />}
                />
              </div>
            ) : (
              <>
                {columns.map((column, index) => (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    index={index}
                    projectId={projectId}
                  />
                ))}
                {provided.placeholder}
                <AddColumnButton projectId={projectId} />
              </>
            )}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

const BoardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M3 4h4v12H3V4zM8 4h4v12H8V4zM13 4h4v12h-4V4z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);
