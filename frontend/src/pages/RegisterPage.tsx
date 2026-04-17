import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el usuario');
    }
  }

  return (
    <section className="auth-card">
      <h2>Crear cuenta</h2>
      <p>Registra un usuario para comenzar a reportar tickets.</p>
      <form onSubmit={handleSubmit} className="form-grid">
        <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Nombre" required />
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Correo" required />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Contraseña" required minLength={6} />
        {error && <div className="alert error">{error}</div>}
        <button type="submit">Registrarme</button>
      </form>
      <small>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </small>
    </section>
  );
}
