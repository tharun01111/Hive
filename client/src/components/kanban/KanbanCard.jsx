import { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import CardDetailModal from "./CardDetailModal.jsx";
import { AvatarStack } from "../ui/Avatar.jsx";

export default function KanbanCard({ card, index, projectId }) {
  const [showDetail, setShowDetail] = useState(false);
  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();

  return (
    <>
      <Draggable draggableId={card.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => setShowDetail(true)}
            className={`card relative overflow-hidden p-3 cursor-pointer group transition-all ${
              snapshot.isDragging
                ? "shadow-notion-lg rotate-1"
                : "hover:-translate-y-0.5 hover:shadow-notion-md"
            }`}
          >
            <div
              className={`absolute left-0 top-0 h-full w-1 ${
                isOverdue ? "bg-red-500" : "bg-neutral-300 dark:bg-neutral-700"
              }`}
            />
            <p className="pl-1 text-sm font-medium text-neutral-900 dark:text-neutral-100 leading-snug">
              {card.title}
            </p>

            {card.description && (
              <p className="pl-1 text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-5">
                {card.description}
              </p>
            )}

            <div className="flex items-center justify-between mt-3 pl-1">
              {/* Due date */}
              {card.dueDate && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    isOverdue
                      ? "bg-red-50 dark:bg-red-950/30 text-red-500"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                  }`}
                >
                  {new Date(card.dueDate).toLocaleDateString()}
                </span>
              )}

              {/* Assignees */}
              {card.assignees?.length > 0 && (
                <div className="ml-auto">
                  <AvatarStack
                    members={card.assignees.map((assignee) => assignee.user)}
                    limit={3}
                    size="sm"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </Draggable>

      <CardDetailModal
        card={card}
        projectId={projectId}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </>
  );
}
