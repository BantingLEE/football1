"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migration004AddYouthFacilityIndexes = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.migration004AddYouthFacilityIndexes = {
    name: '004_add_youth_facility_indexes',
    async up() {
        await mongoose_1.default.connection.db.collection('youthfacilities').createIndex({ clubId: 1 }, { unique: true });
        await mongoose_1.default.connection.db.collection('youthfacilities').createIndex({ level: 1 });
        await mongoose_1.default.connection.db.collection('youthfacilities').createIndex({ lastGenerationDate: -1 });
        console.log('Youth Facility indexes created');
    },
    async down() {
        await mongoose_1.default.connection.db.collection('youthfacilities').dropIndex({ clubId: 1 });
        await mongoose_1.default.connection.db.collection('youthfacilities').dropIndex({ level: 1 });
        await mongoose_1.default.connection.db.collection('youthfacilities').dropIndex({ lastGenerationDate: -1 });
        console.log('Youth Facility indexes dropped');
    }
};
