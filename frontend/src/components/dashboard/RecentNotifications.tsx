'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, CheckCircle, AlertCircle, Info } from 'lucide-react'

interface Notification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: Date
  read: boolean
}

interface RecentNotificationsProps {
  notifications: Notification[]
  loading?: boolean
}

export function RecentNotifications({ notifications, loading }: RecentNotificationsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-start gap-3 p-2">
                <div className="h-5 w-5 bg-muted rounded" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
    }
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.slice(0, 5).map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-3 rounded-lg p-3 transition-colors ${
                notification.read ? 'opacity-60' : 'bg-muted/50'
              }`}
            >
              <div className="mt-0.5">{getIcon(notification.type)}</div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{notification.title}</p>
                <p className="text-xs text-muted-foreground">{notification.message}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(notification.timestamp).toLocaleString()}
                </p>
              </div>
              {!notification.read && (
                <div className="h-2 w-2 rounded-full bg-primary" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
