"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const artikelStore_1 = require("./artikelStore");
const userStore_1 = require("./userStore");
const auth_1 = require("./auth");
const app = (0, express_1.default)();
dotenv_1.default.config();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
let artikelListe = (0, artikelStore_1.loadArtikel)();
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = (0, userStore_1.findUser)(username);
    if (!user || user.password !== password) {
        res.status(401).json({ message: 'Ungültige Anmeldedaten' });
        return;
    }
    const token = (0, auth_1.generateToken)({ username: user.username, role: user.role });
    res.json({ token, role: user.role });
});
app.get('/api/artikel', auth_1.verifyToken, (req, res) => {
    artikelListe = (0, artikelStore_1.loadArtikel)();
    res.json(artikelListe);
});
app.post('/api/artikel', auth_1.verifyToken, (0, auth_1.requireRole)('owner'), (req, res) => {
    const { name, kategorie, bestand, zustand, status } = req.body;
    if (!name || !kategorie || bestand === undefined || !zustand || !status) {
        res.status(400).json({ message: 'Fehlende Felder' });
        return;
    }
    const neueId = artikelListe.length > 0 ? artikelListe[artikelListe.length - 1].id + 1 : 1;
    const neuerArtikel = { id: neueId, name, kategorie, bestand, zustand, status };
    artikelListe.push(neuerArtikel);
    (0, artikelStore_1.saveArtikel)(artikelListe);
    res.status(201).json({ message: 'Artikel hinzugefügt', artikel: neuerArtikel });
});
app.delete('/api/artikel/:id/fehler', auth_1.verifyToken, (0, auth_1.requireRole)('owner'), (req, res) => {
    const id = parseInt(req.params.id, 10);
    const index = artikelListe.findIndex((a) => a.id === id);
    if (index === -1) {
        res.status(404).json({ message: 'Artikel nicht gefunden' });
        return;
    }
    delete artikelListe[index].fehler;
    (0, artikelStore_1.saveArtikel)(artikelListe);
    res.json({ message: 'Fehler entfernt' });
});
app.listen(3000, () => {
    console.log('✅ Backend läuft auf http://localhost:3000');
});
