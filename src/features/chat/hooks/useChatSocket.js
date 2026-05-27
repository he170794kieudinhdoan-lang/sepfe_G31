import { useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api')
  .replace(/\/api$/, '')

export const useChatSocket = (conversationId, userId) => {
  const socketRef = useRef(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    const socket = io(`${BASE_URL}/chat`, { transports: ['websocket'] })
    socketRef.current = socket

    socket.on('connect', () => {
      if (conversationId) socket.emit('join_conversation', conversationId)
    })

    socket.on('new_message', () => {
      queryClient.invalidateQueries({ queryKey: ['messages', String(conversationId)] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    })

    return () => {
      if (conversationId) socket.emit('leave_conversation', conversationId)
      socket.disconnect()
    }
  }, [conversationId, queryClient])

  const sendTyping = useCallback(
    (isTyping) => {
      if (socketRef.current?.connected && conversationId && userId) {
        socketRef.current.emit('typing', { conversationId, userId, isTyping })
      }
    },
    [conversationId, userId],
  )

  return { socketRef, sendTyping }
}
