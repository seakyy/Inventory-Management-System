"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUser = exports.loadUsers = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const USERS_PATH = path_1.default.join(__dirname, '../users.json');
const loadUsers = () => {
    const raw = fs_1.default.readFileSync(USERS_PATH, 'utf-8');
    return JSON.parse(raw);
};
exports.loadUsers = loadUsers;
const findUser = (username) => {
    return (0, exports.loadUsers)().find(u => u.username === username);
};
exports.findUser = findUser;
