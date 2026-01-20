export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatCurrency(amount: number, currency: string = '€'): string {
  return `${currency}${amount.toLocaleString()}`
}

export function calculatePlayerValue(player: any): number {
  const ageFactor = player.age < 24 ? 1.2 : player.age > 30 ? 0.6 : 1
  const potentialFactor = player.potential / 100
  return Math.round(player.currentAbility * 10000 * ageFactor * potentialFactor)
}

export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
