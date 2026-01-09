"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { type User, users } from "@/lib/data"

interface UserContextType {
  currentUser: User
  setCurrentUser: (user: User) => void
  isGestor: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(users[0]) // Ana Silva (gestor) por padrão

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isGestor: currentUser.role === "gestor",
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
