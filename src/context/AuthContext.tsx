'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: any | null
  login: (token: string, studentId: string, email: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any | null>(null)

  useEffect(() => {
    // Check for token on mount
    const token = localStorage.getItem('token')
    const studentId = localStorage.getItem('student_id')
    const email = localStorage.getItem('student_email')

    if (token && studentId) {
      setIsAuthenticated(true)
      setUser({ id: studentId, email: email })
    }
    setIsLoading(false)
  }, [])

  const login = (token: string, studentId: string, email: string) => {
    localStorage.setItem('token', token)
    localStorage.setItem('student_id', studentId)
    localStorage.setItem('student_email', email)
    setIsAuthenticated(true)
    setUser({ id: studentId, email: email })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('student_id')
    localStorage.removeItem('student_email')
    setIsAuthenticated(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
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
