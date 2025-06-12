import express, { Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import mongoose from 'mongoose';

import {
    Artikel,
    loadArtikel,
    addArtikel,
    updateArtikel,
    removeFehler,
    findeNaechsteId,
    gruppiereNachKategorie,
    zaehleDefekteArtikel
} from './artikelStore';

import { findUser } from './userStore';
import {
    generateToken,
    verifyToken,
    requireRole,
    RequestWithUser
} from './auth';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Logging-Funktion
const logToFile = (text: string) => {
    const logEntry = `[${new Date().toISOString()}] ${text}\n`;
    fs.appendFileSync('log.txt', logEntry);
};

async function main() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lagerverwaltung')
        .then(() => console.log('Verbunden mit MongoDB'))
        .catch(err => console.error('MongoDB Fehler:', err));

    // Login
    app.post('/api/login', (req: RequestWithUser, res: Response): void => {
        const { username, password } = req.body;
        const user = findUser(username);

        if (!user || user.password !== password) {
            res.status(401).json({ message: 'Ungültige Anmeldedaten' });
            return;
        }

        const token = generateToken({ username: user.username, role: user.role });
        res.json({ token, role: user.role });
    });

    // Token überprüfen
    app.get('/api/verify-token', verifyToken, (req: RequestWithUser, res: Response): void => {
        res.status(200).json({ message: 'Token gültig' });
    });

    // Artikel lesen
    app.get('/api/artikel', verifyToken, async (req: RequestWithUser, res: Response) => {
        const artikel = await loadArtikel();
        res.json(artikel);
    });

    // Artikel erstellen (nur für owner)
    app.post('/api/artikel', verifyToken, requireRole('owner'), async (req: RequestWithUser, res: Response) => {
        const { name, kategorie, bestand, zustand, status } = req.body;

        if (!name || !kategorie || bestand === undefined || !zustand || !status) {
            res.status(400).json({ message: 'Fehlende Felder' });
            return;
        }

        const neueId = await findeNaechsteId();
        const neuerArtikel: Artikel = { id: neueId, name, kategorie, bestand, zustand, status };

        await addArtikel(neuerArtikel);
        logToFile(`Artikel-ID ${neueId} erstellt von ${req.user?.username || 'Unbekannt'}`);

        res.status(201).json({ message: 'Artikel hinzugefügt', artikel: neuerArtikel });
    });

    // Meldung erfassen (Fehler hinzufügen)
    app.post('/api/meldung', verifyToken, async (req: RequestWithUser, res: Response) => {
        const { id, fehler } = req.body;

        if (!id || !fehler) {
            res.status(400).json({ message: 'ID oder Fehlertext fehlt' });
            return;
        }

        await updateArtikel(id, { fehler });
        logToFile(`Artikel-ID ${id}: ${fehler}`);
        res.status(200).json({ message: 'Fehlermeldung gespeichert' });
    });

    // Meldung entfernen (nur owner)
    app.delete('/api/artikel/:id/fehler', verifyToken, requireRole('owner'), async (req: RequestWithUser, res: Response) => {
        const id = parseInt(req.params.id, 10);
        await removeFehler(id);
        logToFile(`Artikel-ID ${id}: Fehler entfernt von ${req.user?.username || 'Unbekannt'}`);
        res.json({ message: 'Fehler entfernt' });
    });

    // Aggregation: Anzahl Artikel pro Kategorie
    app.get('/api/statistik/kategorien', verifyToken, async (req, res) => {
        const gruppen = await gruppiereNachKategorie();
        res.json(gruppen);
    });

    // Zählen: Anzahl Artikel mit Fehler
    app.get('/api/statistik/defekte', verifyToken, async (req, res) => {
        const anzahl = await zaehleDefekteArtikel();
        res.json({ defekte: anzahl });
    });

    // Server starten
    app.listen(3000, () => {
        console.log('✅ Backend läuft auf http://localhost:3000');
    });
}

main().catch(console.error);
