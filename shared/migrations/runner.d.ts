import mongoose from 'mongoose';
export interface Migration {
    name: string;
    up: () => Promise<void>;
    down: () => Promise<void>;
}
export interface MigrationRecord {
    name: string;
    executedAt: Date;
}
export declare const MigrationRecord: mongoose.Model<MigrationRecord, {}, {}, {}, mongoose.Document<unknown, {}, MigrationRecord, {}, {}> & MigrationRecord & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>;
export declare class MigrationRunner {
    private migrations;
    register(migration: Migration): void;
    up(): Promise<void>;
    down(): Promise<void>;
    getStatus(): Promise<MigrationRecord[]>;
}
