import fs from 'fs';
import path from 'path';

const FILE_PATH = path.join(__dirname, '../inventory.json');

export type Artikel = {
    id: number;
    name: string;
    kategorie: string;
    bestand: number;
    zustand: string;
    status: string;
    fehler?: string;
};

export const loadArtikel = (): Artikel[] => {
    if (!fs.existsSync(FILE_PATH)) fs.writeFileSync(FILE_PATH, '[]');
    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(raw);
};

export const saveArtikel = (artikel: Artikel[]) => {
    fs.writeFileSync(FILE_PATH, JSON.stringify(artikel, null, 2));
};