'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react'

interface FinancialSummaryProps {
  budget?: number
  cash?: number
  weeklyIncome?: number
  weeklyExpense?: number
}

export function FinancialSummary({
  budget = 50000000,
  cash = 30000000,
  weeklyIncome = 2500000,
  weeklyExpense = 1800000,
}: FinancialSummaryProps) {
  const netIncome = weeklyIncome - weeklyExpense
  const budgetRemaining = budget - cash

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="grid gap-6 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Budget</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(budget)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(budgetRemaining)} remaining
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(cash)}</div>
          <p className="text-xs text-muted-foreground mt-1">Available funds</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Weekly Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(weeklyIncome)}</div>
          <p className="text-xs text-muted-foreground mt-1">Revenue this week</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Weekly Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(weeklyExpense)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(netIncome)} net
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
