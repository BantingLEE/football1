"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migration003AddMatchIndexes = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.migration003AddMatchIndexes = {
    name: '003_add_match_indexes',
    async up() {
        await mongoose_1.default.connection.db.collection('matches').createIndex({ leagueId: 1 });
        await mongoose_1.default.connection.db.collection('matches').createIndex({ date: -1 });
        await mongoose_1.default.connection.db.collection('matches').createIndex({ status: 1 });
        await mongoose_1.default.connection.db.collection('matches').createIndex({ 'homeTeam.clubId': 1 });
        await mongoose_1.default.connection.db.collection('matches').createIndex({ 'awayTeam.clubId': 1 });
        await mongoose_1.default.connection.db.collection('matches').createIndex({ leagueId: 1, date: -1 });
        await mongoose_1.default.connection.db.collection('matches').createIndex({ leagueId: 1, status: 1 });
        await mongoose_1.default.connection.db.collection('matches').createIndex({ 'homeTeam.clubId': 1, 'awayTeam.clubId': 1 });
        console.log('Match indexes created');
    },
    async down() {
        await mongoose_1.default.connection.db.collection('matches').dropIndex({ leagueId: 1 });
        await mongoose_1.default.connection.db.collection('matches').dropIndex({ date: -1 });
        await mongoose_1.default.connection.db.collection('matches').dropIndex({ status: 1 });
        await mongoose_1.default.connection.db.collection('matches').dropIndex({ 'homeTeam.clubId': 1 });
        await mongoose_1.default.connection.db.collection('matches').dropIndex({ 'awayTeam.clubId': 1 });
        await mongoose_1.default.connection.db.collection('matches').dropIndex({ leagueId: 1, date: -1 });
        await mongoose_1.default.connection.db.collection('matches').dropIndex({ leagueId: 1, status: 1 });
        await mongoose_1.default.connection.db.collection('matches').dropIndex({ 'homeTeam.clubId': 1, 'awayTeam.clubId': 1 });
        console.log('Match indexes dropped');
    }
};
