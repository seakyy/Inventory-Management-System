"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveArtikel = exports.loadArtikel = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const FILE_PATH = path_1.default.join(__dirname, '../inventory.json');
const loadArtikel = () => {
    if (!fs_1.default.existsSync(FILE_PATH))
        fs_1.default.writeFileSync(FILE_PATH, '[]');
    const raw = fs_1.default.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(raw);
};
exports.loadArtikel = loadArtikel;
const saveArtikel = (artikel) => {
    fs_1.default.writeFileSync(FILE_PATH, JSON.stringify(artikel, null, 2));
};
exports.saveArtikel = saveArtikel;
