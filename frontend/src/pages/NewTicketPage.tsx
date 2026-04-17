import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

interface Category {
  id: number;
  name: string;
}

export function NewTicketPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await apiFetch<Category[]>('/categories', { token });
        setCategories(data);
        if (data.length) setCategoryId(data[0].id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las categorías');
      }
    }

    loadCategories();
  }, [token]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    try {
      await apiFetch('/tickets', {
        method: 'POST',
        token,
        body: JSON.stringify({
          title,
          description,
          priority,
          categoryId: Number(categoryId)
        })
      });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el ticket');
    }
  }

  return (
    <section className="card form-card">
      <h2>Crear nuevo ticket</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" placeholder="Título del caso" required />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe el problema" rows={5} required />
        <select value={priority} onChange={(e) => setPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}>
          <option value="LOW">Baja</option>
          <option value="MEDIUM">Media</option>
          <option value="HIGH">Alta</option>
        </select>
        <select value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))}>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        {error && <div className="alert error">{error}</div>}
        <button type="submit">Guardar ticket</button>
      </form>
    </section>
  );
}
