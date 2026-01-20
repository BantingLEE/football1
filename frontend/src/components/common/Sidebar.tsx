'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Trophy,
  TrendingUp,
  Settings,
  Calendar,
  Wallet,
  GraduationCap
} from 'lucide-react'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/squad', label: 'Squad', icon: Users },
  { href: '/matches', label: 'Matches', icon: Trophy },
  { href: '/transfers', label: 'Transfers', icon: TrendingUp },
  { href: '/finances', label: 'Finances', icon: Wallet },
  { href: '/training', label: 'Training', icon: Calendar },
  { href: '/youth', label: 'Youth Academy', icon: GraduationCap },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 transform border-r bg-background transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <nav className="flex h-full flex-col p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
