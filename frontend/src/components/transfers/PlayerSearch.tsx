'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Search, Filter } from 'lucide-react'

interface PlayerSearchProps {
  onSearch: (filters: {
    name: string
    position: string
    minAge: number
    maxAge: number
    minValue: number
    maxValue: number
  }) => void
}

export function PlayerSearch({ onSearch }: PlayerSearchProps) {
  const [name, setName] = useState('')
  const [position, setPosition] = useState('')
  const [minAge, setMinAge] = useState('')
  const [maxAge, setMaxAge] = useState('')
  const [minValue, setMinValue] = useState('')
  const [maxValue, setMaxValue] = useState('')

  const handleSearch = () => {
    onSearch({
      name,
      position,
      minAge: minAge ? parseInt(minAge) : 0,
      maxAge: maxAge ? parseInt(maxAge) : 100,
      minValue: minValue ? parseInt(minValue) : 0,
      maxValue: maxValue ? parseInt(maxValue) : 999999999,
    })
  }

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <Search className="h-5 w-5 text-gray-500" />
        <h3 className="font-semibold">Search Players</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Player Name</label>
          <Input
            placeholder="Search by name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Position</label>
          <Select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          >
            <option value="">All Positions</option>
            <option value="GK">Goalkeeper</option>
            <option value="CB">Center Back</option>
            <option value="RB">Right Back</option>
            <option value="LB">Left Back</option>
            <option value="CDM">Defensive Midfield</option>
            <option value="CM">Central Midfield</option>
            <option value="CAM">Attacking Midfield</option>
            <option value="RM">Right Midfield</option>
            <option value="LM">Left Midfield</option>
            <option value="ST">Striker</option>
            <option value="CF">Center Forward</option>
            <option value="LW">Left Winger</option>
            <option value="RW">Right Winger</option>
          </Select>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Min Age</label>
            <Input
              type="number"
              placeholder="16"
              min="16"
              max="50"
              value={minAge}
              onChange={(e) => setMinAge(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Max Age</label>
            <Input
              type="number"
              placeholder="40"
              min="16"
              max="50"
              value={maxAge}
              onChange={(e) => setMaxAge(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Min Value (€)</label>
            <Input
              type="number"
              placeholder="0"
              min="0"
              value={minValue}
              onChange={(e) => setMinValue(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Max Value (€)</label>
            <Input
              type="number"
              placeholder="999M"
              min="0"
              value={maxValue}
              onChange={(e) => setMaxValue(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSearch} className="flex-1">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setName('')
            setPosition('')
            setMinAge('')
            setMaxAge('')
            setMinValue('')
            setMaxValue('')
            onSearch({
              name: '',
              position: '',
              minAge: 0,
              maxAge: 100,
              minValue: 0,
              maxValue: 999999999,
            })
          }}
        >
          <Filter className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  )
}
