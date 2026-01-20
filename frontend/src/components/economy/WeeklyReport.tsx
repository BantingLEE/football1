'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface WeeklyTransaction {
  id: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description: string
  date: Date
}

const mockTransactions: WeeklyTransaction[] = [
  {
    id: '1',
    type: 'income',
    category: 'ticket',
    amount: 400000,
    description: 'Matchday revenue vs Manchester City',
    date: new Date('2026-01-17'),
  },
  {
    id: '2',
    type: 'income',
    category: 'broadcast',
    amount: 600000,
    description: 'TV broadcasting rights - Week 3',
    date: new Date('2026-01-16'),
  },
  {
    id: '3',
    type: 'expense',
    category: 'wages',
    amount: 800000,
    description: 'Player salaries - Week 3',
    date: new Date('2026-01-15'),
  },
  {
    id: '4',
    type: 'income',
    category: 'sponsorship',
    amount: 200000,
    description: 'Sponsor payment',
    date: new Date('2026-01-14'),
  },
  {
    id: '5',
    type: 'expense',
    category: 'operations',
    amount: 150000,
    description: 'Stadium maintenance',
    date: new Date('2026-01-13'),
  },
  {
    id: '6',
    type: 'expense',
    category: 'transfer',
    amount: 500000,
    description: 'Transfer fee: John Smith',
    date: new Date('2026-01-12'),
  },
]

export function WeeklyReport() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date)
  }

  const totalIncome = mockTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = mockTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const netIncome = totalIncome - totalExpense

  const previousWeekIncome = totalIncome * 0.9
  const previousWeekExpense = totalExpense * 1.05

  const incomeChange = ((totalIncome - previousWeekIncome) / previousWeekIncome) * 100
  const expenseChange = ((totalExpense - previousWeekExpense) / previousWeekExpense) * 100

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Weekly Financial Report
          </CardTitle>
          <Badge variant="outline">Week 3</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                Total Income
              </span>
              {incomeChange > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-green-600" />
              )}
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {incomeChange > 0 ? '+' : ''}{incomeChange.toFixed(1)}% vs last week
            </p>
          </div>

          <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-red-700 dark:text-red-400">
                Total Expenses
              </span>
              {expenseChange < 0 ? (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              ) : (
                <ArrowUpRight className="h-4 w-4 text-red-600" />
              )}
            </div>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpense)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {expenseChange > 0 ? '+' : ''}{expenseChange.toFixed(1)}% vs last week
            </p>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                Net Income
              </span>
              {netIncome > 0 ? (
                <TrendingUp className="h-4 w-4 text-blue-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-blue-600" />
              )}
            </div>
            <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(netIncome)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {netIncome > 0 ? 'Profitable week' : 'Loss for the week'}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Recent Transactions</h3>
          <div className="space-y-2">
            {mockTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    transaction.type === 'income'
                      ? 'bg-green-100 dark:bg-green-900'
                      : 'bg-red-100 dark:bg-red-900'
                  }`}>
                    {transaction.type === 'income' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {transaction.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(transaction.date)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
