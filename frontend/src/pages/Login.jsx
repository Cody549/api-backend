import { useState } from "react";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";

export default function Login({ onLogin, isLoading: externalLoading }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleLogin = async () => {
    // Reset error
    setError("");

    // Validaciones avanzadas
    if (!email.trim()) {
      setError("El correo electrónico es obligatorio");
      return;
    }

    if (!validateEmail(email)) {
      setError("Ingresa un correo electrónico válido");
      return;
    }

    if (!password) {
      setError("La contraseña es obligatoria");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Aquí iría tu lógica real de autenticación
      // const response = await fetch('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      
      setError("");
      onLogin({ email });
    } catch (err) {
      setError("Error al iniciar sesión. Verifica tus credenciales");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading) {
      handleLogin();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <LogIn size={32} color="#2563eb" />
          </div>
          <h1 style={styles.title}>Bienvenido</h1>
          <p style={styles.subtitle}>Inicia sesión para continuar</p>
        </div>

        <div style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <Mail size={16} />
              Correo electrónico
            </label>
            <input
              style={{ ...styles.input, ...(error?.includes("correo") && styles.inputError) }}
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <Lock size={16} />
              Contraseña
            </label>
            <input
              style={{ ...styles.input, ...(error?.includes("contraseña") && styles.inputError) }}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div style={styles.errorContainer}>
              <AlertCircle size={16} />
              <span style={styles.error}>{error}</span>
            </div>
          )}

          <button
            style={{
              ...styles.button,
              ...(isLoading && styles.buttonDisabled),
            }}
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <div style={styles.spinner} />
            ) : (
              "Iniciar sesión"
            )}
          </button>

          <div style={styles.footer}>
            <a href="#" style={styles.link}>¿Olvidaste tu contraseña?</a>
            <span style={styles.separator}>•</span>
            <a href="#" style={styles.link}>Crear cuenta</a>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px",
  },
  card: {
    background: "white",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "440px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    overflow: "hidden",
  },
  header: {
    padding: "40px 40px 20px 40px",
    textAlign: "center",
    borderBottom: "1px solid #f0f0f0",
  },
  iconContainer: {
    display: "inline-flex",
    padding: "12px",
    backgroundColor: "#eff6ff",
    borderRadius: "60px",
    marginBottom: "20px",
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: "28px",
    fontWeight: "600",
    color: "#1f2937",
  },
  subtitle: {
    margin: 0,
    fontSize: "14px",
    color: "#6b7280",
  },
  form: {
    padding: "30px 40px 40px 40px",
  },
  inputGroup: {
    marginBottom: "24px",
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "14px",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    transition: "all 0.2s ease",
    outline: "none",
    boxSizing: "border-box",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 12px",
    backgroundColor: "#fef2f2",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  error: {
    color: "#dc2626",
    fontSize: "13px",
    fontWeight: "500",
  },
  button: {
    width: "100%",
    padding: "12px 24px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginTop: "8px",
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  spinner: {
    width: "20px",
    height: "20px",
    border: "2px solid white",
    borderTopColor: "transparent",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    margin: "0 auto",
  },
  footer: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    marginTop: "24px",
    fontSize: "13px",
  },
  link: {
    color: "#6b7280",
    textDecoration: "none",
    transition: "color 0.2s ease",
  },
  separator: {
    color: "#d1d5db",
  },
};

// Agrega esto a tu CSS global o al componente
const globalStyles = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .button:hover {
    background-color: #1d4ed8;
    transform: translateY(-1px);
  }
  
  .input:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  
  .link:hover {
    color: #2563eb;
  }
`;

// Inyecta los estilos globales (puedes mover esto a tu archivo CSS principal)
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = globalStyles;
  document.head.appendChild(styleSheet);
}