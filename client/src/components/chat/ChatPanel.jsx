import { useState, useEffect, useRef } from 'react'
import { useChatStore } from '../../store/chat.store.js'
import { useAuthStore } from '../../store/auth.store.js'
import { getMessagesApi } from '../../api/message.api.js'
import { getSocket } from '../../socket/socket.js'

export default function ChatPanel({ projectId, onClose }) {
  const user = useAuthStore((s) => s.user)
  const { messages, nextCursor, setMessages, prependMessages, typingUsers } =
    useChatStore()
  const [content, setContent] = useState('')
  const [loadingMore, setLoadingMore] = useState(false)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const socket = getSocket()

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getMessagesApi(projectId)
        setMessages(data.messages, data.nextCursor)
      } catch (err) {
        console.error('Failed to load messages', err)
      }
    }
    load()

    return () => {
      useChatStore.getState().clearChat()
    }
  }, [projectId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!content.trim()) return

    socket?.emit('message:send', { projectId, content: content.trim() })
    setContent('')

    socket?.emit('typing:stop', { projectId })
    clearTimeout(typingTimeoutRef.current)
  }

  const handleTyping = (e) => {
    setContent(e.target.value)

    socket?.emit('typing:start', { projectId, userName: user?.name })

    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('typing:stop', { projectId })
    }, 2000)
  }

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const { data } = await getMessagesApi(projectId, nextCursor)
      prependMessages(data.messages, data.nextCursor)
    } catch (err) {
      console.error('Failed to load more messages', err)
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <div className="w-80 shrink-0 border-l border-neutral-200 dark:border-neutral-800 flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          Chat
        </p>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Load more */}
      {nextCursor && (
        <div className="px-4 pt-2">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="w-full text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 py-1"
          >
            {loadingMore ? 'Loading...' : 'Load older messages'}
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-neutral-400 dark:text-neutral-600">
              No messages yet. Say hello!
            </p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.userId === user?.id
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              {!isMe && (
                <span className="text-xs text-neutral-400 dark:text-neutral-600 mb-1 px-1">
                  {msg.user?.name}
                </span>
              )}
              <div
                className={`max-w-[85%] px-3 py-2 rounded-notion text-sm ${
                  isMe
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                }`}
              >
                {msg.content}
              </div>
              <span className="text-xs text-neutral-300 dark:text-neutral-700 mt-0.5 px-1">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-1">
          <p className="text-xs text-neutral-400 dark:text-neutral-600 italic">
            {typingUsers.map((u) => u.userName).join(', ')}{' '}
            {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </p>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 shrink-0">
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <textarea
            value={content}
            onChange={handleTyping}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend(e)
              }
            }}
            placeholder="Message..."
            rows={1}
            className="input text-sm resize-none flex-1"
          />
          <button
            type="submit"
            disabled={!content.trim()}
            className="btn-primary px-3 py-2 shrink-0"
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  )
}

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const SendIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M12 2L2 7l4 2 1 4 5-11z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
)