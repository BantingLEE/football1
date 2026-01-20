'use client'

import { FinancialSummary } from '@/components/economy/FinancialSummary'
import { IncomeChart } from '@/components/economy/IncomeChart'
import { ExpenseChart } from '@/components/economy/ExpenseChart'
import { BudgetManagement } from '@/components/economy/BudgetManagement'
import { WeeklyReport } from '@/components/economy/WeeklyReport'

export default function EconomyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Economy Center</h1>
          <p className="text-muted-foreground mt-2">Manage your club's finances and budget</p>
        </div>

        <div className="grid gap-6">
          <FinancialSummary />

          <div className="grid gap-6 md:grid-cols-2">
            <IncomeChart />
            <ExpenseChart />
          </div>

          <BudgetManagement />

          <WeeklyReport />
        </div>
      </div>
    </div>
  )
}
