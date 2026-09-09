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

export default function ConversationsClient() {
  const [messages, setMessages] = useState<Message[]>(DEFAULT_MESSAGES)
  const [newMsg, setNewMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
        setMessages(list)
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col bg-white overflow-hidden">
      {/* Header — Full Width */}
      <div className="px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Conversation</h2>
            <p className="text-xs text-blue-100 font-normal">Student & Advisor Communication Desk</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Advisor Desk Active</span>
        </div>
      </div>

      {/* Chat Area — Full Width & Height with auto-scroll */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-6 space-y-6 bg-slate-50/60 scrollbar-thin">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-xs font-medium">Loading conversation thread...</span>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.sender === 'update') {
              return (
                <div key={msg.id} className="flex flex-col items-center my-3">
                  <div className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 border border-amber-200/90 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold shadow-xs">
                    {msg.text}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 italic">{msg.time}</span>
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
                  className={`max-w-[85%] sm:max-w-[70%] md:max-w-[55%] px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isStudent
                      ? 'bg-blue-600 text-white rounded-br-xs font-medium'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs font-medium'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 px-1 italic">{msg.time}</span>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area — Full Width Bottom Bar */}
      <div className="p-4 sm:p-5 bg-white border-t border-slate-200/80 shrink-0">
        <div className="flex items-center gap-3 w-full">
          <input
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message to counsellor / admin..."
            disabled={sending}
            className="flex-1 bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-slate-200/90 rounded-2xl px-5 py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition placeholder:text-slate-400 shadow-2xs disabled:opacity-60"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !newMsg.trim()}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-2xl shadow-sm transition-all flex items-center gap-2 font-semibold text-xs sm:text-sm cursor-pointer shrink-0 disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Send</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
