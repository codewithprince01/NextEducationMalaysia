'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bell,
  X,
  Check,
  CheckCheck,
  FileText,
  GraduationCap,
  MessageSquare,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Sparkles,
  Inbox,
} from 'lucide-react'

export interface NotificationItem {
  id: string
  title: string
  subtitle: string
  message: string
  type: 'document' | 'application' | 'message' | 'alert' | 'system'
  timestamp: string
  timeAgo: string
  read: boolean
  link?: string
  actionLabel?: string
  priority?: 'high' | 'medium' | 'normal'
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Missing Required Documents for Visa Clearance',
    subtitle: 'Admission Office • EMGS Malaysia',
    message:
      'Your admission application requires an updated scanned copy of your international passport (all pages) and certified high school transcripts before EMGS can issue your Visa Approval Letter (VAL).',
    type: 'document',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    timeAgo: '15m ago',
    read: false,
    link: '/student/profile#Upload Documents',
    actionLabel: 'Upload Documents Now',
    priority: 'high',
  },
  {
    id: 'notif-2',
    title: 'Counselor Message: Scholarship Eligibility',
    subtitle: 'Education Counselor • NextEdu Desk',
    message:
      'Good news! You qualify for a 30% merit scholarship for the upcoming intake at Malaysian partner universities. Please review your conversation and confirm your preferred start date.',
    type: 'message',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    timeAgo: '2h ago',
    read: false,
    link: '/student/conversation',
    actionLabel: 'Open Conversation',
    priority: 'high',
  },
  {
    id: 'notif-3',
    title: 'University Application Under Review',
    subtitle: 'Faculty Admissions Committee',
    message:
      'Your application for Bachelor of Software Engineering (Honours) has been forwarded to the partner institution admissions committee. Expected response within 3–5 working days.',
    type: 'application',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    timeAgo: '6h ago',
    read: false,
    link: '/student/my-applications',
    actionLabel: 'Track Application Status',
    priority: 'medium',
  },
  {
    id: 'notif-4',
    title: 'EMGS Medical Screening & Student Pass Guidelines',
    subtitle: 'Pre-Departure Advisory 2025/2026',
    message:
      'Please ensure your mandatory clinic medical screening is scheduled within 7 days of landing in Kuala Lumpur. Complete the pre-arrival tasks checklist on your student dashboard.',
    type: 'alert',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    timeAgo: '1d ago',
    read: true,
    link: '/student/tasks',
    actionLabel: 'View Task Checklist',
    priority: 'normal',
  },
]

export default function StudentNotificationDrawer({ isMobile = false }: { isMobile?: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all')
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const drawerRef = useRef<HTMLDivElement | null>(null)

  // Mount check and localStorage loading
  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem('student_notifications_data_v2')
      if (saved) {
        setNotifications(JSON.parse(saved))
      } else {
        setNotifications(DEFAULT_NOTIFICATIONS)
        localStorage.setItem('student_notifications_data_v2', JSON.stringify(DEFAULT_NOTIFICATIONS))
      }
    } catch {
      setNotifications(DEFAULT_NOTIFICATIONS)
    }
  }, [])

  // Sync to localStorage
  const updateNotifications = (newList: NotificationItem[]) => {
    setNotifications(newList)
    try {
      localStorage.setItem('student_notifications_data_v2', JSON.stringify(newList))
    } catch {}
  }

  // Handle ESC key and prevent body background scrolling / sliding when drawer is open
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)

    // Calculate scrollbar width to prevent horizontal layout shift (screen slide)
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    const prevBodyOverflow = document.body.style.overflow
    const prevHtmlOverflow = document.documentElement.style.overflow
    const prevBodyPaddingRight = document.body.style.paddingRight
    const prevBodyOverscroll = document.body.style.overscrollBehavior
    const prevHtmlOverscroll = document.documentElement.style.overscrollBehavior

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overscrollBehavior = 'none'
    document.documentElement.style.overscrollBehavior = 'none'

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prevBodyOverflow
      document.documentElement.style.overflow = prevHtmlOverflow
      document.body.style.paddingRight = prevBodyPaddingRight
      document.body.style.overscrollBehavior = prevBodyOverscroll
      document.documentElement.style.overscrollBehavior = prevHtmlOverscroll
    }
  }, [isOpen])

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  )

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'unread') {
      return notifications.filter((n) => !n.read)
    }
    return notifications
  }, [notifications, activeFilter])

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    updateNotifications(updated)
  }

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }))
    updateNotifications(updated)
  }

  const handleMarkAsReadAndDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = notifications.filter((n) => n.id !== id)
    updateNotifications(updated)
  }

  const handleActionClick = (notif: NotificationItem) => {
    markAsRead(notif.id)
    setIsOpen(false)
    if (notif.link) {
      router.push(notif.link)
    }
  }

  const getBadgeStyle = (type: NotificationItem['type']) => {
    switch (type) {
      case 'document':
        return {
          icon: <FileText className="w-4 h-4 text-rose-600" />,
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          label: 'Documents Required',
        }
      case 'application':
        return {
          icon: <GraduationCap className="w-4 h-4 text-blue-600" />,
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          label: 'Application Status',
        }
      case 'message':
        return {
          icon: <MessageSquare className="w-4 h-4 text-indigo-600" />,
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          label: 'Advisor Message',
        }
      case 'alert':
        return {
          icon: <AlertCircle className="w-4 h-4 text-amber-600" />,
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          label: 'Visa & EMGS Alert',
        }
      default:
        return {
          icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          label: 'System Update',
        }
    }
  }

  return (
    <>
      {/* Navbar Notification Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`relative flex items-center justify-center rounded-xl transition-all cursor-pointer active:scale-95 ${
          isMobile
            ? 'p-2 text-slate-700 hover:text-blue-600 hover:bg-slate-100'
            : 'w-10 h-10 border border-slate-200/90 bg-slate-50 hover:bg-white hover:border-blue-300 text-slate-700 hover:text-blue-600 shadow-2xs'
        }`}
        title="Notifications"
        aria-label={`Open Notifications (${unreadCount} unread)`}
      >
        <Bell className="w-[19px] h-[19px]" />

        {mounted && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] px-1 items-center justify-center rounded-full bg-rose-600 text-[11px] font-bold text-white shadow-sm animate-pulse ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Render Slide-Over Drawer using Portal directly on document.body for true full screen height */}
      {mounted &&
        isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[999999]" role="dialog" aria-modal="true">
            {/* Backdrop Overlay - stops all scroll and touch events from reaching background */}
            <div
              onClick={() => setIsOpen(false)}
              onTouchMove={(e) => e.preventDefault()}
              onWheel={(e) => e.preventDefault()}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity duration-300 touch-none select-none"
              aria-hidden="true"
            />

            {/* Slide-Over Drawer Container (Full Screen Height from top to bottom) */}
            <aside
              ref={drawerRef}
              className="fixed inset-y-0 right-0 h-screen h-[100dvh] w-full sm:w-[480px] md:w-[500px] max-w-full bg-white shadow-2xl z-[1000000] flex flex-col transform transition-transform duration-300 ease-out translate-x-0 overscroll-contain"
              style={{ overscrollBehavior: 'contain' }}
              aria-label="Notification Drawer"
            >
              {/* Header */}
              <div className="shrink-0 px-5 py-3 border-b border-slate-200/80 bg-gradient-to-b from-slate-50 to-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/20 shrink-0">
                    <Bell className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200/80">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Your admission updates, alerts & messages
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  aria-label="Close notifications drawer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Filter Tabs & Mark All as Read */}
              <div className="shrink-0 px-5 py-2 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setActiveFilter('all')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                      activeFilter === 'all'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('unread')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                      activeFilter === 'unread'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer transition"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all as read</span>
                  </button>
                )}
              </div>

              {/* Notifications List - Stretches full remaining height and scrolls smoothly without visible scrollbar */}
              <div
                className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-50/50 overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {filteredNotifications.length === 0 ? (
                  <div className="py-16 px-6 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <Inbox className="w-6 h-6 text-slate-400" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 mb-1">
                      No {activeFilter === 'unread' ? 'unread ' : ''}notifications
                    </h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                      You are completely caught up! We will notify you whenever there is an admission update, missing document, or message.
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((notif) => {
                    const badge = getBadgeStyle(notif.type)
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleActionClick(notif)}
                        className={`group relative rounded-xl p-3 sm:p-3.5 border transition-all duration-200 cursor-pointer ${
                          notif.read
                            ? 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-2xs'
                            : 'bg-white border-blue-200/90 shadow-2xs hover:shadow-xs ring-1 ring-blue-500/10'
                        }`}
                      >
                        {/* Top Meta: Category Badge & Time */}
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${badge.bg}`}
                          >
                            {badge.icon}
                            <span>{badge.label}</span>
                          </span>

                          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium shrink-0">
                            <Clock className="w-3 h-3" />
                            <span>{notif.timeAgo}</span>
                          </div>
                        </div>

                        {/* Title */}
                        <h4
                          className={`text-[13.5px] tracking-tight leading-snug mb-1 ${
                            notif.read ? 'font-semibold text-slate-800' : 'font-bold text-slate-900'
                          }`}
                        >
                          {notif.title}
                        </h4>

                        {/* Subtitle / Sender context */}
                        {notif.subtitle && (
                          <p className="text-[11px] font-semibold text-slate-500 mb-1">
                            {notif.subtitle}
                          </p>
                        )}

                        {/* Detailed message text */}
                        <p className="text-[12.5px] sm:text-[13px] text-slate-600 leading-relaxed mb-2">
                          {notif.message}
                        </p>

                        {/* Action link & Delete button */}
                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                          {notif.actionLabel ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:text-blue-700 transition">
                              <span>{notif.actionLabel}</span>
                              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                            </span>
                          ) : (
                            <span />
                          )}

                          <button
                            type="button"
                            onClick={(e) => handleMarkAsReadAndDismiss(notif.id, e)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-all cursor-pointer"
                            title="Mark as read & dismiss"
                            aria-label="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Mark read</span>
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </aside>
          </div>,
          document.body
        )}
    </>
  )
}
