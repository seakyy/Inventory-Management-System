import mongoose from 'mongoose';

export type Artikel = {
    id: number;
    name: string;
    kategorie: string;
    bestand: number;
    zustand: string;
    status: string;
    fehler?: string;
};

const ArtikelSchema = new mongoose.Schema<Artikel>({
    id: { type: Number, required: true, unique: true },
    name: String,
    kategorie: String,
    bestand: Number,
    zustand: String,
    status: String,
    fehler: String
});

export const ArtikelModel = mongoose.model('Artikel', ArtikelSchema);

export const loadArtikel = async () => {
    return await ArtikelModel.find().sort({ id: 1 });
};

export const addArtikel = async (artikel: Artikel) => {
    const neuerArtikel = new ArtikelModel(artikel);
    await neuerArtikel.save();
};

export const updateArtikel = async (id: number, update: Partial<Artikel>) => {
    await ArtikelModel.updateOne({ id }, { $set: update });
};

export const removeFehler = async (id: number) => {
    await ArtikelModel.updateOne({ id }, { $unset: { fehler: '' } });
};

export const findeNaechsteId = async (): Promise<number> => {
    const letzter = await ArtikelModel.findOne().sort({ id: -1 }).lean();
    return letzter ? letzter.id + 1 : 1;
};

export const gruppiereNachKategorie = async () => {
    return await ArtikelModel.aggregate([
        { $group: { _id: '$kategorie', anzahl: { $sum: 1 } } }
    ]);
};

export const zaehleDefekteArtikel = async () => {
    return await ArtikelModel.countDocuments({ fehler: { $exists: true } });
};
