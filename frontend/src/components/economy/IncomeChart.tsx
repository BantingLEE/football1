'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface IncomeData {
  name: string
  value: number
  color: string
}

const defaultIncomeData: IncomeData[] = [
  { name: 'Tickets', value: 800000, color: '#10b981' },
  { name: 'Broadcast', value: 1200000, color: '#3b82f6' },
  { name: 'Sponsorship', value: 400000, color: '#f59e0b' },
  { name: 'Merchandise', value: 100000, color: '#8b5cf6' },
]

export function IncomeChart({ data = defaultIncomeData }: { data?: IncomeData[] }) {
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
        <CardTitle>Income Breakdown</CardTitle>
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
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Income:</span>
            <span className="text-2xl font-bold text-green-600">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
