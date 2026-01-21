"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migration001AddClubIndexes = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.migration001AddClubIndexes = {
    name: '001_add_club_indexes',
    async up() {
        await mongoose_1.default.connection.db.collection('clubs').createIndex({ name: 1 }, { unique: true });
        await mongoose_1.default.connection.db.collection('clubs').createIndex({ city: 1 });
        await mongoose_1.default.connection.db.collection('clubs').createIndex({ foundedYear: 1 });
        await mongoose_1.default.connection.db.collection('clubs').createIndex({ createdAt: -1 });
        console.log('Club indexes created');
    },
    async down() {
        await mongoose_1.default.connection.db.collection('clubs').dropIndex({ name: 1 });
        await mongoose_1.default.connection.db.collection('clubs').dropIndex({ city: 1 });
        await mongoose_1.default.connection.db.collection('clubs').dropIndex({ foundedYear: 1 });
        await mongoose_1.default.connection.db.collection('clubs').dropIndex({ createdAt: -1 });
        console.log('Club indexes dropped');
    }
};
