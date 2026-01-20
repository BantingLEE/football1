'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface ExpenseData {
  name: string
  value: number
  color: string
  [key: string]: string | number
}

const defaultExpenseData: ExpenseData[] = [
  { name: 'Wages', value: 1000000, color: '#ef4444' },
  { name: 'Transfers', value: 500000, color: '#f97316' },
  { name: 'Operations', value: 200000, color: '#eab308' },
  { name: 'Penalties', value: 100000, color: '#6b7280' },
]

export function ExpenseChart({ data = defaultExpenseData }: { data?: ExpenseData[] }) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Expenses:</span>
            <span className="text-2xl font-bold text-red-600">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
