'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { History, CheckCircle, XCircle, Clock, Euro } from 'lucide-react'

export interface TransferRecord {
  _id: string
  playerId: string
  playerName: string
  playerPosition: string
  offerAmount: number
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
  createdAt: string
  updatedAt: string
}

interface TransferHistoryProps {
  transfers: TransferRecord[]
  loading?: boolean
}

export function TransferHistory({ transfers, loading }: TransferHistoryProps) {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `€${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `€${(amount / 1000).toFixed(0)}K`
    }
    return `€${amount}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        )
      case 'accepted':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Accepted
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        )
      case 'completed':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Completed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transfer History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Transfer History
          <Badge variant="secondary">{transfers.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transfers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No transfer history yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transfers.map((transfer) => (
              <div
                key={transfer._id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold">{transfer.playerName}</h4>
                    <Badge variant="outline">{transfer.playerPosition}</Badge>
                    {getStatusBadge(transfer.status)}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Euro className="h-3 w-3" />
                      <span className="font-semibold text-green-600">
                        {formatCurrency(transfer.offerAmount)}
                      </span>
                    </div>
                    <span>{formatDate(transfer.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
