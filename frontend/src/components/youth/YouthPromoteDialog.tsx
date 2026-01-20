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
import { Select } from '@/components/ui/select'
import { Player } from '@/types'
import { post } from '@/lib/api'
import { Trophy, AlertCircle, Euro } from 'lucide-react'

interface YouthPromoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  player: Player | null
  salaryOffer: number
  onSuccess: () => void
}

export function YouthPromoteDialog({
  open,
  onOpenChange,
  player,
  salaryOffer: initialSalaryOffer,
  onSuccess,
}: YouthPromoteDialogProps) {
  const [contractLength, setContractLength] = useState('3')
  const [bonusOffer, setBonusOffer] = useState('10000')
  const [editableSalaryOffer, setEditableSalaryOffer] = useState(initialSalaryOffer)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setEditableSalaryOffer(initialSalaryOffer)
  }, [initialSalaryOffer])

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `€${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `€${(amount / 1000).toFixed(0)}K`
    }
    return `€${amount}`
  }

  const calculateTotalCost = () => {
    const salary = editableSalaryOffer
    const bonus = parseInt(bonusOffer) || 0
    const years = parseInt(contractLength) || 1
    const totalSalary = salary * 52 * years
    return totalSalary + bonus
  }

  const handleSubmit = async () => {
    if (!player) return

    setLoading(true)
    setError('')

    try {
      await post('/youth/promote', {
        playerId: player._id,
        salary: editableSalaryOffer,
        contractYears: parseInt(contractLength),
        signingBonus: parseInt(bonusOffer),
      })

      onSuccess()
      onOpenChange(false)
      setContractLength('3')
      setBonusOffer('10000')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to promote player')
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
            <Trophy className="h-5 w-5" />
            Promote Youth Player
          </DialogTitle>
          <DialogDescription>
            Offer {player.name} a first-team contract ({player.position})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <Label className="text-sm text-gray-600">Growth Potential</Label>
                <div className="text-2xl font-bold text-green-600">
                  +{player.potential - player.currentAbility}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary">Weekly Salary (€)</Label>
            <Input
              id="salary"
              type="number"
              value={editableSalaryOffer}
              onChange={(e) => setEditableSalaryOffer(Number(e.target.value))}
              placeholder="Enter weekly salary"
            />
            <p className="text-xs text-gray-500">
              Recommended: {formatCurrency(editableSalaryOffer * 1.2)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contract">Contract Length (Years)</Label>
            <Select
              id="contract"
              value={contractLength}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setContractLength(e.target.value)}
            >
              <option value="1">1 Year</option>
              <option value="2">2 Years</option>
              <option value="3">3 Years</option>
              <option value="4">4 Years</option>
              <option value="5">5 Years</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bonus">Signing Bonus (€)</Label>
            <Input
              id="bonus"
              type="number"
              value={bonusOffer}
              onChange={(e) => setBonusOffer(e.target.value)}
              placeholder="Enter signing bonus"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Euro className="h-4 w-4" />
              Contract Summary
            </h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Weekly Salary:</span>
                <span className="font-semibold">
                  {formatCurrency(editableSalaryOffer)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Contract Length:</span>
                <span className="font-semibold">{contractLength} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Signing Bonus:</span>
                <span className="font-semibold">{formatCurrency(parseInt(bonusOffer) || 0)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="text-gray-600">Total Cost:</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(calculateTotalCost())}
                </span>
              </div>
            </div>
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
            {loading ? 'Processing...' : 'Promote Player'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
