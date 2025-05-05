import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json());

type Artikel = {
    id: number;
    name: string;
    kategorie: string;
    bestand: number;
    zustand: string;
    status: string;
    fehler?: string;
};

const artikel: Artikel[] = [];

const logMeldung = (id: number, fehler: string) => {
    const timestamp = new Date().toISOString();
    const logEintrag = `[${timestamp}] Artikel-ID ${id}: ${fehler}\n`;
    fs.appendFileSync('log.txt', logEintrag);
};

app.get('/', (req: Request, res: Response) => {
    res.send('Willkommen beim Lagerverwaltungs-Backend');
});

app.get('/api/health', (req: Request, res: Response) => {
    res.send('Backend läuft!');
});

app.get('/api/artikel', (req: Request, res: Response) => {
    res.json(artikel);
});

app.post('/api/artikel', (req: Request, res: Response): void => {
    const { name, kategorie, bestand, zustand, status } = req.body;

    // Eingaben prüfen
    if (!name || !kategorie || bestand === undefined || !zustand || !status) {
        res.status(400).json({ message: 'Fehlende oder ungültige Felder' });
        return;
    }

    // Neue ID bestimmen (einfacher Auto-Inkrement)
    const neueId = artikel.length > 0 ? artikel[artikel.length - 1].id + 1 : 1;

    const neuerArtikel: Artikel = {
        id: neueId,
        name,
        kategorie,
        bestand,
        zustand,
        status,
    };

    artikel.push(neuerArtikel);

    res.status(201).json({ message: 'Artikel hinzugefügt', artikel: neuerArtikel });
});


app.post('/api/meldung', (req: Request, res: Response): void => {
    const { id, fehler } = req.body;

    if (!id || !fehler) {
        res.status(400).json({ message: 'Fehlende Daten' });
        return;
    }

    logMeldung(id, fehler);

    const index = artikel.findIndex((a) => a.id === id);
    if (index !== -1) {
        artikel[index].fehler = fehler;
    }

    res.json({ message: 'Meldung protokolliert' });
});

app.listen(3000, () => {
    console.log('✅ Server läuft auf http://localhost:3000');
});
