import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { useKanbanStore } from "../../store/kanban.store.js";
import { getSocket } from "../../socket/socket.js";
import KanbanColumn from "./KanbanColumn.jsx";
import AddColumnButton from "./AddColumnButton.jsx";

export default function KanbanBoard({ projectId }) {
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

    const socket = getSocket();

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
            className="flex gap-3 p-6 h-full overflow-x-auto items-start"
          >
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
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
