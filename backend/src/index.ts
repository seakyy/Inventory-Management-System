import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Artikel, loadArtikel, saveArtikel } from './artikelStore';
import { findUser } from './userStore';
import { generateToken, verifyToken, requireRole } from './auth';

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

let artikelListe = loadArtikel();

app.post('/api/login', (req: Request, res: Response): void => {
    const { username, password } = req.body;
    const user = findUser(username);
    if (!user || user.password !== password) {
        res.status(401).json({ message: 'Ungültige Anmeldedaten' });
        return;
    }

    const token = generateToken({ username: user.username, role: user.role });
    res.json({ token, role: user.role });
});

app.get('/api/artikel', verifyToken, (req: Request, res: Response): void => {
    artikelListe = loadArtikel();
    res.json(artikelListe);
});

app.post('/api/artikel', verifyToken, requireRole('owner'), (req: Request, res: Response): void => {
    const { name, kategorie, bestand, zustand, status } = req.body;

    if (!name || !kategorie || bestand === undefined || !zustand || !status) {
        res.status(400).json({ message: 'Fehlende Felder' });
        return;
    }

    const neueId = artikelListe.length > 0 ? artikelListe[artikelListe.length - 1].id + 1 : 1;
    const neuerArtikel: Artikel = { id: neueId, name, kategorie, bestand, zustand, status };

    artikelListe.push(neuerArtikel);
    saveArtikel(artikelListe);

    res.status(201).json({ message: 'Artikel hinzugefügt', artikel: neuerArtikel });
});

app.delete('/api/artikel/:id/fehler', verifyToken, requireRole('owner'), (req: Request, res: Response): void => {
    const id = parseInt(req.params.id, 10);
    const index = artikelListe.findIndex((a) => a.id === id);

    if (index === -1) {
        res.status(404).json({ message: 'Artikel nicht gefunden' });
        return;
    }

    delete artikelListe[index].fehler;
    saveArtikel(artikelListe);

    res.json({ message: 'Fehler entfernt' });
});

app.listen(3000, () => {
    console.log('✅ Backend läuft auf http://localhost:3000');
});
