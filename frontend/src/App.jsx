import { useState } from "react";
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel";

function App() {
  const [page, setPage] = useState("login");

  return (
    <>
      {page === "login" && (
        <Login onLogin={() => setPage("admin")} />
      )}

      {page === "admin" && <AdminPanel />}
    </>
  );
}

export default App;