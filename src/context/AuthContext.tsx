'use client'

import React, { createContext, useContext, useState } from 'react'

interface AuthUser {
  id: string
  email: string | null
  name: string
}

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: AuthUser | null
  login: (token: string, studentId: string, email: string, name?: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean
    isLoading: boolean
    user: AuthUser | null
  }>(() => {
    if (typeof window === 'undefined') {
      return { isAuthenticated: false, isLoading: true, user: null }
    }

    const token = localStorage.getItem('token')
    const studentId = localStorage.getItem('student_id')
    const email = localStorage.getItem('student_email')
    const name = localStorage.getItem('student_name')

    if (token && studentId) {
      return {
        isAuthenticated: true,
        isLoading: false,
        user: { id: studentId, email, name: name || '' },
      }
    }

    return { isAuthenticated: false, isLoading: false, user: null }
  })

  const login = (token: string, studentId: string, email: string, name?: string) => {
    localStorage.setItem('token', token)
    localStorage.setItem('student_id', studentId)
    localStorage.setItem('student_email', email)
    if (name && String(name).trim()) {
      localStorage.setItem('student_name', String(name).trim())
    }
    setAuthState({
      isAuthenticated: true,
      isLoading: false,
      user: { id: studentId, email, name: (name || '').trim() },
    })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('student_id')
    localStorage.removeItem('student_email')
    localStorage.removeItem('student_name')
    setAuthState({ isAuthenticated: false, isLoading: false, user: null })
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authState.isAuthenticated,
        isLoading: authState.isLoading,
        user: authState.user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
