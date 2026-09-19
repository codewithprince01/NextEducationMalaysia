'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, GraduationCap, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api/v1').replace(/\/$/, '')
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''

interface Message {
  id: number | string
  sender: 'admin' | 'student' | 'update'
  senderName?: string
  text: string
  time: string
  isStudent?: boolean
}

const DEFAULT_MESSAGES: Message[] = [
  { id: 1, sender: 'admin', senderName: 'Admissions Desk', text: 'Welcome to your Student & Advisor Communication Desk! Feel free to ask any questions regarding your application.', time: '10:00 AM', isStudent: false },
]

const isSameThread = (a: Message[], b: Message[]) =>
  a.length === b.length &&
  a.every((msg, i) => msg.id === b[i]?.id && msg.text === b[i]?.text)

export default function ConversationsClient() {
  const [messages, setMessages] = useState<Message[]>(DEFAULT_MESSAGES)
  const [newMsg, setNewMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // Auto-scroll only while the reader is already at the bottom, so scrolling up
  // to read older messages is not undone by the next poll.
  const stickToBottomRef = useRef(true)
  const hasAutoScrolledRef = useRef(false)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const fetchConversation = async (silent = false) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) return

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
    }

    try {
      const res = await fetch(`${API_BASE}/student/conversation`, { headers })
      const json = await res.json()
      const list = Array.isArray(json?.data?.messages)
        ? json.data.messages
        : Array.isArray(json?.messages)
        ? json.messages
        : []

      if (list.length > 0) {
        // The poll hands back a fresh array every 4s even when nothing changed.
        // Keeping the old reference in that case stops the auto-scroll effect
        // from re-running four times a minute for no reason.
        setMessages((prev) => (isSameThread(prev, list) ? prev : list))
      }
    } catch (err) {
      if (!silent) console.error('Failed to load conversation:', err)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversation(false)

    // Real-time polling every 4 seconds to get advisor replies instantly
    const interval = setInterval(() => {
      fetchConversation(true)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  // Lock outer document & body from scrolling so only the inner chat messages scroll
  useEffect(() => {
    const prevBody = document.body.style.overflow
    const prevHtml = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevBody
      document.documentElement.style.overflow = prevHtml
    }
  }, [])

  // Track whether the reader is parked at the bottom of the thread.
  const handleChatScroll = () => {
    const el = chatContainerRef.current
    if (!el) return
    stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
  }

  useEffect(() => {
    const el = chatContainerRef.current
    if (!el) return
    if (hasAutoScrolledRef.current && !stickToBottomRef.current) return

    // Scroll the thread itself. `scrollIntoView()` also scrolls every
    // scrollable ancestor — including the window — which dragged the whole
    // dashboard page downwards on each poll.
    el.scrollTo({
      top: el.scrollHeight,
      behavior: hasAutoScrolledRef.current ? 'smooth' : 'auto',
    })
    hasAutoScrolledRef.current = true
  }, [messages])

  const handleSend = async () => {
    if (!newMsg.trim() || sending) return
    const textToSend = newMsg.trim()
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      toast.error('Please log in to send messages.')
      return
    }

    setSending(true)
    const currentTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })

    // Optimistic UI update
    const tempId = Date.now()
    setMessages((prev) => [
      ...prev,
      { id: tempId, sender: 'student', text: textToSend, time: currentTime, isStudent: true },
    ])
    setNewMsg('')

    // Immediately keep focus locked on message box
    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
      }
      const res = await fetch(`${API_BASE}/student/conversation`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: textToSend }),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.message || 'Failed to send message')
      }

      fetchConversation(true)
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message.')
    } finally {
      setSending(false)
      // Keep focus on input after send finishes
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
      inputRef.current?.focus()
    }
  }

  return (
    <div className="w-full h-full min-h-0 flex flex-col bg-slate-50 overflow-hidden relative">

      {/* Chat Area — Full Width & Height (Only this scrolls) */}
      <div
        ref={chatContainerRef}
        onScroll={handleChatScroll}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-8 md:px-16 lg:px-24 py-5 space-y-4 bg-slate-50/70"
        style={{ overscrollBehavior: 'contain' }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-xs font-medium">Loading conversation thread...</span>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.sender === 'update') {
              return (
                <div key={msg.id} className="flex flex-col items-center my-2">
                  <div className="bg-slate-100 text-slate-700 border border-slate-200/80 px-4 py-1.5 rounded-full text-xs font-medium shadow-2xs">
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">{msg.time}</span>
                </div>
              )
            }

            const isStudent = msg.sender === 'student' || msg.isStudent

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isStudent ? 'items-end' : 'items-start'}`}
              >
                {!isStudent && (
                  <span className="text-[11px] font-bold text-slate-500 mb-1 px-1">
                    {msg.senderName || 'Admissions Advisor'}
                  </span>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[70%] md:max-w-[55%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    isStudent
                      ? 'bg-blue-600 text-white rounded-tr-xs font-normal'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs font-normal'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 px-1">{msg.time}</span>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area — Fixed to bottom of screen, never scrolls */}
      <div className="shrink-0 w-full bg-white border-t border-slate-200 p-3 sm:p-4 z-10 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center gap-2.5 w-full">
          <input
            ref={inputRef}
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message to counsellor / admin..."
            className="flex-1 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition placeholder:text-slate-400 shadow-2xs"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !newMsg.trim()}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl shadow-xs transition-all flex items-center gap-2 font-bold text-xs sm:text-sm cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
