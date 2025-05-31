import express, { Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';

import { Artikel, loadArtikel, saveArtikel } from './artikelStore';
import { findUser } from './userStore';
import { generateToken, verifyToken, requireRole, RequestWithUser } from './auth';

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

// Logging-Funktion
const logToFile = (text: string) => {
    const logEntry = `[${new Date().toISOString()}] ${text}\n`;
    fs.appendFileSync('log.txt', logEntry);
};

let artikelListe = loadArtikel();

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
app.get('/api/artikel', verifyToken, (req: RequestWithUser, res: Response): void => {
    artikelListe = loadArtikel();
    res.json(artikelListe);
});

// Artikel erstellen (nur für owner)
app.post('/api/artikel', verifyToken, requireRole('owner'), (req: RequestWithUser, res: Response): void => {
    const { name, kategorie, bestand, zustand, status } = req.body;

    if (!name || !kategorie || bestand === undefined || !zustand || !status) {
        res.status(400).json({ message: 'Fehlende Felder' });
        return;
    }

    const neueId = artikelListe.length > 0 ? artikelListe[artikelListe.length - 1].id + 1 : 1;
    const neuerArtikel: Artikel = { id: neueId, name, kategorie, bestand, zustand, status };

    artikelListe.push(neuerArtikel);
    saveArtikel(artikelListe);

    logToFile(`Artikel-ID ${neueId} erstellt von ${req.user?.username || 'Unbekannt'}`);

    res.status(201).json({ message: 'Artikel hinzugefügt', artikel: neuerArtikel });
});

// Meldung erfassen
app.post('/api/meldung', verifyToken, (req: RequestWithUser, res: Response): void => {
    const { id, fehler } = req.body;

    if (!id || !fehler) {
        res.status(400).json({ message: 'ID oder Fehlertext fehlt' });
        return;
    }

    const index = artikelListe.findIndex((a) => a.id === id);
    if (index === -1) {
        res.status(404).json({ message: 'Artikel nicht gefunden' });
        return;
    }

    artikelListe[index].fehler = fehler;
    saveArtikel(artikelListe);

    logToFile(`Artikel-ID ${id}: ${fehler}`); // enthält bereits ~username vom Frontend

    res.status(200).json({ message: 'Fehlermeldung gespeichert' });
});

// Meldung entfernen
app.delete('/api/artikel/:id/fehler', verifyToken, requireRole('owner'), (req: RequestWithUser, res: Response): void => {
    const id = parseInt(req.params.id, 10);
    const index = artikelListe.findIndex((a) => a.id === id);

    if (index === -1) {
        res.status(404).json({ message: 'Artikel nicht gefunden' });
        return;
    }

    delete artikelListe[index].fehler;
    saveArtikel(artikelListe);

    logToFile(`Artikel-ID ${id}: Fehler entfernt von ${req.user?.username || 'Unbekannt'}`);

    res.json({ message: 'Fehler entfernt' });
});

// Server starten
app.listen(3000, () => {
    console.log('✅ Backend läuft auf http://localhost:3000');
});
