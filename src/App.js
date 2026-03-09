import { useState } from "react";

const ADVISORS = ["Sandra", "Loïc", "Heliot", "Marie"];

const DOCUMENT_LIST = [
  { id: "carte_pro", label: "Carte professionnelle en cours de validité", icon: "🪪" },
  { id: "rib", label: "RIB", icon: "🏦" },
  { id: "cni", label: "CNI du gérant détenteur de la carte", icon: "📋" },
  { id: "kbis", label: "Extrait K-bis (moins de 3 mois)", icon: "📄" },
  { id: "siret", label: "SIRET de l'agence payeuse et/ou exploitante", icon: "🔢" },
];

const INFO_LIST = [
  { id: "enseigne", label: "Nom de l'enseigne et adresse postale", icon: "🏠" },
  { id: "points_vente", label: "Nombre de points de vente", icon: "📍" },
  { id: "services", label: "Services proposés aux particuliers", icon: "⚙️" },
  { id: "logiciel", label: "Logiciel Transaction", icon: "💻" },
  { id: "email_direction", label: "E-mail de la direction", icon: "✉️" },
  { id: "facturation", label: "Coordonnées et adresse de facturation", icon: "📬" },
  { id: "email_agence", label: "E-mail et numéros de l'agence", icon: "📞" },
  { id: "email_collaborateurs", label: "E-mail des collaborateurs", icon: "👥" },
  { id: "assistante", label: "Coordonnées de l'assistante de direction", icon: "👩‍💼" },
  { id: "formation", label: "Mode de formation (renouvellement carte T)", icon: "🎓" },
];

const COMM_LIST = [
  { id: "logo", label: "Logo en JPG / PNG", icon: "🎨" },
  { id: "photos", label: "Photos équipe, agence & gérant (1920×1080)", icon: "📸" },
  { id: "presentation", label: "Présentation de l'agence (réseaux sociaux)", icon: "📝" },
];

const MOCK_CLIENTS = [
  {
    id: 1,
    name: "Agence Prestige Avignon",
    advisor: "Sandra",
    createdAt: "2026-02-15",
    status: "in_progress",
    docs: { carte_pro: true, rib: true, cni: false, kbis: false, siret: true },
    infos: { enseigne: true, points_vente: true, services: false, logiciel: false, email_direction: true, facturation: false, email_agence: false, email_collaborateurs: false, assistante: false, formation: false },
    comms: { logo: true, photos: false, presentation: false },
    lastContact: "2026-03-01",
    email: "contact@prestige-avignon.fr",
    phone: "+33 4 90 12 34 56",
  },
  {
    id: 2,
    name: "Century 21 Marseille Nord",
    advisor: "Loïc",
    createdAt: "2026-03-01",
    status: "complete",
    docs: { carte_pro: true, rib: true, cni: true, kbis: true, siret: true },
    infos: { enseigne: true, points_vente: true, services: true, logiciel: true, email_direction: true, facturation: true, email_agence: true, email_collaborateurs: true, assistante: true, formation: true },
    comms: { logo: true, photos: true, presentation: true },
    lastContact: "2026-03-05",
    email: "direction@c21-marseille.fr",
    phone: "+33 4 91 22 33 44",
  },
  {
    id: 3,
    name: "IAD France - Lyon Part-Dieu",
    advisor: "Marie",
    createdAt: "2026-03-06",
    status: "pending",
    docs: { carte_pro: false, rib: false, cni: false, kbis: false, siret: false },
    infos: { enseigne: true, points_vente: false, services: false, logiciel: false, email_direction: true, facturation: false, email_agence: false, email_collaborateurs: false, assistante: false, formation: false },
    comms: { logo: false, photos: false, presentation: false },
    lastContact: "2026-03-06",
    email: "lyon.partdieu@iad.fr",
    phone: "+33 4 72 11 22 33",
  },
  {
    id: 4,
    name: "Foncia Premium Bordeaux",
    advisor: "Heliot",
    createdAt: "2026-02-28",
    status: "in_progress",
    docs: { carte_pro: true, rib: false, cni: true, kbis: false, siret: false },
    infos: { enseigne: true, points_vente: true, services: true, logiciel: false, email_direction: true, facturation: true, email_agence: false, email_collaborateurs: false, assistante: false, formation: false },
    comms: { logo: true, photos: false, presentation: false },
    lastContact: "2026-03-03",
    email: "bordeaux@foncia.fr",
    phone: "+33 5 56 44 55 66",
  },
];

const getProgress = (client) => {
  const allItems = [...Object.values(client.docs), ...Object.values(client.infos), ...Object.values(client.comms)];
  const done = allItems.filter(Boolean).length;
  return Math.round((done / allItems.length) * 100);
};

const getStatusColor = (status) => {
  if (status === "complete") return "#34C759";
  if (status === "in_progress") return "#FF9F0A";
  return "#FF3B30";
};

const getStatusLabel = (status) => {
  if (status === "complete") return "Complet";
  if (status === "in_progress") return "En cours";
  return "En attente";
};

const RELANCE_TEMPLATES = [
  { id: 1, name: "Relance J+3", channel: "email", delay: 3, message: "Bonjour {nom}, nous attendons encore vos documents pour finaliser votre dossier d'adhésion au réseau GNI." },
  { id: 2, name: "Relance J+7", channel: "sms", delay: 7, message: "GNI : Bonjour {nom}, votre dossier est incomplet. Merci de compléter vos documents dès que possible." },
  { id: 3, name: "Relance J+14", channel: "whatsapp", delay: 14, message: "Bonjour {nom} 👋 Votre dossier d'adhésion GNI est en attente. Nous sommes disponibles pour vous aider !" },
];

export default function GNIApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginRole, setLoginRole] = useState("advisor");
  const [loginName, setLoginName] = useState("Sandra");
  const [view, setView] = useState("dashboard");
  const [clients, setClients] = useState(MOCK_CLIENTS);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientAdvisor, setNewClientAdvisor] = useState("Sandra");
  const [relanceTemplates, setRelanceTemplates] = useState(RELANCE_TEMPLATES);
  const [activeTab, setActiveTab] = useState("docs");
  const [notification, setNotification] = useState(null);

  const showNotif = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogin = () => {
    if (loginRole === "admin") {
      setCurrentUser({ role: "admin", name: "Dorian" });
    } else {
      setCurrentUser({ role: "advisor", name: loginName });
    }
    setView("dashboard");
  };

  const visibleClients = currentUser?.role === "admin"
    ? clients
    : clients.filter((c) => c.advisor === currentUser?.name);

  const toggleItem = (clientId, category, itemId) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        const updated = { ...c, [category]: { ...c[category], [itemId]: !c[category][itemId] } };
        const prog = getProgress(updated);
        updated.status = prog === 100 ? "complete" : prog === 0 ? "pending" : "in_progress";
        return updated;
      })
    );
  };

  const addClient = () => {
    if (!newClientName.trim()) return;
    const nc = {
      id: Date.now(),
      name: newClientName,
      advisor: newClientAdvisor,
      createdAt: new Date().toISOString().split("T")[0],
      status: "pending",
      docs: Object.fromEntries(DOCUMENT_LIST.map((d) => [d.id, false])),
      infos: Object.fromEntries(INFO_LIST.map((i) => [i.id, false])),
      comms: Object.fromEntries(COMM_LIST.map((c) => [c.id, false])),
      lastContact: new Date().toISOString().split("T")[0],
      email: newClientEmail,
      phone: newClientPhone,
    };
    setClients((prev) => [...prev, nc]);
    setShowNewClient(false);
    setNewClientName("");
    setNewClientEmail("");
    setNewClientPhone("");
    showNotif("Client ajouté avec succès !");
  };

  const sendRelance = (clientId, channel) => {
    showNotif(`Relance ${channel} envoyée !`);
  };

  // LOGIN SCREEN
  if (!currentUser) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(145deg, #f5f5f7 0%, #e8e8ed 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      }}>
        <div style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px)",
          borderRadius: 24,
          padding: "48px 40px",
          width: 380,
          boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
          border: "1px solid rgba(255,255,255,0.9)",
        }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: "linear-gradient(135deg, #0071e3, #00c7be)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", fontSize: 28,
              boxShadow: "0 4px 16px rgba(0,113,227,0.3)"
            }}>🏢</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1d1d1f", letterSpacing: -0.5 }}>GNI Onboarding</div>
            <div style={{ fontSize: 13, color: "#86868b", marginTop: 4 }}>Groupe National de l'Immobilier</div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#86868b", letterSpacing: 0.5, textTransform: "uppercase" }}>Connexion en tant que</label>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              {["advisor", "admin"].map((r) => (
                <button key={r} onClick={() => setLoginRole(r)} style={{
                  flex: 1, padding: "10px 0", borderRadius: 10, border: "none", cursor: "pointer",
                  background: loginRole === r ? "#0071e3" : "#f2f2f7",
                  color: loginRole === r ? "white" : "#1d1d1f",
                  fontSize: 13, fontWeight: 600,
                  transition: "all 0.2s",
                }}>
                  {r === "admin" ? "👑 Admin" : "👤 Conseiller"}
                </button>
              ))}
            </div>
          </div>

          {loginRole === "advisor" && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#86868b", letterSpacing: 0.5, textTransform: "uppercase" }}>Votre nom</label>
              <select value={loginName} onChange={(e) => setLoginName(e.target.value)} style={{
                width: "100%", padding: "12px 14px", marginTop: 8, borderRadius: 10,
                border: "1px solid #d1d1d6", background: "#fafafa", fontSize: 15,
                color: "#1d1d1f", outline: "none", appearance: "none",
              }}>
                {ADVISORS.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
          )}

          <button onClick={handleLogin} style={{
            width: "100%", padding: "14px 0", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, #0071e3, #00c7be)",
            color: "white", fontSize: 15, fontWeight: 600, cursor: "pointer",
            boxShadow: "0 4px 14px rgba(0,113,227,0.4)",
            transition: "transform 0.15s",
          }}>
            Se connecter →
          </button>
        </div>
      </div>
    );
  }

  // MAIN APP
  const stats = {
    total: visibleClients.length,
    complete: visibleClients.filter((c) => c.status === "complete").length,
    inProgress: visibleClients.filter((c) => c.status === "in_progress").length,
    pending: visibleClients.filter((c) => c.status === "pending").length,
  };

  const navItems = [
    { id: "dashboard", icon: "⊞", label: "Tableau de bord" },
    { id: "clients", icon: "🏢", label: "Dossiers clients" },
    ...(currentUser.role === "admin" ? [{ id: "relances", icon: "🔔", label: "Relances" }] : []),
    ...(currentUser.role === "admin" ? [{ id: "team", icon: "👥", label: "Équipe" }] : []),
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f5f7",
      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      display: "flex",
    }}>
      {/* Notification */}
      {notification && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: notification.type === "success" ? "#34C759" : "#FF3B30",
          color: "white", padding: "12px 20px", borderRadius: 12,
          fontSize: 14, fontWeight: 600,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          animation: "fadeIn 0.3s ease",
        }}>
          {notification.msg}
        </div>
      )}

      {/* SIDEBAR */}
      <div style={{
        width: 220, minHeight: "100vh",
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(0,0,0,0.06)",
        padding: "24px 16px",
        display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, paddingLeft: 8 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #0071e3, #00c7be)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}>🏢</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1d1d1f" }}>GNI</div>
            <div style={{ fontSize: 11, color: "#86868b" }}>Onboarding</div>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <button key={item.id} onClick={() => { setView(item.id); setSelectedClient(null); }} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 10, border: "none",
              background: view === item.id ? "linear-gradient(135deg, rgba(0,113,227,0.12), rgba(0,199,190,0.08))" : "transparent",
              color: view === item.id ? "#0071e3" : "#3a3a3c",
              fontSize: 13, fontWeight: view === item.id ? 600 : 500,
              cursor: "pointer", marginBottom: 4, textAlign: "left",
              transition: "all 0.2s",
            }}>
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{
          padding: "12px", borderRadius: 12,
          background: "linear-gradient(135deg, rgba(0,113,227,0.08), rgba(0,199,190,0.06))",
          border: "1px solid rgba(0,113,227,0.12)",
        }}>
          <div style={{ fontSize: 12, color: "#86868b", marginBottom: 4 }}>Connecté en tant que</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1d1d1f" }}>
            {currentUser.role === "admin" ? "👑 " : "👤 "}{currentUser.name}
          </div>
          <button onClick={() => setCurrentUser(null)} style={{
            marginTop: 8, fontSize: 11, color: "#86868b", background: "none",
            border: "none", cursor: "pointer", padding: 0,
          }}>Déconnexion →</button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: "32px 32px", overflowY: "auto" }}>

        {/* DASHBOARD */}
        {view === "dashboard" && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1d1d1f", margin: 0, letterSpacing: -0.5 }}>
                Bonjour {currentUser.name} 👋
              </h1>
              <p style={{ fontSize: 14, color: "#86868b", margin: "4px 0 0" }}>
                Voici l'état de vos dossiers en cours
              </p>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
              {[
                { label: "Total dossiers", value: stats.total, color: "#0071e3", bg: "rgba(0,113,227,0.08)" },
                { label: "Complets", value: stats.complete, color: "#34C759", bg: "rgba(52,199,89,0.08)" },
                { label: "En cours", value: stats.inProgress, color: "#FF9F0A", bg: "rgba(255,159,10,0.08)" },
                { label: "En attente", value: stats.pending, color: "#FF3B30", bg: "rgba(255,59,48,0.08)" },
              ].map((s) => (
                <div key={s.label} style={{
                  background: "white", borderRadius: 16, padding: "20px 20px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(0,0,0,0.04)",
                }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: "#86868b", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Recent clients */}
            <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1d1d1f", margin: 0 }}>Dossiers récents</h2>
                <button onClick={() => setView("clients")} style={{
                  fontSize: 13, color: "#0071e3", background: "none", border: "none", cursor: "pointer", fontWeight: 500,
                }}>Voir tous →</button>
              </div>
              {visibleClients.slice(0, 3).map((client) => {
                const prog = getProgress(client);
                return (
                  <div key={client.id} onClick={() => { setSelectedClient(client); setView("clients"); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 16,
                      padding: "14px 0", borderBottom: "1px solid #f2f2f7", cursor: "pointer",
                    }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: "linear-gradient(135deg, #f2f2f7, #e8e8ed)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                    }}>🏠</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f" }}>{client.name}</div>
                      <div style={{ fontSize: 12, color: "#86868b" }}>{client.advisor} · {client.createdAt}</div>
                    </div>
                    <div style={{ width: 80 }}>
                      <div style={{ height: 4, background: "#f2f2f7", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: `${prog}%`, height: "100%", background: prog === 100 ? "#34C759" : "#0071e3", borderRadius: 2 }} />
                      </div>
                      <div style={{ fontSize: 11, color: "#86868b", marginTop: 3, textAlign: "right" }}>{prog}%</div>
                    </div>
                    <div style={{
                      padding: "4px 10px", borderRadius: 20,
                      background: getStatusColor(client.status) + "20",
                      color: getStatusColor(client.status),
                      fontSize: 11, fontWeight: 600,
                    }}>{getStatusLabel(client.status)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CLIENTS VIEW */}
        {view === "clients" && !selectedClient && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1d1d1f", margin: 0, letterSpacing: -0.5 }}>Dossiers clients</h1>
                <p style={{ fontSize: 14, color: "#86868b", margin: "4px 0 0" }}>{visibleClients.length} agences en cours d'intégration</p>
              </div>
              <button onClick={() => setShowNewClient(true)} style={{
                padding: "10px 20px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg, #0071e3, #00c7be)",
                color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer",
                boxShadow: "0 4px 14px rgba(0,113,227,0.3)",
              }}>+ Nouveau client</button>
            </div>

            {/* New client modal */}
            {showNewClient && (
              <div style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
                backdropFilter: "blur(4px)",
              }}>
                <div style={{
                  background: "white", borderRadius: 20, padding: 32, width: 440,
                  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 24px", color: "#1d1d1f" }}>Nouveau dossier client</h2>
                  {[
                    { label: "Nom de l'agence *", value: newClientName, set: setNewClientName, placeholder: "Ex: Century 21 Paris 8e" },
                    { label: "Email", value: newClientEmail, set: setNewClientEmail, placeholder: "contact@agence.fr" },
                    { label: "Téléphone", value: newClientPhone, set: setNewClientPhone, placeholder: "+33 1 23 45 67 89" },
                  ].map((field) => (
                    <div key={field.label} style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#86868b", letterSpacing: 0.5, textTransform: "uppercase" }}>{field.label}</label>
                      <input value={field.value} onChange={(e) => field.set(e.target.value)}
                        placeholder={field.placeholder}
                        style={{
                          display: "block", width: "100%", padding: "11px 14px", marginTop: 6,
                          borderRadius: 10, border: "1px solid #d1d1d6", fontSize: 14,
                          outline: "none", boxSizing: "border-box",
                        }} />
                    </div>
                  ))}
                  {currentUser.role === "admin" && (
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#86868b", letterSpacing: 0.5, textTransform: "uppercase" }}>Conseiller assigné</label>
                      <select value={newClientAdvisor} onChange={(e) => setNewClientAdvisor(e.target.value)} style={{
                        display: "block", width: "100%", padding: "11px 14px", marginTop: 6,
                        borderRadius: 10, border: "1px solid #d1d1d6", fontSize: 14, outline: "none",
                      }}>
                        {ADVISORS.map((a) => <option key={a}>{a}</option>)}
                      </select>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => setShowNewClient(false)} style={{
                      flex: 1, padding: "12px 0", borderRadius: 10, border: "1px solid #d1d1d6",
                      background: "white", fontSize: 14, cursor: "pointer", color: "#3a3a3c",
                    }}>Annuler</button>
                    <button onClick={addClient} style={{
                      flex: 2, padding: "12px 0", borderRadius: 10, border: "none",
                      background: "linear-gradient(135deg, #0071e3, #00c7be)",
                      color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer",
                    }}>Créer le dossier</button>
                  </div>
                </div>
              </div>
            )}

            {/* Client cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
              {visibleClients.map((client) => {
                const prog = getProgress(client);
                return (
                  <div key={client.id} onClick={() => setSelectedClient(client)} style={{
                    background: "white", borderRadius: 16, padding: 20,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    border: "1px solid rgba(0,0,0,0.04)",
                    cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"; }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1f" }}>{client.name}</div>
                        <div style={{ fontSize: 12, color: "#86868b", marginTop: 3 }}>
                          {currentUser.role === "admin" ? `${client.advisor} · ` : ""}{client.createdAt}
                        </div>
                      </div>
                      <div style={{
                        padding: "4px 10px", borderRadius: 20,
                        background: getStatusColor(client.status) + "18",
                        color: getStatusColor(client.status),
                        fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
                      }}>{getStatusLabel(client.status)}</div>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: "#86868b" }}>Progression</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: prog === 100 ? "#34C759" : "#0071e3" }}>{prog}%</span>
                      </div>
                      <div style={{ height: 6, background: "#f2f2f7", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{
                          width: `${prog}%`, height: "100%",
                          background: prog === 100 ? "#34C759" : "linear-gradient(90deg, #0071e3, #00c7be)",
                          borderRadius: 3, transition: "width 0.4s ease",
                        }} />
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 6 }}>
                      {[
                        { label: "📄 Docs", count: Object.values(client.docs).filter(Boolean).length, total: DOCUMENT_LIST.length },
                        { label: "ℹ️ Infos", count: Object.values(client.infos).filter(Boolean).length, total: INFO_LIST.length },
                        { label: "🎨 Comm", count: Object.values(client.comms).filter(Boolean).length, total: COMM_LIST.length },
                      ].map((cat) => (
                        <div key={cat.label} style={{
                          flex: 1, padding: "6px 8px", borderRadius: 8,
                          background: "#f5f5f7", textAlign: "center",
                        }}>
                          <div style={{ fontSize: 10, color: "#86868b" }}>{cat.label}</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#1d1d1f" }}>{cat.count}/{cat.total}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CLIENT DETAIL */}
        {view === "clients" && selectedClient && (() => {
          const client = clients.find((c) => c.id === selectedClient.id);
          const prog = getProgress(client);
          return (
            <div>
              <button onClick={() => setSelectedClient(null)} style={{
                fontSize: 14, color: "#0071e3", background: "none", border: "none",
                cursor: "pointer", fontWeight: 500, marginBottom: 20, padding: 0,
              }}>← Retour aux dossiers</button>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
                {/* Left */}
                <div>
                  <div style={{ background: "white", borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1d1d1f", margin: "0 0 6px", letterSpacing: -0.5 }}>{client.name}</h1>
                        <div style={{ fontSize: 13, color: "#86868b" }}>
                          Conseiller : <strong style={{ color: "#1d1d1f" }}>{client.advisor}</strong> · Créé le {client.createdAt}
                        </div>
                        <div style={{ fontSize: 13, color: "#86868b", marginTop: 2 }}>
                          {client.email} · {client.phone}
                        </div>
                      </div>
                      <div style={{
                        padding: "6px 14px", borderRadius: 20,
                        background: getStatusColor(client.status) + "18",
                        color: getStatusColor(client.status),
                        fontSize: 13, fontWeight: 700,
                      }}>{getStatusLabel(client.status)}</div>
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: "#86868b" }}>Progression globale</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: prog === 100 ? "#34C759" : "#0071e3" }}>{prog}%</span>
                      </div>
                      <div style={{ height: 8, background: "#f2f2f7", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{
                          width: `${prog}%`, height: "100%",
                          background: prog === 100 ? "#34C759" : "linear-gradient(90deg, #0071e3, #00c7be)",
                          borderRadius: 4,
                        }} />
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    {[
                      { id: "docs", label: "📄 Documents", count: `${Object.values(client.docs).filter(Boolean).length}/${DOCUMENT_LIST.length}` },
                      { id: "infos", label: "ℹ️ Informations", count: `${Object.values(client.infos).filter(Boolean).length}/${INFO_LIST.length}` },
                      { id: "comms", label: "🎨 Communication", count: `${Object.values(client.comms).filter(Boolean).length}/${COMM_LIST.length}` },
                    ].map((tab) => (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                        padding: "8px 16px", borderRadius: 10, border: "none",
                        background: activeTab === tab.id ? "#0071e3" : "white",
                        color: activeTab === tab.id ? "white" : "#3a3a3c",
                        fontSize: 13, fontWeight: 600, cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      }}>
                        {tab.label} <span style={{ opacity: 0.7, fontSize: 11 }}>({tab.count})</span>
                      </button>
                    ))}
                  </div>

                  <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                    {activeTab === "docs" && DOCUMENT_LIST.map((item) => (
                      <CheckItem key={item.id} item={item} checked={client.docs[item.id]}
                        onToggle={() => toggleItem(client.id, "docs", item.id)} />
                    ))}
                    {activeTab === "infos" && INFO_LIST.map((item) => (
                      <CheckItem key={item.id} item={item} checked={client.infos[item.id]}
                        onToggle={() => toggleItem(client.id, "infos", item.id)} />
                    ))}
                    {activeTab === "comms" && COMM_LIST.map((item) => (
                      <CheckItem key={item.id} item={item} checked={client.comms[item.id]}
                        onToggle={() => toggleItem(client.id, "comms", item.id)} />
                    ))}
                  </div>
                </div>

                {/* Right: actions */}
                <div>
                  <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 16 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px", color: "#1d1d1f" }}>Envoyer une relance</h3>
                    {[
                      { ch: "email", label: "📧 Email", color: "#0071e3" },
                      { ch: "sms", label: "💬 SMS", color: "#34C759" },
                      { ch: "whatsapp", label: "📱 WhatsApp", color: "#25D366" },
                      { ch: "vocal", label: "🔊 Assistant vocal", color: "#FF9F0A" },
                    ].map((btn) => (
                      <button key={btn.ch} onClick={() => sendRelance(client.id, btn.label)}
                        style={{
                          width: "100%", padding: "10px 14px", marginBottom: 8,
                          borderRadius: 10, border: "none",
                          background: btn.color + "12", color: btn.color,
                          fontSize: 13, fontWeight: 600, cursor: "pointer",
                          textAlign: "left",
                        }}>
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px", color: "#1d1d1f" }}>Éléments manquants</h3>
                    {[
                      ...DOCUMENT_LIST.filter((d) => !client.docs[d.id]).map((d) => ({ ...d, cat: "Document" })),
                      ...INFO_LIST.filter((i) => !client.infos[i.id]).map((i) => ({ ...i, cat: "Info" })),
                      ...COMM_LIST.filter((c) => !client.comms[c.id]).map((c) => ({ ...c, cat: "Comm" })),
                    ].slice(0, 5).map((item) => (
                      <div key={item.id} style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "8px 0", borderBottom: "1px solid #f5f5f7",
                        fontSize: 12, color: "#3a3a3c",
                      }}>
                        <span style={{ color: "#FF3B30" }}>○</span>
                        <span>{item.icon} {item.label}</span>
                      </div>
                    ))}
                    {[
                      ...DOCUMENT_LIST.filter((d) => !client.docs[d.id]),
                      ...INFO_LIST.filter((i) => !client.infos[i.id]),
                      ...COMM_LIST.filter((c) => !client.comms[c.id]),
                    ].length === 0 && (
                      <div style={{ fontSize: 13, color: "#34C759", fontWeight: 600 }}>✅ Dossier complet !</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* RELANCES */}
        {view === "relances" && currentUser.role === "admin" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1d1d1f", margin: 0, letterSpacing: -0.5 }}>Scénarios de relance</h1>
              <p style={{ fontSize: 14, color: "#86868b", margin: "4px 0 0" }}>Configurez vos relances automatiques</p>
            </div>
            {relanceTemplates.map((tpl) => (
              <div key={tpl.id} style={{
                background: "white", borderRadius: 16, padding: 20,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 12,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1f" }}>{tpl.name}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{
                      padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: tpl.channel === "email" ? "#0071e312" : tpl.channel === "sms" ? "#34C75912" : "#25D36612",
                      color: tpl.channel === "email" ? "#0071e3" : tpl.channel === "sms" ? "#34C759" : "#25D366",
                    }}>
                      {tpl.channel === "email" ? "📧 Email" : tpl.channel === "sms" ? "💬 SMS" : "📱 WhatsApp"}
                    </span>
                    <span style={{
                      padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: "#f2f2f7", color: "#86868b",
                    }}>J+{tpl.delay}</span>
                  </div>
                </div>
                <textarea
                  value={tpl.message}
                  onChange={(e) => setRelanceTemplates((prev) => prev.map((t) => t.id === tpl.id ? { ...t, message: e.target.value } : t))}
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #d1d1d6",
                    fontSize: 13, color: "#3a3a3c", resize: "none", height: 70,
                    boxSizing: "border-box", outline: "none", lineHeight: 1.5,
                  }}
                />
                <div style={{ fontSize: 11, color: "#86868b", marginTop: 6 }}>
                  Utilisez <strong>{"{nom}"}</strong> pour personnaliser avec le nom du client
                </div>
              </div>
            ))}
            <button onClick={() => showNotif("Scénarios sauvegardés !")} style={{
              padding: "12px 28px", borderRadius: 12, border: "none",
              background: "linear-gradient(135deg, #0071e3, #00c7be)",
              color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer",
              boxShadow: "0 4px 14px rgba(0,113,227,0.3)",
            }}>Sauvegarder les scénarios</button>
          </div>
        )}

        {/* TEAM */}
        {view === "team" && currentUser.role === "admin" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1d1d1f", margin: 0, letterSpacing: -0.5 }}>Équipe commerciale</h1>
              <p style={{ fontSize: 14, color: "#86868b", margin: "4px 0 0" }}>Vue d'ensemble par conseiller</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
              {ADVISORS.map((advisor) => {
                const adClients = clients.filter((c) => c.advisor === advisor);
                const complete = adClients.filter((c) => c.status === "complete").length;
                return (
                  <div key={advisor} style={{
                    background: "white", borderRadius: 16, padding: 24,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: "linear-gradient(135deg, #0071e320, #00c7be20)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 22, marginBottom: 12,
                    }}>👤</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#1d1d1f" }}>{advisor}</div>
                    <div style={{ fontSize: 13, color: "#86868b", marginTop: 4 }}>Conseiller commercial</div>
                    <div style={{
                      display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16,
                    }}>
                      <div style={{ background: "#f5f5f7", borderRadius: 10, padding: 10, textAlign: "center" }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: "#0071e3" }}>{adClients.length}</div>
                        <div style={{ fontSize: 10, color: "#86868b" }}>Dossiers</div>
                      </div>
                      <div style={{ background: "#f5f5f7", borderRadius: 10, padding: 10, textAlign: "center" }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: "#34C759" }}>{complete}</div>
                        <div style={{ fontSize: 10, color: "#86868b" }}>Complets</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckItem({ item, checked, onToggle }) {
  return (
    <div onClick={onToggle} style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "12px 0", borderBottom: "1px solid #f5f5f7",
      cursor: "pointer",
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
        background: checked ? "linear-gradient(135deg, #0071e3, #00c7be)" : "transparent",
        border: checked ? "none" : "2px solid #d1d1d6",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s",
      }}>
        {checked && <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>✓</span>}
      </div>
      <span style={{ fontSize: 22 }}>{item.icon}</span>
      <span style={{
        fontSize: 14, color: checked ? "#86868b" : "#1d1d1f",
        textDecoration: checked ? "line-through" : "none",
        transition: "all 0.2s",
      }}>{item.label}</span>
    </div>
  );
}
