import { useState } from "react";

export default function AdminPanel() {
  const [menu, setMenu] = useState("dashboard");

  return (
    <div style={styles.container}>
      
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2>Admin</h2>

        <button onClick={() => setMenu("dashboard")}>Dashboard</button>
        <button onClick={() => setMenu("users")}>Usuarios</button>
        <button onClick={() => setMenu("settings")}>Settings</button>
      </div>

      {/* CONTENT */}
      <div style={styles.content}>
        {menu === "dashboard" && (
          <h1 className="fade">📊 Dashboard</h1>
        )}

        {menu === "users" && (
          <h1 className="fade">👤 Usuarios</h1>
        )}

        {menu === "settings" && (
          <h1 className="fade">⚙ Configuración</h1>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    background: "#0f172a",
    color: "white",
  },
  sidebar: {
    width: 200,
    background: "#111827",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
};