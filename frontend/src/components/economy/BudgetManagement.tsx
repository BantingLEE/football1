'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Calendar, TrendingUp, AlertCircle } from 'lucide-react'
import { useState } from 'react'

interface BudgetForecast {
  week: number
  income: number
  expense: number
  net: number
}

export function BudgetManagement() {
  const [budgetAmount, setBudgetAmount] = useState(50000000)
  const [forecastWeeks, setForecastWeeks] = useState([12])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const weeklyIncome = 2500000
  const weeklyExpense = 1800000
  const weeklyNet = weeklyIncome - weeklyExpense

  const generateForecast = (weeks: number): BudgetForecast[] => {
    const forecast: BudgetForecast[] = []
    let currentIncome = weeklyIncome
    let currentExpense = weeklyExpense

    for (let i = 1; i <= weeks; i++) {
      forecast.push({
        week: i,
        income: currentIncome,
        expense: currentExpense,
        net: currentIncome - currentExpense,
      })
    }

    return forecast
  }

  const forecast = generateForecast(forecastWeeks[0])
  const projectedCash = forecast.reduce((sum, week) => sum + week.net, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Management & Forecasts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <Label htmlFor="budget">Total Budget</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  id="budget"
                  type="number"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(Number(e.target.value))}
                  className="text-lg"
                />
                <Button variant="outline" size="icon">
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label>Forecast Period: {forecastWeeks[0]} weeks</Label>
              <Slider
                value={forecastWeeks}
                onValueChange={setForecastWeeks}
                max={52}
                min={4}
                step={1}
                className="mt-2"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  Projected Cash Flow
                </span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(projectedCash)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Over {forecastWeeks[0]} weeks
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  Weekly Net Income
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(weeklyNet)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {weeklyNet > 0 ? 'Positive cash flow' : 'Negative cash flow'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Cash Flow Forecast
          </h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left">Week</th>
                  <th className="p-3 text-right">Income</th>
                  <th className="p-3 text-right">Expense</th>
                  <th className="p-3 text-right">Net</th>
                </tr>
              </thead>
              <tbody>
                {forecast.slice(0, 8).map((week) => (
                  <tr key={week.week} className="border-t">
                    <td className="p-3">Week {week.week}</td>
                    <td className="p-3 text-right text-green-600">
                      {formatCurrency(week.income)}
                    </td>
                    <td className="p-3 text-right text-red-600">
                      {formatCurrency(week.expense)}
                    </td>
                    <td className={`p-3 text-right ${week.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(week.net)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {projectedCash < 0 && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Budget Warning
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your projected cash flow is negative. Consider adjusting expenses or increasing income sources.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
