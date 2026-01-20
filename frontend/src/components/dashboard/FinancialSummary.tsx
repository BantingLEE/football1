'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Club } from '@/types'
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react'

interface FinancialSummaryProps {
  club: Club
}

export function FinancialSummary({ club }: FinancialSummaryProps) {
  const { budget, cash, incomeHistory, expenseHistory } = club.finances

  const totalIncome = incomeHistory.reduce((sum: number, record) => sum + record.amount, 0)
  const totalExpenses = expenseHistory.reduce((sum: number, record) => sum + record.amount, 0)
  const netIncome = totalIncome - totalExpenses
  const availableFunds = cash + budget

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <Wallet className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Available Funds</p>
              <p className="text-xl font-bold">
                ${availableFunds.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Cash: ${cash.toLocaleString()} | Budget: ${budget.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            {netIncome >= 0 ? (
              <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-medium">Net Income</p>
              <p className={`text-xl font-bold ${netIncome >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${netIncome.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <DollarSign className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Total Income</p>
              <p className="text-lg font-semibold text-green-500">
                ${totalIncome.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <DollarSign className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Total Expenses</p>
              <p className="text-lg font-semibold text-red-500">
                ${totalExpenses.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
