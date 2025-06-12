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
  const [listenAnsicht, setListenAnsicht] = useState<'karte' | 'tabelle'>('karte');
  const [kartenLayout, setKartenLayout] = useState<'vertikal' | 'horizontal'>('vertikal');
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortAsc, setSortAsc] = useState(true);

  const [name, setName] = useState('');
  const [kategorie, setKategorie] = useState('');
  const [bestand, setBestand] = useState(0);
  const [zustand, setZustand] = useState('');
  const [status, setStatus] = useState('');

  const [meldeName, setMeldeName] = useState('');
  const [meldeText, setMeldeText] = useState('');

  const [loggedIn, setLoggedIn] = useState<boolean>(!!localStorage.getItem('token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));

  const [fehlerMeldung, setFehlerMeldung] = useState('');

  const API = 'http://localhost:3000';

  const ladeArtikel = () => {
    const token = localStorage.getItem('token');
    fetch(`${API}/api/artikel`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((daten) => {
        setArtikelListe(daten);
        setLadeStatus('');
      })
      .catch(() => {
        setLadeStatus('Fehler beim Laden der Artikelliste');
      });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`${API}/api/verify-token`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Ungültiger Token");
        ladeArtikel();
      })
      .catch(() => {
        localStorage.clear();
        setLoggedIn(false);
        setArtikelListe([]);
      });
  }, []);

  const login = () => {
    fetch(`${API}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('role', data.role);
          localStorage.setItem('username', username);
          setLoggedIn(true);
          setRole(data.role);
          ladeArtikel();
        } else {
          alert('Login fehlgeschlagen');
        }
      });
  };

  const logout = () => {
    localStorage.clear();
    setLoggedIn(false);
    setArtikelListe([]);
  };

  const artikelHinzufuegen = () => {
    if (!name || !kategorie || bestand === null || bestand < 0 || !zustand || !status) {
      setFehlerMeldung("❌ Bitte fülle alle Felder korrekt aus.");
      return;
    }

    fetch(`${API}/api/artikel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ name, kategorie, bestand, zustand, status }),
    })
      .then(() => {
        ladeArtikel();
        setName('');
        setKategorie('');
        setBestand(0);
        setZustand('');
        setStatus('');
        setFehlerMeldung('');
      });
  };

  const fehlerEntfernen = async (id: number) => {
    const confirmed = window.confirm("Willst du die Meldung wirklich entfernen?");
    if (!confirmed) return;

    try {
      const res = await fetch(`${API}/api/artikel/${id}/fehler`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (res.ok) {
        ladeArtikel();
      } else {
        alert("Fehler konnte nicht gelöscht werden");
      }
    } catch (err) {
      console.error("Fehler beim Löschen:", err);
      alert("Verbindungsfehler");
    }
  };

  const defektMelden = () => {
    const artikel = artikelListe.find((a) => a.name.toLowerCase() === meldeName.toLowerCase());
    if (!artikel || !meldeText) return;

    const meldung = `${meldeText} ~${localStorage.getItem('username')}`;

    fetch(`${API}/api/meldung`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ id: artikel.id, fehler: meldung }),
    }).then(() => ladeArtikel());

    setMeldeName('');
    setMeldeText('');
  };

  const exportCSV = () => {
    const header = ['ID', 'Name', 'Kategorie', 'Bestand', 'Zustand', 'Status', 'Fehler'];
    const rows = artikelListe.map(a => [
      a.id, a.name, a.kategorie, a.bestand, a.zustand, a.status, a.fehler ?? ''
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

  const sortierteArtikel = [...artikelListe].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortAsc ? aVal - bVal : bVal - aVal;
    }
    return sortAsc
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  if (!loggedIn) {
    return (
      <div className="login-form">
        <h2>🔐 Login</h2>
        <input placeholder="Benutzername" value={username} onChange={e => setUsername(e.target.value)} />
        <input placeholder="Passwort" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={login}>Anmelden</button>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <h1>📦 Lagerverwaltung</h1>
        <button onClick={logout}>🚪 Logout</button>
      </header>

      {role === 'owner' && (
        <>
          <h2>➕ Artikel hinzufügen</h2>
          <div className="formular">
            <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
            <input placeholder="Kategorie" value={kategorie} onChange={e => setKategorie(e.target.value)} />
            <input type="number" placeholder="Bestand" value={bestand} onChange={e => setBestand(Number(e.target.value))} />
            <input placeholder="Zustand" value={zustand} onChange={e => setZustand(e.target.value)} />
            <input placeholder="Status" value={status} onChange={e => setStatus(e.target.value)} />
            <button onClick={artikelHinzufuegen}>Artikel hinzufügen</button>
          </div>
          {fehlerMeldung && (
            <div style={{
              backgroundColor: '#ffcccc',
              color: '#900',
              padding: '10px',
              marginTop: '10px',
              borderRadius: '5px',
              fontWeight: 'bold'
            }}>
              {fehlerMeldung}
            </div>
          )}
        </>
      )}

      <h2>📋 Artikelliste</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => setListenAnsicht(listenAnsicht === 'karte' ? 'tabelle' : 'karte')}>
          Ansicht wechseln: {listenAnsicht === 'karte' ? '🗒️ Tabelle' : '📦 Karten'}
        </button>
        {listenAnsicht === 'karte' && (
          <>
            <button onClick={() => setKartenLayout('vertikal')}>⬇️ Vertikal</button>
            <button onClick={() => setKartenLayout('horizontal')}>➡️ Horizontal</button>
          </>
        )}
        <button onClick={exportCSV}>📤 CSV exportieren</button>
      </div>

      {ladeStatus && <p>{ladeStatus}</p>}

      <div className={listenAnsicht === 'karte' ? `artikel-liste ${kartenLayout}` : ''}>
        {listenAnsicht === 'karte' ? (
          sortierteArtikel.map((artikel) => (
            <div key={artikel.id} className="artikel-card">
              <h3>{artikel.name} <span className="kategorie">({artikel.kategorie})</span></h3>
              <p>Bestand: {artikel.bestand}</p>
              <p>Zustand: {artikel.zustand}</p>
              <p>Status: {artikel.status}</p>
              {artikel.fehler && (
                <div className="fehler-hinweis">
                  ⚠️ {artikel.fehler}
                  {role === 'owner' && (
                    <button onClick={() => fehlerEntfernen(artikel.id)} style={{ marginLeft: '10px' }}>
                      ❌ Fehler entfernen
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
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
              {sortierteArtikel.map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{a.name}</td>
                  <td>{a.kategorie}</td>
                  <td>{a.bestand}</td>
                  <td>{a.zustand}</td>
                  <td>{a.status}</td>
                  <td>{a.fehler}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h2>🛠️ Meldung erfassen</h2>
      <div className="melden-box">
        <input placeholder="Artikelname" value={meldeName} onChange={e => setMeldeName(e.target.value)} />
        <input placeholder="Fehlerbeschreibung" value={meldeText} onChange={e => setMeldeText(e.target.value)} />
        <button onClick={defektMelden}>Melden</button>
      </div>
    </div>
  );
}

export default App;
