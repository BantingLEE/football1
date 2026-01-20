'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, TrendingUp, DollarSign, AlertCircle } from 'lucide-react'

interface YouthFacilityPanelProps {
  facility: {
    level: number
    capacity: number
    trainingQuality: number
    upgradeCost: number
    currentPlayers: number
  }
  onUpgrade: () => void
  loading?: boolean
}

export function YouthFacilityPanel({
  facility,
  onUpgrade,
  loading,
}: YouthFacilityPanelProps) {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `€${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `€${(amount / 1000).toFixed(0)}K`
    }
    return `€${amount}`
  }

  const getLevelColor = (level: number) => {
    if (level >= 8) return 'bg-purple-500'
    if (level >= 5) return 'bg-blue-500'
    if (level >= 3) return 'bg-green-500'
    return 'bg-gray-500'
  }

  const canUpgrade = facility.level < 10

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Youth Academy Facility
          <Badge className={`${getLevelColor(facility.level)} text-white`}>
            Level {facility.level}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">
              {facility.currentPlayers}
            </div>
            <div className="text-sm text-gray-600 mt-1">Current Players</div>
            <div className="text-xs text-gray-500">
              of {facility.capacity} capacity
            </div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">
              {facility.trainingQuality}%
            </div>
            <div className="text-sm text-gray-600 mt-1">
              <TrendingUp className="h-4 w-4 inline mr-1" />
              Training Quality
            </div>
            <div className="text-xs text-gray-500">
              +{facility.level * 5}% bonus
            </div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">
              {facility.level}
            </div>
            <div className="text-sm text-gray-600 mt-1">Facility Level</div>
            <div className="text-xs text-gray-500">Max: 10</div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Level Benefits</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Capacity: {facility.capacity} youth players</li>
            <li>• Training bonus: +{facility.level * 5}% growth rate</li>
            <li>
              • Scouting quality: {['Poor', 'Fair', 'Good', 'Excellent', 'World Class'][
                Math.min(Math.floor((facility.level - 1) / 2), 4)
              ]}
            </li>
          </ul>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-semibold">Upgrade Facility</h4>
              <p className="text-sm text-gray-600">
                Increase to Level {facility.level + 1}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(facility.upgradeCost)}
              </div>
              <div className="text-xs text-gray-500">Upgrade Cost</div>
            </div>
          </div>

          {canUpgrade ? (
            <Button
              onClick={onUpgrade}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              {loading ? 'Upgrading...' : 'Upgrade Facility'}
            </Button>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div className="text-sm text-yellow-800">
                Facility is already at maximum level (10)
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 text-center">
          Upgrading increases capacity, training quality, and scouting ability
        </div>
      </CardContent>
    </Card>
  )
}
