'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Dumbbell, Zap, Shield, Target, Brain, Heart } from 'lucide-react'

type TrainingType = 'physical' | 'technical' | 'tactical' | 'mental'

interface TrainingConfig {
  type: TrainingType
  duration: number
}

interface TrainingPanelProps {
  trainingConfig: TrainingConfig
  onUpdateConfig: (config: TrainingConfig) => void
  onStartTraining: () => void
  loading?: boolean
}

export function TrainingPanel({
  trainingConfig,
  onUpdateConfig,
  onStartTraining,
  loading,
}: TrainingPanelProps) {
  const trainingTypes = [
    { id: 'physical' as TrainingType, name: 'Physical', icon: Dumbbell, description: 'Improve speed, stamina, and physical attributes' },
    { id: 'technical' as TrainingType, name: 'Technical', icon: Zap, description: 'Enhance ball control and technical skills' },
    { id: 'tactical' as TrainingType, name: 'Tactical', icon: Shield, description: 'Develop positioning and tactical awareness' },
    { id: 'mental' as TrainingType, name: 'Mental', icon: Brain, description: 'Boost mental strength and decision-making' },
  ]

  const getTrainingIcon = (type: TrainingType) => {
    const training = trainingTypes.find((t) => t.id === type)
    if (!training) return Dumbbell
    return training.icon
  }

  const TrainingIcon = getTrainingIcon(trainingConfig.type)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5" />
          Training Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Training Type</h4>
          <div className="grid grid-cols-1 gap-2">
            {trainingTypes.map((training) => {
              const Icon = training.icon
              return (
                <button
                  key={training.id}
                  onClick={() =>
                    onUpdateConfig({ ...trainingConfig, type: training.id })
                  }
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    trainingConfig.type === training.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-5 w-5 ${
                        trainingConfig.type === training.id
                          ? 'text-blue-600'
                          : 'text-gray-500'
                      }`}
                    />
                    <div>
                      <div
                        className={`font-medium ${
                          trainingConfig.type === training.id
                            ? 'text-blue-900'
                            : 'text-gray-900'
                        }`}
                      >
                        {training.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {training.description}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Training Duration</h4>
          <Select
            value={String(trainingConfig.duration)}
            onChange={(e) =>
              onUpdateConfig({
                ...trainingConfig,
                duration: parseInt(e.target.value),
              })
            }
          >
            <option value="1">1 Week (Quick)</option>
            <option value="2">2 Weeks (Standard)</option>
            <option value="4">4 Weeks (Intensive)</option>
            <option value="8">8 Weeks (Extended)</option>
          </Select>
          <p className="text-xs text-gray-500">
            Longer training durations provide better attribute improvements
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Target className="h-4 w-4" />
            Expected Results
          </h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Training Type:</span>
              <span className="font-medium">{trainingConfig.type}</span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span className="font-medium">{trainingConfig.duration} weeks</span>
            </div>
            <div className="flex justify-between">
              <span>Expected Boost:</span>
              <span className="font-medium text-green-600">
                +{trainingConfig.duration * 2} to +{trainingConfig.duration * 4}
              </span>
            </div>
          </div>
        </div>

        <Button
          onClick={onStartTraining}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          <Heart className="h-4 w-4 mr-2" />
          {loading ? 'Starting Training...' : 'Start Training Program'}
        </Button>

        <div className="text-xs text-gray-500 text-center">
          Training affects all youth players in your academy
        </div>
      </CardContent>
    </Card>
  )
}
