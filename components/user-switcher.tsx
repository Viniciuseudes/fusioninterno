"use client"

import { useUser } from "@/contexts/user-context"
import { users } from "@/lib/data"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Shield, User } from "lucide-react"

export function UserSwitcher() {
  const { currentUser, setCurrentUser, isGestor } = useUser()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Avatar className="h-6 w-6">
            <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="hidden md:inline">{currentUser.name}</span>
          <Badge
            variant={isGestor ? "default" : "secondary"}
            className={isGestor ? "bg-primary text-primary-foreground" : ""}
          >
            {isGestor ? "Gestor" : "Membro"}
          </Badge>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Alternar Usuário (Demo)</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {users.map((user) => (
          <DropdownMenuItem key={user.id} onClick={() => setCurrentUser(user)} className="gap-3 cursor-pointer">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            {user.role === "gestor" ? (
              <Shield className="h-4 w-4 text-primary" />
            ) : (
              <User className="h-4 w-4 text-muted-foreground" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
