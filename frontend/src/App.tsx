import { useEffect, useState } from 'react';
import './App.css';

type Artikel = {
  id: number;
  name: string;
  kategorie: string;
  bestand: number;
  zustand: string;
  status: string;
  fehler?: string;
};

type SortKey = keyof Artikel;

function App() {
  const [artikelListe, setArtikelListe] = useState<Artikel[]>([]);
  const [ladeStatus, setLadeStatus] = useState('Lade...');
  const [meldeName, setMeldeName] = useState('');
  const [meldeText, setMeldeText] = useState('');


  // Felder für neuen Artikel
  const [name, setName] = useState('');
  const [kategorie, setKategorie] = useState('');
  const [bestand, setBestand] = useState(0);
  const [zustand, setZustand] = useState('');
  const [status, setStatus] = useState('');

  const [listenAnsicht, setListenAnsicht] = useState<'karte' | 'tabelle'>('karte');
  const [kartenLayout, setKartenLayout] = useState<'vertikal' | 'horizontal'>('vertikal');

  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortAsc, setSortAsc] = useState(true);

  const exportCSV = () => {
    const header = ['ID', 'Name', 'Kategorie', 'Bestand', 'Zustand', 'Status', 'Fehler'];
    const rows = artikelListe.map(a => [
      a.id,
      a.name,
      a.kategorie,
      a.bestand,
      a.zustand,
      a.status,
      a.fehler ?? ''
    ]);

    const csvContent = [
      header.join(','),
      ...rows.map(row => row.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'lagerartikel.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ladeArtikel = () => {
    fetch('http://localhost:3000/api/artikel')
      .then((res) => res.json())
      .then((daten) => {
        setArtikelListe(daten);
        setLadeStatus('');
      })
      .catch((err) => {
        console.error(err);
        setLadeStatus('Fehler beim Laden der Artikelliste');
      });
  };

  useEffect(() => {
    ladeArtikel();
  }, []);

  const defektMelden = () => {
    const artikel = artikelListe.find((a) => a.name.toLowerCase() === meldeName.toLowerCase());
    if (!artikel || !meldeText) return;

    fetch('http://localhost:3000/api/meldung', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: artikel.id, fehler: meldeText }),
    });

    setArtikelListe((prev) =>
      prev.map((a) =>
        a.id === artikel.id ? { ...a, fehler: meldeText } : a
      )
    );

    setMeldeName('');
    setMeldeText('');
  };

  const artikelHinzufuegen = () => {
    if (!name || !kategorie || bestand < 0 || !zustand || !status) return;

    fetch('http://localhost:3000/api/artikel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, kategorie, bestand, zustand, status }),
    })
      .then((res) => res.json())
      .then(() => {
        ladeArtikel();
        setName('');
        setKategorie('');
        setBestand(0);
        setZustand('');
        setStatus('');
      });
  };

  const sortierteArtikel = [...artikelListe].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];

    if (aVal === undefined || bVal === undefined) return 0;

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortAsc ? aVal - bVal : bVal - aVal;
    }

    return sortAsc
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>📦 Lagerverwaltung</h1>
        <div className="melden-box">
          <input
            placeholder="Artikelname"
            value={meldeName}
            onChange={(e) => setMeldeName(e.target.value)}
          />
          <input
            placeholder="Fehlerbeschreibung"
            value={meldeText}
            onChange={(e) => setMeldeText(e.target.value)}
          />
          <button className="melden-button" onClick={defektMelden}>
            Melden
          </button>
        </div>
      </header>

      <h2>➕ Neuen Artikel hinzufügen</h2>
      <div className="formular">
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Kategorie" value={kategorie} onChange={(e) => setKategorie(e.target.value)} />
        <input
          placeholder="Bestand"
          type="number"
          value={bestand}
          onChange={(e) => setBestand(Number(e.target.value))}
        />
        <input placeholder="Zustand" value={zustand} onChange={(e) => setZustand(e.target.value)} />
        <input placeholder="Status" value={status} onChange={(e) => setStatus(e.target.value)} />
        <button className="hinzufuegen-button" onClick={artikelHinzufuegen}>
          Artikel hinzufügen
        </button>
      </div>

      <h2>📋 Artikelliste</h2>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => setListenAnsicht(listenAnsicht === 'karte' ? 'tabelle' : 'karte')}>
          Ansicht wechseln: {listenAnsicht === 'karte' ? '🗒️ Tabelle' : '📦 Karten'}
        </button>
        {listenAnsicht === 'karte' && (
          <>
            <button onClick={() => setKartenLayout('vertikal')}>⬇️ Vertikal</button>
            <button onClick={() => setKartenLayout('horizontal')}>➡️ Horizontal</button>
            <button onClick={exportCSV}>📤 CSV exportieren</button>
          </>
        )}
      </div>

      {ladeStatus && <p>{ladeStatus}</p>}

      {listenAnsicht === 'karte' ? (
        <div className={`artikel-liste ${kartenLayout}`}>
          {sortierteArtikel.map((artikel) => (
            <div key={artikel.id} className="artikel-card">
              <h3>{artikel.name} <span className="kategorie">({artikel.kategorie})</span></h3>
              <p>Bestand: {artikel.bestand}</p>
              <p>Zustand: {artikel.zustand}</p>
              <p>Status: {artikel.status}</p>
              {artikel.fehler && (
                <div className="fehler-hinweis">
                  ⚠️ {artikel.fehler}
                  <button
                    className="entfernen-button"
                    onClick={() => {
                      setArtikelListe((prev) =>
                        prev.map((a) =>
                          a.id === artikel.id ? { ...a, fehler: undefined } : a
                        )
                      );
                    }}
                  >
                    ❌
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <table className="artikel-tabelle">
          <thead>
            <tr>
              {(['id', 'name', 'kategorie', 'bestand', 'zustand', 'status', 'fehler'] as SortKey[]).map((key) => (
                <th key={key} onClick={() => handleSort(key)}>
                  {key.toUpperCase()} {sortKey === key ? (sortAsc ? '▲' : '▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortierteArtikel.map((artikel) => (
              <tr key={artikel.id}>
                <td>{artikel.id}</td>
                <td>{artikel.name}</td>
                <td>{artikel.kategorie}</td>
                <td>{artikel.bestand}</td>
                <td>{artikel.zustand}</td>
                <td>{artikel.status}</td>
                <td>{artikel.fehler ? `⚠️ ${artikel.fehler}` : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
