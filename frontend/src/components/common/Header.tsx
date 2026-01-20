'use client'

import { useState } from 'react'
import { Menu, X, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  toggleSidebar: () => void
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

export function Header({ toggleSidebar, sidebarOpen, theme, toggleTheme }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <h1 className="text-xl font-bold text-foreground">Football Manager</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  )
}
