export interface Club {
  _id: string
  name: string
  foundedYear: number
  city: string
  stadium: {
    name: string
    capacity: number
  }
  finances: {
    budget: number
    cash: number
    incomeHistory: IncomeRecord[]
    expenseHistory: ExpenseRecord[]
  }
  youthFacility: {
    level: number
    capacity: number
    trainingQuality: number
  }
  tacticalPreference: {
    formation: Formation
    attacking: number
    defending: number
  }
}

export type Formation =
  | '4-4-2'
  | '4-3-3'
  | '3-5-2'
  | '4-2-3-1'
  | '5-3-2'
  | '3-4-3'

export interface IncomeRecord {
  type: 'ticket' | 'broadcast' | 'sponsorship' | 'merchandise' | 'other'
  amount: number
  date: Date
}

export interface ExpenseRecord {
  type: 'wages' | 'transfer' | 'operations' | 'penalty' | 'other'
  amount: number
  date: Date
}
