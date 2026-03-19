import { useState, useEffect } from "react";

const API = "http://localhost:8080/api";

function App() {
  const [pojistenci, setPojistenci] = useState([]);
  const [vybrany, setVybrany] = useState(null);
  const [pojisteni, setPojisteni] = useState([]);
  const [formOsoba, setFormOsoba] = useState({ jmeno: "", prijmeni: "", vek: "", telefon: "", email: "" });
  const [formPojisteni, setFormPojisteni] = useState({ nazev: "", typ: "", popis: "", castka: "" });
  const [editOsoba, setEditOsoba] = useState(null);
  const [editPojisteni, setEditPojisteni] = useState(null);

  // Načte všechny pojištěnce při startu
  useEffect(() => { nactiPojistence(); }, []);

  const nactiPojistence = () =>
    fetch(`${API}/pojistenci`).then(r => r.json()).then(setPojistenci);

  const nactiPojisteni = (id) =>
    fetch(`${API}/pojisteni?pojistenecId=${id}`).then(r => r.json()).then(setPojisteni);

  const vyberPojistence = (p) => {
    setVybrany(p);
    nactiPojisteni(p.id);
    setEditOsoba(null);
    setEditPojisteni(null);
  };

  // Přidání / editace pojištěnce
  const ulozOsobu = () => {
    const url = editOsoba ? `${API}/pojistenci/${editOsoba.id}` : `${API}/pojistenci`;
    const method = editOsoba ? "PUT" : "POST";
    fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formOsoba) })
      .then(() => { nactiPojistence(); setFormOsoba({ jmeno: "", prijmeni: "", vek: "", telefon: "", email: "" }); setEditOsoba(null); });
  };

  const smazOsobu = (id) => {
    fetch(`${API}/pojistenci/${id}`, { method: "DELETE" }).then(nactiPojistence);
  };

  const zacniEditOsobu = (p) => {
    setEditOsoba(p);
    setFormOsoba({ jmeno: p.jmeno, prijmeni: p.prijmeni, vek: p.vek, telefon: p.telefon, email: p.email });
  };

  // Přidání / editace pojištění
  const ulozPojisteni = () => {
    const data = { ...formPojisteni, pojistenec: { id: vybrany.id } };
    const url = editPojisteni ? `${API}/pojisteni/${editPojisteni.id}` : `${API}/pojisteni`;
    const method = editPojisteni ? "PUT" : "POST";
    fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
      .then(() => { nactiPojisteni(vybrany.id); setFormPojisteni({ nazev: "", typ: "", popis: "", castka: "" }); setEditPojisteni(null); });
  };

  const smazPojisteni = (id) => {
    fetch(`${API}/pojisteni/${id}`, { method: "DELETE" }).then(() => nactiPojisteni(vybrany.id));
  };

  const zacniEditPojisteni = (p) => {
    setEditPojisteni(p);
    setFormPojisteni({ nazev: p.nazev, typ: p.typ, popis: p.popis, castka: p.castka });
  };

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>Evidence pojištění</h1>

      {/* Formulář pojištěnce */}
      <div style={{ background: "#f5f5f5", padding: 16, borderRadius: 8, marginBottom: 24 }}>
        <h2>{editOsoba ? "Editace pojištěnce" : "Přidat pojištěnce"}</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["jmeno", "prijmeni", "vek", "telefon", "email"].map(k => (
            <input key={k} placeholder={k} value={formOsoba[k]}
              onChange={e => setFormOsoba({ ...formOsoba, [k]: e.target.value })}
              style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }} />
          ))}
          <button onClick={ulozOsobu} style={{ padding: "8px 16px", background: "#1976d2", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
            {editOsoba ? "Uložit" : "Přidat"}
          </button>
          {editOsoba && <button onClick={() => { setEditOsoba(null); setFormOsoba({ jmeno: "", prijmeni: "", vek: "", telefon: "", email: "" }); }}
            style={{ padding: "8px 16px", border: "1px solid #ccc", borderRadius: 4, cursor: "pointer" }}>Zrušit</button>}
        </div>
      </div>

      {/* Seznam pojištěnců */}
      <h2>Pojištěnci</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
        <thead>
          <tr style={{ background: "#1976d2", color: "#fff" }}>
            {["Jméno", "Příjmení", "Věk", "Telefon", "Email", "Akce"].map(h => (
              <th key={h} style={{ padding: 10, textAlign: "left" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pojistenci.map(p => (
            <tr key={p.id} onClick={() => vyberPojistence(p)}
              style={{ cursor: "pointer", background: vybrany?.id === p.id ? "#e3f2fd" : "white", borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 10 }}>{p.jmeno}</td>
              <td style={{ padding: 10 }}>{p.prijmeni}</td>
              <td style={{ padding: 10 }}>{p.vek}</td>
              <td style={{ padding: 10 }}>{p.telefon}</td>
              <td style={{ padding: 10 }}>{p.email}</td>
              <td style={{ padding: 10 }}>
                <button onClick={e => { e.stopPropagation(); zacniEditOsobu(p); }}
                  style={{ marginRight: 8, padding: "4px 10px", cursor: "pointer" }}>Editovat</button>
                <button onClick={e => { e.stopPropagation(); smazOsobu(p.id); }}
                  style={{ padding: "4px 10px", background: "#e53935", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>Smazat</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Detail pojištěnce + jeho pojištění */}
      {vybrany && (
        <div style={{ background: "#f5f5f5", padding: 16, borderRadius: 8 }}>
          <h2>Pojištění: {vybrany.jmeno} {vybrany.prijmeni}</h2>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {["nazev", "typ", "popis", "castka"].map(k => (
              <input key={k} placeholder={k} value={formPojisteni[k]}
                onChange={e => setFormPojisteni({ ...formPojisteni, [k]: e.target.value })}
                style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }} />
            ))}
            <button onClick={ulozPojisteni} style={{ padding: "8px 16px", background: "#388e3c", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
              {editPojisteni ? "Uložit" : "Přidat pojištění"}
            </button>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#388e3c", color: "#fff" }}>
                {["Název", "Typ", "Popis", "Částka", "Akce"].map(h => (
                  <th key={h} style={{ padding: 10, textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pojisteni.map(p => (
                <tr key={p.id} style={{ borderBottom: "1px solid #eee", background: "white" }}>
                  <td style={{ padding: 10 }}>{p.nazev}</td>
                  <td style={{ padding: 10 }}>{p.typ}</td>
                  <td style={{ padding: 10 }}>{p.popis}</td>
                  <td style={{ padding: 10 }}>{p.castka} Kč</td>
                  <td style={{ padding: 10 }}>
                    <button onClick={() => zacniEditPojisteni(p)}
                      style={{ marginRight: 8, padding: "4px 10px", cursor: "pointer" }}>Editovat</button>
                    <button onClick={() => smazPojisteni(p.id)}
                      style={{ padding: "4px 10px", background: "#e53935", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>Smazat</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;