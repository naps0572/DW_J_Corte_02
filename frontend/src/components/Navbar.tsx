import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div>
        <h1>Sistema de Soporte</h1>
        <p>{user ? `Bienvenido, ${user.name}` : 'Gestiona tickets fácilmente'}</p>
      </div>
      <nav>
        {user ? (
          <>
            <Link to="/">Dashboard</Link>
            <Link to="/tickets/new">Nuevo ticket</Link>
            <button className="secondary-btn" onClick={logout}>Cerrar sesión</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Registro</Link>
          </>
        )}
      </nav>
    </header>
  );
}
