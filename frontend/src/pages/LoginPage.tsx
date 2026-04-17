import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
    }
  }

  return (
    <section className="auth-card">
      <h2>Iniciar sesión</h2>
      <p>Usa las credenciales de demo o crea una cuenta nueva.</p>
      <form onSubmit={handleSubmit} className="form-grid">
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Correo" required />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Contraseña" required />
        {error && <div className="alert error">{error}</div>}
        <button type="submit">Ingresar</button>
      </form>
      <small>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </small>
    </section>
  );
}
