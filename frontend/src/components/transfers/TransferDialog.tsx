'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Player } from '@/types'
import { post } from '@/lib/api'
import { Euro, AlertCircle } from 'lucide-react'

interface TransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  player: Player | null
  playerValue: number
  onSuccess: () => void
}

export function TransferDialog({
  open,
  onOpenChange,
  player,
  playerValue,
  onSuccess,
}: TransferDialogProps) {
  const [offerAmount, setOfferAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (player) {
      setOfferAmount(String(Math.round(playerValue * 1.1)))
    }
    setError('')
  }, [player, playerValue])

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `€${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `€${(amount / 1000).toFixed(0)}K`
    }
    return `€${amount}`
  }

  const handleSubmit = async () => {
    if (!player) return

    const amount = parseInt(offerAmount)
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid offer amount')
      return
    }

    if (amount < playerValue * 0.8) {
      setError('Offer is too low. Minimum is 80% of market value.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await post('/transfers', {
        playerId: player._id,
        offerAmount: amount,
      })

      onSuccess()
      onOpenChange(false)
      setOfferAmount('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit offer')
    } finally {
      setLoading(false)
    }
  }

  if (!player) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Transfer Offer
          </DialogTitle>
          <DialogDescription>
            Make an offer for {player.name} ({player.position})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600">Market Value</Label>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(playerValue)}
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Age</Label>
                <div className="text-2xl font-bold">{player.age}</div>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Current Ability</Label>
                <div className="text-2xl font-bold">{player.currentAbility}</div>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Potential</Label>
                <div className="text-2xl font-bold text-blue-600">
                  {player.potential}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="offer">Your Offer (€)</Label>
            <Input
              id="offer"
              type="number"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              placeholder="Enter offer amount"
              min={Math.round(playerValue * 0.8)}
            />
            <p className="text-xs text-gray-500">
              Minimum offer: {formatCurrency(Math.round(playerValue * 0.8))}
              (80% of market value)
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Offer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
