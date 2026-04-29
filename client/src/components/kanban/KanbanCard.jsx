import { useState } from 'react'
import { Draggable } from '@hello-pangea/dnd'
import CardDetailModal from './CardDetailModal.jsx'

export default function KanbanCard({ card, index, projectId }) {
  const [showDetail, setShowDetail] = useState(false)

  return (
    <>
      <Draggable draggableId={card.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => setShowDetail(true)}
            className={`card p-3 cursor-pointer group transition-shadow ${
              snapshot.isDragging ? 'shadow-notion-lg rotate-1' : 'hover:shadow-notion-md'
            }`}
          >
            <p className="text-sm text-neutral-900 dark:text-neutral-100 leading-snug">
              {card.title}
            </p>

            {card.description && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                {card.description}
              </p>
            )}

            <div className="flex items-center justify-between mt-2">
              {/* Due date */}
              {card.dueDate && (
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  new Date(card.dueDate) < new Date()
                    ? 'bg-red-50 dark:bg-red-950/30 text-red-500'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                }`}>
                  {new Date(card.dueDate).toLocaleDateString()}
                </span>
              )}

              {/* Assignees */}
              {card.assignees?.length > 0 && (
                <div className="flex -space-x-1 ml-auto">
                  {card.assignees.slice(0, 3).map((a) => (
                    <div
                      key={a.id}
                      className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-700 border border-white dark:border-neutral-900 flex items-center justify-center"
                      title={a.user.name}
                    >
                      <span className="text-xs text-neutral-600 dark:text-neutral-300">
                        {a.user.name[0].toUpperCase()}
                      </span>
                    </div>
                  ))}
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
  )
}