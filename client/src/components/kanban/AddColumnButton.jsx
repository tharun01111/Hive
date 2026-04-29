import { useState } from 'react'
import { getSocket } from '../../socket/socket.js'

export default function AddColumnButton({ projectId }) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const socket = getSocket()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return

    socket?.emit('column:create', {
      name: name.trim(),
      projectId,
    })

    setName('')
    setAdding(false)
  }

  if (adding) {
    return (
      <div className="w-72 shrink-0 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-notion p-3">
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setAdding(false)
                setName('')
              }
            }}
            placeholder="Column name..."
            className="input text-sm"
          />
          <div className="flex items-center gap-2">
            <button type="submit" className="btn-primary py-1 px-3 text-xs">
              Add column
            </button>
            <button
              type="button"
              onClick={() => { setAdding(false); setName('') }}
              className="btn-ghost py-1 px-2 text-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <button
      onClick={() => setAdding(true)}
      className="w-72 shrink-0 flex items-center gap-2 px-3 py-2.5 rounded-notion border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-400 dark:text-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-600 hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors text-sm"
    >
      <PlusIcon />
      Add column
    </button>
  )
}

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)