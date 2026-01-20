import mongoose from 'mongoose'

export interface Migration {
  name: string
  up: () => Promise<void>
  down: () => Promise<void>
}

export interface MigrationRecord {
  name: string
  executedAt: Date
}

const MigrationRecordSchema = new mongoose.Schema<MigrationRecord>({
  name: { type: String, required: true, unique: true },
  executedAt: { type: Date, required: true, default: Date.now }
})

export const MigrationRecord = mongoose.model<MigrationRecord>('MigrationRecord', MigrationRecordSchema)

export class MigrationRunner {
  private migrations: Migration[] = []

  register(migration: Migration): void {
    this.migrations.push(migration)
  }

  async up(): Promise<void> {
    console.log('Starting migrations...')
    
    const executedNames = await MigrationRecord.distinct('name')
    
    for (const migration of this.migrations) {
      if (executedNames.includes(migration.name)) {
        console.log(`Skipping migration: ${migration.name} (already executed)`)
        continue
      }
      
      console.log(`Running migration: ${migration.name}`)
      
      const startTime = Date.now()
      await migration.up()
      const duration = Date.now() - startTime
      
      if (duration > 5000) {
        console.warn(`Slow migration detected: ${migration.name} took ${duration}ms`)
      }
      
      await MigrationRecord.create({ name: migration.name })
      console.log(`Migration completed: ${migration.name}`)
    }
    
    console.log('All migrations completed successfully')
  }

  async down(): Promise<void> {
    console.log('Rolling back migrations...')
    
    const executedRecords = await MigrationRecord.find().sort({ executedAt: -1 })
    
    for (const record of executedRecords) {
      const migration = this.migrations.find(m => m.name === record.name)
      
      if (!migration) {
        console.warn(`Migration not found: ${record.name}, skipping rollback`)
        continue
      }
      
      console.log(`Rolling back migration: ${migration.name}`)
      await migration.down()
      await MigrationRecord.deleteOne({ name: record.name })
      console.log(`Rollback completed: ${migration.name}`)
    }
    
    console.log('All migrations rolled back successfully')
  }

  async getStatus(): Promise<MigrationRecord[]> {
    return MigrationRecord.find().sort({ executedAt: -1 })
  }
}
