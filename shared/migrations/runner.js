"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationRunner = exports.MigrationRecord = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const MigrationRecordSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, unique: true },
    executedAt: { type: Date, required: true, default: Date.now }
});
exports.MigrationRecord = mongoose_1.default.model('MigrationRecord', MigrationRecordSchema);
class MigrationRunner {
    constructor() {
        this.migrations = [];
    }
    register(migration) {
        this.migrations.push(migration);
    }
    async up() {
        console.log('Starting migrations...');
        const executedNames = await exports.MigrationRecord.distinct('name');
        for (const migration of this.migrations) {
            if (executedNames.includes(migration.name)) {
                console.log(`Skipping migration: ${migration.name} (already executed)`);
                continue;
            }
            console.log(`Running migration: ${migration.name}`);
            const startTime = Date.now();
            await migration.up();
            const duration = Date.now() - startTime;
            if (duration > 5000) {
                console.warn(`Slow migration detected: ${migration.name} took ${duration}ms`);
            }
            await exports.MigrationRecord.create({ name: migration.name });
            console.log(`Migration completed: ${migration.name}`);
        }
        console.log('All migrations completed successfully');
    }
    async down() {
        console.log('Rolling back migrations...');
        const executedRecords = await exports.MigrationRecord.find().sort({ executedAt: -1 });
        for (const record of executedRecords) {
            const migration = this.migrations.find(m => m.name === record.name);
            if (!migration) {
                console.warn(`Migration not found: ${record.name}, skipping rollback`);
                continue;
            }
            console.log(`Rolling back migration: ${migration.name}`);
            await migration.down();
            await exports.MigrationRecord.deleteOne({ name: record.name });
            console.log(`Rollback completed: ${migration.name}`);
        }
        console.log('All migrations rolled back successfully');
    }
    async getStatus() {
        return exports.MigrationRecord.find().sort({ executedAt: -1 });
    }
}
exports.MigrationRunner = MigrationRunner;
