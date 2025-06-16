"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    // You can add more fields here if needed, e.g., fullName, phoneNumber
    fullName: {
        type: String,
        required: false,
    },
    phoneNumber: {
        type: String,
        required: false,
    },
}, { timestamps: true });
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
