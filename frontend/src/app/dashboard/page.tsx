'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/common/Header'
import { Sidebar } from '@/components/common/Sidebar'
import { Footer } from '@/components/common/Footer'
import { useTheme } from '@/components/common/ThemeProvider'
import { ClubOverview } from '@/components/dashboard/ClubOverview'
import { FinancialSummary } from '@/components/dashboard/FinancialSummary'
import { NextMatch } from '@/components/dashboard/NextMatch'
import { RecentNotifications } from '@/components/dashboard/RecentNotifications'
import { useClubStore } from '@/store/useClubStore'
import { Match } from '@/types'

export default function DashboardPage() {
  const { theme, toggleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { club, loading, fetchClub } = useClubStore()
  
  const [nextMatch, setNextMatch] = useState<Match | null>(null)
  const [matchLoading, setMatchLoading] = useState(true)
  
  const [notifications, setNotifications] = useState<any[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(true)

  useEffect(() => {
    const clubId = localStorage.getItem('clubId') || 'demo-club-123'
    fetchClub(clubId)
    
    setMatchLoading(true)
    setNotificationsLoading(true)

    setTimeout(() => {
      const demoMatch: Match = {
        _id: 'match-1',
        homeTeam: {
          clubId: club?.name || 'Your Club',
          score: 0,
          lineup: [],
          tactics: {
            formation: club?.tacticalPreference.formation || '4-4-2',
            attacking: club?.tacticalPreference.attacking || 5,
            defending: club?.tacticalPreference.defending || 5,
            playStyle: 'possession'
          }
        },
        awayTeam: {
          clubId: 'Rival FC',
          score: 0,
          lineup: [],
          tactics: {
            formation: '4-3-3',
            attacking: 6,
            defending: 4,
            playStyle: 'counter'
          }
        },
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        leagueId: 'league-1',
        status: 'scheduled',
        events: [],
        statistics: {
          possession: { home: 50, away: 50 },
          shots: { home: 0, away: 0 },
          shotsOnTarget: { home: 0, away: 0 },
          corners: { home: 0, away: 0 },
          fouls: { home: 0, away: 0 },
          passes: { home: 0, away: 0 }
        },
        playerRatings: new Map()
      }
      
      setNextMatch(demoMatch)
      setMatchLoading(false)

      const demoNotifications = [
        {
          id: '1',
          type: 'success' as const,
          title: 'Transfer Completed',
          message: 'New player has joined your squad successfully.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          read: false
        },
        {
          id: '2',
          type: 'info' as const,
          title: 'Training Report',
          message: 'Your team has improved their fitness levels.',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
          read: false
        },
        {
          id: '3',
          type: 'warning' as const,
          title: 'Budget Warning',
          message: 'You are approaching your monthly budget limit.',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          read: true
        }
      ]
      
      setNotifications(demoNotifications)
      setNotificationsLoading(false)
    }, 1000)
  }, [fetchClub, club?.name, club?.tacticalPreference])

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        toggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      
      <div className="flex flex-1">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              <p className="text-muted-foreground">
                Welcome back! Here is an overview of your club.
              </p>
            </div>

            {loading ? (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="h-64 bg-muted rounded-lg animate-pulse" />
                  <div className="h-64 bg-muted rounded-lg animate-pulse" />
                </div>
                <div className="h-64 bg-muted rounded-lg animate-pulse" />
              </div>
            ) : club ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <ClubOverview club={club} />
                  <FinancialSummary club={club} />
                </div>
                <div className="space-y-6">
                  <NextMatch match={nextMatch} loading={matchLoading} />
                  <RecentNotifications 
                    notifications={notifications} 
                    loading={notificationsLoading} 
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No club data available</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
